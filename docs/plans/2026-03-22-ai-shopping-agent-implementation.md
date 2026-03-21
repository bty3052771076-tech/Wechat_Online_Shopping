# AI 购物助手智能体 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI shopping agent to the WeChat Mini Program that uses PPIO's OpenAI-compatible API to help users find products via natural language conversation and provide product detail page links for ordering.

**Architecture:** Backend proxy pattern — Express backend receives user messages, orchestrates PPIO LLM calls with Function Calling (searchProducts tool), queries MySQL for matching products, and streams responses back to the Mini Program frontend via SSE. Conversation history is persisted in two new MySQL tables (`chat_sessions`, `chat_messages`).

**Tech Stack:** Node.js/Express, Sequelize ORM, MySQL, openai npm package (PPIO-compatible), WeChat Mini Program (native) + TDesign Weapp, SSE via `wx.request` + `enableChunked`.

---

## Task 1: Install openai dependency

**Files:**
- Modify: `backend/package.json`

**Step 1: Install the openai npm package**

Run:
```bash
cd E:/AI/cc+glm/backend && npm install openai
```

Expected: `openai` added to `dependencies` in `package.json`.

**Step 2: Verify installation**

Run:
```bash
cd E:/AI/cc+glm/backend && node -e "const { OpenAI } = require('openai'); console.log('openai OK');"
```

Expected: Prints `openai OK`.

**Step 3: Add PPIO env vars to .env**

Append to `backend/.env`:
```
# PPIO AI 配置
PPIO_API_KEY=your-ppio-api-key
PPIO_BASE_URL=https://api.ppio.com/openai
PPIO_MODEL=deepseek/deepseek-r1
```

**Step 4: Commit**

```bash
cd E:/AI/cc+glm && git add backend/package.json backend/package-lock.json backend/.env
git commit -m "chore: add openai dependency and PPIO env vars for AI agent"
```

---

## Task 2: Create Sequelize models — ChatSession & ChatMessage

**Files:**
- Create: `backend/src/models/ChatSession.js`
- Create: `backend/src/models/ChatMessage.js`
- Modify: `backend/src/models/index.js`

**Step 1: Write ChatSession model**

Create `backend/src/models/ChatSession.js`:
```javascript
const { BIGINT, STRING, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

// AI 购物助手会话表
const ChatSession = sequelize.define('ChatSession', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '用户ID，关联 users.id'
  },
  title: {
    type: STRING(100),
    allowNull: false,
    defaultValue: 'New Chat',
    comment: '会话标题，取首条消息前20字'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：1=active, 0=deleted'
  }
}, {
  tableName: 'chat_sessions',
  comment: 'AI购物助手会话表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'status'],
      name: 'idx_user_status'
    }
  ]
});

module.exports = ChatSession;
```

**Step 2: Write ChatMessage model**

Create `backend/src/models/ChatMessage.js`:
```javascript
const { BIGINT, STRING, TEXT, JSON: JSON_TYPE } = require('sequelize');
const sequelize = require('../config/database');

// AI 购物助手消息表
const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  session_id: {
    type: BIGINT,
    allowNull: false,
    comment: '会话ID，关联 chat_sessions.id'
  },
  role: {
    type: STRING(20),
    allowNull: false,
    comment: '消息角色：user 或 assistant'
  },
  content: {
    type: TEXT,
    allowNull: false,
    comment: '消息文本内容'
  },
  metadata: {
    type: JSON_TYPE,
    allowNull: true,
    defaultValue: null,
    comment: '结构化数据，如商品推荐列表 {products: [...]}'
  }
}, {
  tableName: 'chat_messages',
  comment: 'AI购物助手消息表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['session_id', 'created_at'],
      name: 'idx_session_created'
    }
  ]
});

module.exports = ChatMessage;
```

**Step 3: Register models and associations in index.js**

Add to `backend/src/models/index.js` — after existing imports (line ~17), add:
```javascript
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');
```

After existing associations (before `module.exports`), add:
```javascript
// ChatSession 和 User 的关联
ChatSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatSession, { foreignKey: 'user_id', as: 'chatSessions' });

// ChatMessage 和 ChatSession 的关联
ChatMessage.belongsTo(ChatSession, { foreignKey: 'session_id', as: 'session' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'session_id', as: 'messages' });
```

Add `ChatSession` and `ChatMessage` to `module.exports`.

**Step 4: Verify models load without error**

Run:
```bash
cd E:/AI/cc+glm/backend && node -e "require('./src/models'); console.log('models OK');"
```

Expected: Prints `models OK` (Sequelize syncs tables on startup via `database.js`).

**Step 5: Commit**

```bash
cd E:/AI/cc+glm && git add backend/src/models/ChatSession.js backend/src/models/ChatMessage.js backend/src/models/index.js
git commit -m "feat: add ChatSession and ChatMessage Sequelize models for AI agent"
```

---

## Task 3: Create System Prompt config

**Files:**
- Create: `backend/src/config/agent-prompt.js`

**Step 1: Write agent prompt config**

Create `backend/src/config/agent-prompt.js`:
```javascript
// AI 购物助手 System Prompt 与工具定义

const SYSTEM_PROMPT = `你是一个微信小程序商城的AI购物助手。你的职责是帮助用户找到合适的商品。

## 能力范围
- 根据用户描述的需求搜索和推荐商品
- 帮助用户对比不同商品的特点
- 提供商品详情页链接供用户下单

## 行为准则
1. 当用户表达购物意图时，调用 searchProducts 工具搜索商品
2. 推荐商品时简洁说明每款商品的亮点，不超过3-5款
3. 引导用户点击商品卡片查看详情并下单
4. 如果搜索不到符合条件的商品，诚实告知并建议调整条件
5. 不要编造不存在的商品信息
6. 价格以元为单位展示，保留两位小数
7. 对于超出能力范围的问题（如订单查询、售后等），礼貌告知暂不支持并建议联系客服

## 风格
- 友好、简洁、有亲和力
- 使用口语化表达，避免过于正式
- 适当使用emoji增加趣味性`;

// Function Calling 工具定义
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'searchProducts',
      description: '在商城中搜索商品。当用户表达了购物意图、想找某类商品、或需要商品推荐时调用此工具。',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          category: { type: 'string', description: '商品分类名称' },
          priceMin: { type: 'integer', description: '最低价格（分）' },
          priceMax: { type: 'integer', description: '最高价格（分）' },
          sortBy: {
            type: 'string',
            enum: ['price_asc', 'price_desc', 'sales', 'newest'],
            description: '排序方式'
          }
        },
        required: []
      }
    }
  }
];

// 上下文窗口大小（最近N条消息）
const CONTEXT_WINDOW_SIZE = 20;

// 单用户限流：每分钟最多发送消息数
const RATE_LIMIT_PER_MINUTE = 10;

// 单条消息最大字符数
const MAX_MESSAGE_LENGTH = 500;

// 每用户最大活跃会话数
const MAX_SESSIONS_PER_USER = 50;

module.exports = {
  SYSTEM_PROMPT,
  TOOLS,
  CONTEXT_WINDOW_SIZE,
  RATE_LIMIT_PER_MINUTE,
  MAX_MESSAGE_LENGTH,
  MAX_SESSIONS_PER_USER,
};
```

**Step 2: Commit**

```bash
cd E:/AI/cc+glm && git add backend/src/config/agent-prompt.js
git commit -m "feat: add AI agent system prompt and tool definitions config"
```

---

## Task 4: Create agent service — PPIO integration & product search

**Files:**
- Create: `backend/src/services/agent.service.js`

**Step 1: Write the agent service**

Create `backend/src/services/agent.service.js`:
```javascript
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

    // 第二次调用（流式）���基于工具结果生成回复
    const stream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta.content || '';
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
```

**Step 2: Commit**

```bash
cd E:/AI/cc+glm && git add backend/src/services/agent.service.js
git commit -m "feat: add agent service with PPIO integration and product search tool"
```

---

## Task 5: Create agent controller

**Files:**
- Create: `backend/src/controllers/agent.controller.js`

**Step 1: Write the agent controller**

Create `backend/src/controllers/agent.controller.js`:
```javascript
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { buildMessages, chatCompletionStream } = require('../services/agent.service');
const {
  MAX_MESSAGE_LENGTH,
  MAX_SESSIONS_PER_USER,
  RATE_LIMIT_PER_MINUTE,
} = require('../config/agent-prompt');

// 简单内存限流（生产环境应使用 Redis）
const rateLimitMap = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const key = `agent:${userId}`;
  const record = rateLimitMap.get(key) || { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  return record.count <= RATE_LIMIT_PER_MINUTE;
}

class AgentController {
  /**
   * POST /api/agent/chat — 发送消息（SSE 流式响应）
   */
  async chat(req, res, next) {
    try {
      const userId = req.user.id;
      const { sessionId, message } = req.body;

      // 参数校验
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return errorResponse(res, 400, 'InvalidParam', '消息内容不能为空');
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        return errorResponse(res, 400, 'InvalidParam', `消息不能超过${MAX_MESSAGE_LENGTH}字`);
      }

      // 限流检查
      if (!checkRateLimit(userId)) {
        return errorResponse(res, 429, 'RateLimit', '发送太频繁，请稍后再试');
      }

      // 获取或创建会话
      let session;
      if (sessionId) {
        session = await ChatSession.findOne({
          where: { id: sessionId, user_id: userId, status: 1 },
        });
        if (!session) {
          return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
        }
      } else {
        // 检查会话上限
        const sessionCount = await ChatSession.count({
          where: { user_id: userId, status: 1 },
        });
        if (sessionCount >= MAX_SESSIONS_PER_USER) {
          return errorResponse(res, 400, 'SessionLimit', `会话数量已达上限(${MAX_SESSIONS_PER_USER})`);
        }

        session = await ChatSession.create({
          user_id: userId,
          title: message.trim().slice(0, 20),
        });
      }

      // 保存用户消息
      await ChatMessage.create({
        session_id: session.id,
        role: 'user',
        content: message.trim(),
      });

      // 获取历史消息
      const historyMessages = await ChatMessage.findAll({
        where: { session_id: session.id },
        order: [['created_at', 'ASC']],
        attributes: ['role', 'content'],
      });

      // 构建 LLM messages（排除刚插入的最后一条，因为 buildMessages 会自己追加）
      const historyForLLM = historyMessages.slice(0, -1).map((m) => m.toJSON());
      const messages = buildMessages(historyForLLM, message.trim());

      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      let fullContent = '';
      let products = null;

      // 流式调用 LLM
      const result = await chatCompletionStream(
        messages,
        // onDelta — 文本增量
        (delta) => {
          fullContent += delta;
          res.write(`event: delta\ndata: ${JSON.stringify({ content: delta })}\n\n`);
        },
        // onProducts — 商品搜索结果
        (productList) => {
          products = productList;
          res.write(`event: products\ndata: ${JSON.stringify({ products: productList })}\n\n`);
        },
      );

      // 如果 chatCompletionStream 内部累积了 content 但 onDelta 未使用
      if (!fullContent && result.content) {
        fullContent = result.content;
      }
      if (!products && result.products) {
        products = result.products;
      }

      // 保存 AI 回复
      const assistantMessage = await ChatMessage.create({
        session_id: session.id,
        role: 'assistant',
        content: fullContent,
        metadata: products ? { products } : null,
      });

      // 发送完成事件
      res.write(`event: done\ndata: ${JSON.stringify({
        sessionId: session.id,
        messageId: assistantMessage.id,
      })}\n\n`);

      res.end();
    } catch (error) {
      // SSE 模式下的错误处理
      if (res.headersSent) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: '抱歉，我暂时开小差了，请稍后再试' })}\n\n`);
        res.end();
      } else {
        next(error);
      }
    }
  }

  /**
   * GET /api/agent/sessions — 获取会话列表
   */
  async getSessions(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      const limit = parseInt(pageSize, 10);

      const { count, rows } = await ChatSession.findAndCountAll({
        where: { user_id: userId, status: 1 },
        order: [['updated_at', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'title', 'updated_at'],
      });

      return paginatedResponse(res, 200, '获取成功', rows, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        total: count,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/agent/sessions/:id/messages — 获取会话历史消息
   */
  async getMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { page = 1, pageSize = 50 } = req.query;

      // 验证会话属于当前用户
      const session = await ChatSession.findOne({
        where: { id, user_id: userId, status: 1 },
      });
      if (!session) {
        return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      const limit = parseInt(pageSize, 10);

      const { count, rows } = await ChatMessage.findAndCountAll({
        where: { session_id: id },
        order: [['created_at', 'ASC']],
        limit,
        offset,
        attributes: ['id', 'role', 'content', 'metadata', 'created_at'],
      });

      return paginatedResponse(res, 200, '获取成功', rows, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        total: count,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/agent/sessions/:id — 删除会话（软删除）
   */
  async deleteSession(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const session = await ChatSession.findOne({
        where: { id, user_id: userId, status: 1 },
      });
      if (!session) {
        return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
      }

      await session.update({ status: 0 });

      return successResponse(res, 200, '会话已删除');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgentController();
```

**Step 2: Commit**

```bash
cd E:/AI/cc+glm && git add backend/src/controllers/agent.controller.js
git commit -m "feat: add agent controller with SSE chat, sessions CRUD"
```

---

## Task 6: Create agent route and mount in app.js

**Files:**
- Create: `backend/src/routes/agent.js`
- Modify: `backend/src/app.js`

**Step 1: Write the agent route**

Create `backend/src/routes/agent.js`:
```javascript
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const agentController = require('../controllers/agent.controller');

// 所有 agent 接口都需要用户认证
router.post('/chat', authenticate, agentController.chat);
router.get('/sessions', authenticate, agentController.getSessions);
router.get('/sessions/:id/messages', authenticate, agentController.getMessages);
router.delete('/sessions/:id', authenticate, agentController.deleteSession);

module.exports = router;
```

**Step 2: Mount route in app.js**

In `backend/src/app.js`, add after line 13 (`const addressRoutes = ...`):
```javascript
const agentRoutes = require('./routes/agent');
```

Add after line 40 (`app.use('/api/addresses', addressRoutes);`):
```javascript
app.use('/api/agent', agentRoutes);
```

**Step 3: Verify server starts**

Run:
```bash
cd E:/AI/cc+glm/backend && node -e "const app = require('./src/app'); console.log('app OK');"
```

Expected: Prints `app OK`.

**Step 4: Commit**

```bash
cd E:/AI/cc+glm && git add backend/src/routes/agent.js backend/src/app.js
git commit -m "feat: mount /api/agent routes in Express app"
```

---

## Task 7: Write backend unit tests

**Files:**
- Create: `backend/tests/agent.test.js`

**Step 1: Write tests for sessions and messages endpoints**

Create `backend/tests/agent.test.js`:
```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { startServer } = require('../src/app');

let server;
let api;

test.before(async () => {
  server = await new Promise((resolve, reject) => {
    const instance = startServer(0);
    instance.once('listening', () => resolve(instance));
    instance.once('error', reject);
  });

  const { port } = server.address();
  api = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
    timeout: 15000,
    validateStatus: () => true,
  });
});

test.after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function login() {
  const res = await api.post('/api/users/login', {
    username: 'testuser',
    password: '123456',
  });
  assert.equal(res.status, 200, 'login should succeed');
  return res.data.data.token;
}

test('GET /api/agent/sessions requires authentication', async () => {
  const res = await api.get('/api/agent/sessions');
  assert.equal(res.status, 401);
});

test('GET /api/agent/sessions returns empty list for new user', async () => {
  const token = await login();
  const res = await api.get('/api/agent/sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.code, 'Success');
  assert.ok(Array.isArray(res.data.data));
});

test('POST /api/agent/chat rejects empty message', async () => {
  const token = await login();
  const res = await api.post(
    '/api/agent/chat',
    { message: '' },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(res.status, 400);
  assert.equal(res.data.code, 'InvalidParam');
});

test('POST /api/agent/chat rejects message exceeding max length', async () => {
  const token = await login();
  const longMsg = 'a'.repeat(501);
  const res = await api.post(
    '/api/agent/chat',
    { message: longMsg },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(res.status, 400);
  assert.equal(res.data.code, 'InvalidParam');
});

test('DELETE /api/agent/sessions/999999 returns not found', async () => {
  const token = await login();
  const res = await api.delete('/api/agent/sessions/999999', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 404);
});

test('GET /api/agent/sessions/999999/messages returns not found', async () => {
  const token = await login();
  const res = await api.get('/api/agent/sessions/999999/messages', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 404);
});
```

**Step 2: Run tests**

Run:
```bash
cd E:/AI/cc+glm/backend && node --test tests/agent.test.js
```

Expected: All tests pass (6 pass, 0 fail).

**Step 3: Run full backend test suite to verify no regressions**

Run:
```bash
cd E:/AI/cc+glm/backend && node --test tests/*.test.js
```

Expected: All 26 tests pass (20 existing + 6 new).

**Step 4: Commit**

```bash
cd E:/AI/cc+glm && git add backend/tests/agent.test.js
git commit -m "test: add backend unit tests for AI agent endpoints"
```

---

## Task 8: Create frontend agent service (SSE request)

**Files:**
- Create: `Wechat_Online_Shopping/services/agent/agent.js`

**Step 1: Write the frontend agent service**

Create `Wechat_Online_Shopping/services/agent/agent.js`:
```javascript
const config = require('../../config/index');
const { requestJson } = require('../_utils/request');

/**
 * 获取 API 基础 URL
 */
function getBaseUrl() {
  return config.baseUrl || 'http://localhost:3000';
}

/**
 * 获取认证 token
 */
function getToken() {
  return wx.getStorageSync('token') || '';
}

/**
 * 发送聊天消息（SSE 流式）
 * @param {object} options
 * @param {number|null} options.sessionId - 会话ID，null 则新建
 * @param {string} options.message - 用户消息
 * @param {function} options.onDelta - 文本增量回调 (text: string) => void
 * @param {function} options.onProducts - 商品推荐回调 (products: object[]) => void
 * @param {function} options.onDone - 完成回调 ({ sessionId, messageId }) => void
 * @param {function} options.onError - 错误回调 (errMsg: string) => void
 * @returns {object} requestTask — 可调用 .abort() 取消请求
 */
function sendChatMessage({ sessionId, message, onDelta, onProducts, onDone, onError }) {
  const token = getToken();
  if (!token) {
    if (onError) onError('未登录');
    return null;
  }

  let buffer = ''; // SSE 解析缓冲区

  const requestTask = wx.request({
    url: `${getBaseUrl()}/api/agent/chat`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    data: { sessionId, message },
    enableChunked: true,
    responseType: 'text',
    success() {},
    fail(err) {
      if (onError) onError(err.errMsg || '网络错误');
    },
  });

  // 监听分块数据
  if (requestTask && typeof requestTask.onChunkReceived === 'function') {
    requestTask.onChunkReceived((response) => {
      // response.data 是 ArrayBuffer，转为字符串
      const text = arrayBufferToString(response.data);
      buffer += text;

      // 按 \n\n 分割 SSE 事件
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // 最后一段可能不完整，留在 buffer

      for (const part of parts) {
        if (!part.trim()) continue;
        const parsed = parseSSEEvent(part);
        if (!parsed) continue;

        if (parsed.event === 'delta' && onDelta) {
          try {
            const data = JSON.parse(parsed.data);
            onDelta(data.content || '');
          } catch (e) { /* ignore parse error */ }
        } else if (parsed.event === 'products' && onProducts) {
          try {
            const data = JSON.parse(parsed.data);
            onProducts(data.products || []);
          } catch (e) { /* ignore */ }
        } else if (parsed.event === 'done' && onDone) {
          try {
            const data = JSON.parse(parsed.data);
            onDone(data);
          } catch (e) { /* ignore */ }
        } else if (parsed.event === 'error' && onError) {
          try {
            const data = JSON.parse(parsed.data);
            onError(data.message || '未知错误');
          } catch (e) {
            onError('未知错误');
          }
        }
      }
    });
  }

  return requestTask;
}

/**
 * ArrayBuffer 转字符串
 */
function arrayBufferToString(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  // 处理 UTF-8 多字节字符
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
}

/**
 * 解析单个 SSE 事件块
 * @param {string} chunk - "event: xxx\ndata: yyy"
 * @returns {{ event: string, data: string } | null}
 */
function parseSSEEvent(chunk) {
  let event = 'message';
  let data = '';

  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('event: ')) {
      event = line.slice(7).trim();
    } else if (line.startsWith('data: ')) {
      data = line.slice(6);
    }
  }

  if (!data) return null;
  return { event, data };
}

/**
 * 获取会话列表
 */
function getSessions(page = 1, pageSize = 20) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

/**
 * 获取会话历史消息
 */
function getSessionMessages(sessionId, page = 1, pageSize = 50) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions/${sessionId}/messages?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

/**
 * 删除会话
 */
function deleteSession(sessionId) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions/${sessionId}`,
    method: 'DELETE',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

module.exports = {
  sendChatMessage,
  getSessions,
  getSessionMessages,
  deleteSession,
  parseSSEEvent,
  arrayBufferToString,
};
```

**Step 2: Commit**

```bash
cd E:/AI/cc+glm && git add Wechat_Online_Shopping/services/agent/agent.js
git commit -m "feat: add frontend agent service with SSE streaming support"
```

---

## Task 9: Create product-card component

**Files:**
- Create: `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.js`
- Create: `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.wxml`
- Create: `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.wxss`
- Create: `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.json`

**Step 1: Write the component JSON config**

Create `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.json`:
```json
{
  "component": true,
  "usingComponents": {}
}
```

**Step 2: Write the component JS**

Create `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.js`:
```javascript
Component({
  properties: {
    // 商品数据: { id, title, priceYuan, image, url }
    product: {
      type: Object,
      value: {},
    },
  },
  methods: {
    // 点击"去看看"跳转商品详情页
    onTapView() {
      const { url } = this.data.product || {};
      if (url) {
        wx.navigateTo({ url });
      }
    },
  },
});
```

**Step 3: Write the component template**

Create `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.wxml`:
```html
<view class="product-card" bind:tap="onTapView">
  <image class="product-image" src="{{product.image}}" mode="aspectFill" />
  <view class="product-info">
    <text class="product-title">{{product.title}}</text>
    <text class="product-price">¥{{product.priceYuan}}</text>
  </view>
  <view class="product-action">
    <text class="btn-view">去看看</text>
  </view>
</view>
```

**Step 4: Write the component styles**

Create `Wechat_Online_Shopping/pages/ai-agent/components/product-card/index.wxss`:
```css
.product-card {
  width: 240rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.product-image {
  width: 240rpx;
  height: 240rpx;
}

.product-info {
  padding: 12rpx 16rpx 0;
}

.product-title {
  font-size: 24rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-price {
  display: block;
  font-size: 28rpx;
  color: #fa550f;
  font-weight: bold;
  margin-top: 8rpx;
}

.product-action {
  padding: 12rpx 16rpx 16rpx;
}

.btn-view {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #fff;
  background: #fa550f;
  border-radius: 24rpx;
  padding: 8rpx 0;
}
```

**Step 5: Commit**

```bash
cd E:/AI/cc+glm && git add Wechat_Online_Shopping/pages/ai-agent/components/product-card/
git commit -m "feat: add product-card component for AI agent chat"
```

---

## Task 10: Create AI chat page

**Files:**
- Create: `Wechat_Online_Shopping/pages/ai-agent/chat/index.json`
- Create: `Wechat_Online_Shopping/pages/ai-agent/chat/index.wxml`
- Create: `Wechat_Online_Shopping/pages/ai-agent/chat/index.wxss`
- Create: `Wechat_Online_Shopping/pages/ai-agent/chat/index.js`

**Step 1: Write page JSON config**

Create `Wechat_Online_Shopping/pages/ai-agent/chat/index.json`:
```json
{
  "navigationBarTitleText": "AI 购物助手",
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon",
    "t-toast": "tdesign-miniprogram/toast/toast",
    "product-card": "../components/product-card/index"
  }
}
```

**Step 2: Write page template**

Create `Wechat_Online_Shopping/pages/ai-agent/chat/index.wxml`:
```html
<!-- AI 购物助手对话页 -->
<view class="chat-page">
  <!-- 消息列表区 -->
  <scroll-view
    class="message-list"
    scroll-y
    scroll-into-view="{{scrollToView}}"
    enhanced
    show-scrollbar="{{false}}"
  >
    <!-- 欢迎语 -->
    <view class="welcome-msg" wx:if="{{messages.length === 0 && !loading}}">
      <view class="welcome-avatar">🤖</view>
      <view class="welcome-text">你好！我是AI购物助手，告诉我你想买什么吧~</view>
    </view>

    <!-- 消息气泡 -->
    <view
      wx:for="{{messages}}"
      wx:key="id"
      id="msg-{{item.id}}"
      class="message-row {{item.role === 'user' ? 'message-right' : 'message-left'}}"
    >
      <!-- AI 头像 -->
      <view class="avatar" wx:if="{{item.role === 'assistant'}}">🤖</view>

      <view class="bubble-wrap">
        <!-- 文本气泡 -->
        <view class="bubble {{item.role === 'user' ? 'bubble-user' : 'bubble-ai'}}">
          <text>{{item.content}}</text>
        </view>

        <!-- 商品卡片横向滚动（仅 AI 回复含商品时） -->
        <scroll-view
          class="product-scroll"
          scroll-x
          wx:if="{{item.metadata && item.metadata.products && item.metadata.products.length > 0}}"
        >
          <view class="product-scroll-inner">
            <product-card
              wx:for="{{item.metadata.products}}"
              wx:for-item="prod"
              wx:key="id"
              product="{{prod}}"
            />
          </view>
        </scroll-view>
      </view>

      <!-- 用户头像 -->
      <view class="avatar avatar-user" wx:if="{{item.role === 'user'}}">😊</view>
    </view>

    <!-- AI 正在输入 -->
    <view class="message-row message-left" wx:if="{{isTyping}}">
      <view class="avatar">🤖</view>
      <view class="bubble-wrap">
        <view class="bubble bubble-ai">
          <text>{{streamingText || '思考中...'}}</text>
          <view class="typing-indicator" wx:if="{{!streamingText}}">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>

        <!-- 流式商品卡片 -->
        <scroll-view
          class="product-scroll"
          scroll-x
          wx:if="{{streamingProducts.length > 0}}"
        >
          <view class="product-scroll-inner">
            <product-card
              wx:for="{{streamingProducts}}"
              wx:for-item="prod"
              wx:key="id"
              product="{{prod}}"
            />
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部占位，确保最后一条消息不被输入框遮挡 -->
    <view class="bottom-spacer" id="bottom-anchor"></view>
  </scroll-view>

  <!-- 底部输入区 -->
  <view class="input-bar">
    <input
      class="input-field"
      placeholder="想买点什么？说说看..."
      value="{{inputValue}}"
      bindinput="onInput"
      bindconfirm="onSend"
      confirm-type="send"
      disabled="{{isTyping}}"
    />
    <view class="send-btn {{inputValue.trim() && !isTyping ? 'send-btn-active' : ''}}" bind:tap="onSend">
      发送
    </view>
  </view>
</view>

<t-toast id="t-toast" />
```

**Step 3: Write page styles**

Create `Wechat_Online_Shopping/pages/ai-agent/chat/index.wxss`:
```css
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

/* 欢迎语 */
.welcome-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.welcome-avatar {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.welcome-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

/* 消息行 */
.message-row {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.message-left {
  flex-direction: row;
}

.message-right {
  flex-direction: row-reverse;
}

/* 头像 */
.avatar {
  width: 64rpx;
  height: 64rpx;
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #e8e8e8;
  border-radius: 50%;
}

.avatar-user {
  background: #dbeafe;
}

/* 气泡容器 */
.bubble-wrap {
  max-width: 75%;
  margin: 0 16rpx;
}

/* 气泡 */
.bubble {
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-all;
}

.bubble-user {
  background: #1677ff;
  color: #fff;
  border-top-right-radius: 4rpx;
}

.bubble-ai {
  background: #fff;
  color: #333;
  border-top-left-radius: 4rpx;
}

/* 商品卡片横向滚动 */
.product-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.product-scroll-inner {
  display: inline-flex;
  gap: 16rpx;
}

/* 打字动画 */
.typing-indicator {
  display: inline-flex;
  gap: 8rpx;
  margin-left: 8rpx;
  vertical-align: middle;
}

.typing-indicator .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #999;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator .dot:nth-child(3) { animation-delay: 0; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 底部占位 */
.bottom-spacer {
  height: 20rpx;
}

/* 底部输入区 */
.input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.input-field {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 16rpx;
  padding: 0 32rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #999;
  background: #f0f0f0;
  border-radius: 36rpx;
  flex-shrink: 0;
}

.send-btn-active {
  background: #1677ff;
  color: #fff;
}
```

**Step 4: Write page JS logic**

Create `Wechat_Online_Shopping/pages/ai-agent/chat/index.js`:
```javascript
const { sendChatMessage, getSessionMessages } = require('../../../services/agent/agent');
import Toast from 'tdesign-miniprogram/toast/index';

let messageIdCounter = 0; // 临时 ID 生成器（用于流式消息）

Page({
  data: {
    messages: [],         // 消息列表 [{id, role, content, metadata}]
    inputValue: '',       // 输入框内容
    isTyping: false,      // AI 是否正在回复
    streamingText: '',    // 流式接收的文本
    streamingProducts: [], // 流式接收的商品
    sessionId: null,      // 当前会话 ID
    scrollToView: '',     // 滚动锚点
  },

  _requestTask: null, // 当前 SSE 请求任务

  onLoad(options) {
    // 如果从历史会话进入，加载历史消息
    if (options && options.sessionId) {
      this.setData({ sessionId: parseInt(options.sessionId, 10) });
      this.loadHistory(parseInt(options.sessionId, 10));
    }
  },

  onUnload() {
    // 页面卸载时取消进行中的请求
    if (this._requestTask) {
      this._requestTask.abort();
      this._requestTask = null;
    }
  },

  // 加载历史消息
  async loadHistory(sessionId) {
    try {
      const res = await getSessionMessages(sessionId);
      if (res && res.code === 'Success' && res.data) {
        this.setData({
          messages: res.data,
          scrollToView: res.data.length > 0 ? `msg-${res.data[res.data.length - 1].id}` : '',
        });
      }
    } catch (err) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载历史消息失败',
      });
    }
  },

  // 输入框变化
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 发送消息
  onSend() {
    const message = this.data.inputValue.trim();
    if (!message || this.data.isTyping) return;

    // 检查登录态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.navigateTo({ url: '/pages/user/login/index' });
      return;
    }

    // 添加用户消息到列表
    messageIdCounter += 1;
    const userMsg = {
      id: `local-${messageIdCounter}`,
      role: 'user',
      content: message,
      metadata: null,
    };

    const updatedMessages = [...this.data.messages, userMsg];
    this.setData({
      messages: updatedMessages,
      inputValue: '',
      isTyping: true,
      streamingText: '',
      streamingProducts: [],
      scrollToView: `msg-${userMsg.id}`,
    });

    // 发送 SSE 请求
    this._requestTask = sendChatMessage({
      sessionId: this.data.sessionId,
      message,
      onDelta: (text) => {
        this.setData({
          streamingText: this.data.streamingText + text,
          scrollToView: 'bottom-anchor',
        });
      },
      onProducts: (products) => {
        this.setData({
          streamingProducts: products,
          scrollToView: 'bottom-anchor',
        });
      },
      onDone: (data) => {
        // 将流式内容转为正式消息
        messageIdCounter += 1;
        const aiMsg = {
          id: data.messageId || `local-${messageIdCounter}`,
          role: 'assistant',
          content: this.data.streamingText,
          metadata: this.data.streamingProducts.length > 0
            ? { products: this.data.streamingProducts }
            : null,
        };

        this.setData({
          messages: [...this.data.messages, aiMsg],
          isTyping: false,
          streamingText: '',
          streamingProducts: [],
          sessionId: data.sessionId || this.data.sessionId,
          scrollToView: `msg-${aiMsg.id}`,
        });

        this._requestTask = null;
      },
      onError: (errMsg) => {
        // 错误时将已接收内容保存为消息（如有）
        if (this.data.streamingText) {
          messageIdCounter += 1;
          const partialMsg = {
            id: `local-${messageIdCounter}`,
            role: 'assistant',
            content: this.data.streamingText + '\n\n[回复中断，请重新发送]',
            metadata: this.data.streamingProducts.length > 0
              ? { products: this.data.streamingProducts }
              : null,
          };
          this.setData({
            messages: [...this.data.messages, partialMsg],
          });
        }

        this.setData({
          isTyping: false,
          streamingText: '',
          streamingProducts: [],
        });

        Toast({
          context: this,
          selector: '#t-toast',
          message: errMsg || '网络错误，请重试',
        });

        this._requestTask = null;
      },
    });
  },
});
```

**Step 5: Register page in app.json**

In `Wechat_Online_Shopping/app.json`, add a new subpackage entry after the existing `promotion` subpackage (around line 47):
```json
{
  "root": "pages/ai-agent",
  "name": "ai-agent",
  "pages": ["chat/index"]
}
```

**Step 6: Commit**

```bash
cd E:/AI/cc+glm && git add Wechat_Online_Shopping/pages/ai-agent/ Wechat_Online_Shopping/app.json
git commit -m "feat: add AI agent chat page with SSE streaming and product cards"
```

---

## Task 11: Add floating button to home page

**Files:**
- Modify: `Wechat_Online_Shopping/pages/home/home.wxml`
- Modify: `Wechat_Online_Shopping/pages/home/home.wxss`
- Modify: `Wechat_Online_Shopping/pages/home/home.js`

**Step 1: Add floating button to home.wxml**

At the end of `home.wxml` (before `</view>` is not applicable here — add after the last line, which is the closing `</view>`), append:
```html
<!-- AI 购物助手悬浮按钮 -->
<view class="ai-fab" bind:tap="onAiAgentTap">
  <text class="ai-fab-icon">🤖</text>
</view>
```

**Step 2: Add floating button styles to home.wxss**

Append to `home.wxss`:
```css
/* AI 购物助手悬浮按钮 */
.ai-fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(200rpx + env(safe-area-inset-bottom));
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.4);
  z-index: 100;
}

.ai-fab-icon {
  font-size: 48rpx;
}
```

**Step 3: Add tap handler to home.js**

Add new method to the Page object in `home.js` (after `goToAdminLogin` method, before the closing `});`):
```javascript
onAiAgentTap() {
  const token = wx.getStorageSync('token');
  if (!token) {
    wx.navigateTo({ url: '/pages/user/login/index' });
    return;
  }
  wx.navigateTo({ url: '/pages/ai-agent/chat/index' });
},
```

**Step 4: Commit**

```bash
cd E:/AI/cc+glm && git add Wechat_Online_Shopping/pages/home/home.wxml Wechat_Online_Shopping/pages/home/home.wxss Wechat_Online_Shopping/pages/home/home.js
git commit -m "feat: add AI agent floating button to home page"
```

---

## Task 12: Write frontend unit tests

**Files:**
- Create: `Wechat_Online_Shopping/tests/agent.test.cjs`

**Step 1: Write frontend agent tests**

Create `Wechat_Online_Shopping/tests/agent.test.cjs`:
```javascript
const test = require('node:test');
const assert = require('node:assert/strict');

// 测试 SSE 解析函数
const { parseSSEEvent, arrayBufferToString } = require('../services/agent/agent');

test('parseSSEEvent parses delta event correctly', () => {
  const chunk = 'event: delta\ndata: {"content":"hello"}';
  const result = parseSSEEvent(chunk);
  assert.deepStrictEqual(result, {
    event: 'delta',
    data: '{"content":"hello"}',
  });
});

test('parseSSEEvent parses products event correctly', () => {
  const chunk = 'event: products\ndata: {"products":[{"id":1,"title":"Test"}]}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'products');
  const data = JSON.parse(result.data);
  assert.equal(data.products.length, 1);
  assert.equal(data.products[0].id, 1);
});

test('parseSSEEvent parses done event correctly', () => {
  const chunk = 'event: done\ndata: {"sessionId":123,"messageId":456}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'done');
  const data = JSON.parse(result.data);
  assert.equal(data.sessionId, 123);
  assert.equal(data.messageId, 456);
});

test('parseSSEEvent returns null for empty data', () => {
  const chunk = 'event: delta';
  const result = parseSSEEvent(chunk);
  assert.equal(result, null);
});

test('parseSSEEvent defaults to message event when no event field', () => {
  const chunk = 'data: {"content":"fallback"}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'message');
});

test('arrayBufferToString converts ASCII ArrayBuffer to string', () => {
  const str = 'hello world';
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i);
  }
  const result = arrayBufferToString(buf.buffer);
  assert.equal(result, 'hello world');
});
```

**Step 2: Run frontend tests**

Run:
```bash
cd E:/AI/cc+glm/Wechat_Online_Shopping && node --test tests/agent.test.cjs
```

Expected: 6 tests pass.

**Step 3: Run full frontend test suite**

Run:
```bash
cd E:/AI/cc+glm/Wechat_Online_Shopping && node --test tests/*.test.cjs
```

Expected: 78 tests pass (72 existing + 6 new).

**Step 4: Commit**

```bash
cd E:/AI/cc+glm && git add Wechat_Online_Shopping/tests/agent.test.cjs
git commit -m "test: add frontend unit tests for AI agent SSE parser"
```

---

## Task 13: Create database tables

**Step 1: Sync models to create tables**

Run the backend once to let Sequelize auto-sync the new models:
```bash
cd E:/AI/cc+glm/backend && node -e "
  const sequelize = require('./src/config/database');
  require('./src/models');
  sequelize.sync({ alter: true }).then(() => {
    console.log('Tables synced');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
"
```

Expected: Prints `Tables synced`. The `chat_sessions` and `chat_messages` tables are created in MySQL.

**Step 2: Verify tables exist**

Use the MySQL MCP or run:
```bash
cd E:/AI/cc+glm/backend && node -e "
  const sequelize = require('./src/config/database');
  sequelize.query('SHOW TABLES LIKE \"chat_%\"').then(([rows]) => {
    console.log(rows);
    process.exit(0);
  });
"
```

Expected: Shows `chat_sessions` and `chat_messages`.

---

## Task 14: Final verification — run all tests

**Step 1: Run backend tests**

Run:
```bash
cd E:/AI/cc+glm/backend && node --test tests/*.test.js
```

Expected: All tests pass (20 existing + 6 new = 26).

**Step 2: Run frontend tests**

Run:
```bash
cd E:/AI/cc+glm/Wechat_Online_Shopping && node --test tests/*.test.cjs
```

Expected: All tests pass (72 existing + 6 new = 78).

**Step 3: Verify backend starts cleanly**

Run:
```bash
cd E:/AI/cc+glm/backend && timeout 5 node src/app.js 2>&1 || true
```

Expected: Server starts without errors, prints port and env info.

---

## Summary

| Task | Description | Files | Tests |
|------|-------------|-------|-------|
| 1 | Install openai, add env vars | package.json, .env | — |
| 2 | Sequelize models | ChatSession.js, ChatMessage.js, index.js | — |
| 3 | System Prompt config | agent-prompt.js | — |
| 4 | Agent service (PPIO + search) | agent.service.js | — |
| 5 | Agent controller (SSE + CRUD) | agent.controller.js | — |
| 6 | Agent route + mount | agent.js, app.js | — |
| 7 | Backend tests | agent.test.js | 6 tests |
| 8 | Frontend agent service (SSE) | agent.js | — |
| 9 | Product card component | product-card/* | — |
| 10 | AI chat page | chat/* + app.json | — |
| 11 | Home page floating button | home.wxml/wxss/js | — |
| 12 | Frontend tests | agent.test.cjs | 6 tests |
| 13 | Create DB tables | — (sync) | — |
| 14 | Final verification | — | All pass |
