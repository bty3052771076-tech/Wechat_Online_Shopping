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

// 上下文窗口大小（取最近N条消息作为对话历史）
const CONTEXT_WINDOW_SIZE = 20;
// 每分钟请求限制
const RATE_LIMIT_PER_MINUTE = 10;
// 单条消息最大长度
const MAX_MESSAGE_LENGTH = 500;
// 每用户最大会话数
const MAX_SESSIONS_PER_USER = 50;

module.exports = {
  SYSTEM_PROMPT,
  TOOLS,
  CONTEXT_WINDOW_SIZE,
  RATE_LIMIT_PER_MINUTE,
  MAX_MESSAGE_LENGTH,
  MAX_SESSIONS_PER_USER,
};
