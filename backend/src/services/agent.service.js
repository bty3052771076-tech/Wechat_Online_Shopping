const { OpenAI } = require('openai');
const { Op } = require('sequelize');
const ProductSpus = require('../models/ProductSpus');
const ProductSkus = require('../models/ProductSkus');
const Category = require('../models/Category');
const { SYSTEM_PROMPT, TOOLS, CONTEXT_WINDOW_SIZE } = require('../config/agent-prompt');
const { normalizeImageUrl, IMAGE_SCENES } = require('../utils/image');

// 初始化 PPIO OpenAI 兼容客户端
const client = new OpenAI({
  apiKey: process.env.PPIO_API_KEY,
  baseURL: process.env.PPIO_BASE_URL,
});

/**
 * 搜索商品 — Function Calling 工具的实际执行函数
 * @param {object} params - LLM 传递的搜索参数
 * @returns {object[]} 商品列表（精简字段）
 */
async function searchProducts(params = {}) {
  const { keyword, category, priceMin, priceMax, sortBy } = params;
  const where = { status: 1 };

  // 关键词搜索
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { subtitle: { [Op.like]: `%${keyword}%` } },
      { brand: { [Op.like]: `%${keyword}%` } },
    ];
  }

  // 分类搜索（按分类名模糊匹配）
  if (category) {
    const categories = await Category.findAll({
      where: {
        category_name: { [Op.like]: `%${category}%` },
        status: 1,
      },
      attributes: ['id'],
    });

    if (categories.length > 0) {
      where.category_id = { [Op.in]: categories.map((c) => c.id) };
    }
  }

  // 价格范围（前端传分，数据库存元）
  if (priceMin !== undefined || priceMax !== undefined) {
    where.min_sale_price = {};
    if (priceMin !== undefined) {
      where.min_sale_price[Op.gte] = Number(priceMin) / 100;
    }
    if (priceMax !== undefined) {
      where.min_sale_price[Op.lte] = Number(priceMax) / 100;
    }
  }

  // 排序
  let order = [['sold_num', 'DESC']]; // 默认按销量
  if (sortBy === 'price_asc') order = [['min_sale_price', 'ASC']];
  else if (sortBy === 'price_desc') order = [['min_sale_price', 'DESC']];
  else if (sortBy === 'newest') order = [['created_at', 'DESC']];

  const products = await ProductSpus.findAll({
    where,
    order,
    limit: 5,
    attributes: ['id', 'title', 'subtitle', 'min_sale_price', 'primary_image', 'sold_num'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['category_name'],
      },
    ],
  });

  // 返回精简数据给 LLM 上下文
  return products.map((p) => {
    const item = p.toJSON();
    return {
      id: item.id,
      title: item.title,
      price: Math.round(Number(item.min_sale_price) * 100), // 元转分
      priceYuan: Number(item.min_sale_price).toFixed(2),
      image: normalizeImageUrl(item.primary_image, IMAGE_SCENES.product),
      category: item.category ? item.category.category_name : '',
      soldNum: item.sold_num || 0,
      url: `/pages/goods/details/index?spuId=${item.id}`,
    };
  });
}

/**
 * 构建 LLM 请求的 messages 数组
 * @param {object[]} historyMessages - 数据库中的历史消息
 * @param {string} userMessage - 本次用户消息
 * @returns {object[]} OpenAI messages 格式
 */
function buildMessages(historyMessages, userMessage) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  // 取最近 CONTEXT_WINDOW_SIZE 条历史消息
  const recentMessages = historyMessages.slice(-CONTEXT_WINDOW_SIZE);
  for (const msg of recentMessages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // 追加本次用户消息
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

/**
 * 执行 Function Calling 工具调用
 * @param {string} toolName - 工具名称
 * @param {object} toolArgs - 工具参数
 * @returns {string} JSON 字符串结果
 */
async function executeTool(toolName, toolArgs) {
  if (toolName === 'searchProducts') {
    const results = await searchProducts(toolArgs);
    return JSON.stringify(results);
  }
  return JSON.stringify({ error: `Unknown tool: ${toolName}` });
}

/**
 * 发送非流式请求获取 LLM 响应（处理 Function Calling 循环）
 * @param {object[]} messages - 完整的 messages 数组
 * @returns {{ content: string, products: object[] | null }} 最终回复和商品列表
 */
async function chatCompletion(messages) {
  const model = process.env.PPIO_MODEL || 'deepseek/deepseek-r1';
  let products = null;

  // 第一次调用，可能触发 Function Calling
  let response = await client.chat.completions.create({
    model,
    messages,
    tools: TOOLS,
    max_tokens: 1024,
    temperature: 0.7,
  });

  let choice = response.choices[0];

  // 如果 LLM 请求调用工具
  if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
    // 将 assistant 的工具请求消息追加
    messages.push(choice.message);

    for (const toolCall of choice.message.tool_calls) {
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const toolResult = await executeTool(toolCall.function.name, toolArgs);

      // 如果是商品搜索，保存结果供前端渲染卡片
      if (toolCall.function.name === 'searchProducts') {
        products = JSON.parse(toolResult);
      }

      // 追加工具结果消息
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }

    // 第二次调用，让 LLM 基于工具结果生成最终回复
    response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    choice = response.choices[0];
  }

  return {
    content: choice.message.content || '',
    products,
  };
}

/**
 * 发送流式请求（SSE），处理 Function Calling + 流式输出
 * @param {object[]} messages - 完整的 messages 数组
 * @param {function} onDelta - 收到文本增量时的回调 (text: string) => void
 * @param {function} onProducts - 收到商品结果时的回调 (products: object[]) => void
 * @returns {string} 完整的回复文本
 */
async function chatCompletionStream(messages, onDelta, onProducts) {
  const model = process.env.PPIO_MODEL || 'deepseek/deepseek-r1';
  let products = null;

  // 第一次调用（非流式），检测是否需要工具调用
  const firstResponse = await client.chat.completions.create({
    model,
    messages,
    tools: TOOLS,
    max_tokens: 1024,
    temperature: 0.7,
    stream: false,
  });

  const firstChoice = firstResponse.choices[0];

  // 如果需要调用工具
  if (firstChoice.finish_reason === 'tool_calls' && firstChoice.message.tool_calls) {
    messages.push(firstChoice.message);

    for (const toolCall of firstChoice.message.tool_calls) {
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const toolResult = await executeTool(toolCall.function.name, toolArgs);

      if (toolCall.function.name === 'searchProducts') {
        products = JSON.parse(toolResult);
        if (onProducts && products.length > 0) {
          onProducts(products);
        }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }

    // 第二次调用（流式），基于工具结果生成回复
    const stream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      // 防御性检查：部分模型的流式 chunk 可能缺少 choices 或 delta
      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) {
        fullContent += delta;
        if (onDelta) onDelta(delta);
      }
    }

    return { content: fullContent, products };
  }

  // 无工具调用，直接返回第一次的结果（流式发送）
  const content = firstChoice.message.content || '';
  // 模拟分段推送，每50字一段
  const chunkSize = 50;
  for (let i = 0; i < content.length; i += chunkSize) {
    const delta = content.slice(i, i + chunkSize);
    if (onDelta) onDelta(delta);
  }

  return { content, products };
}

module.exports = {
  searchProducts,
  buildMessages,
  executeTool,
  chatCompletion,
  chatCompletionStream,
};
