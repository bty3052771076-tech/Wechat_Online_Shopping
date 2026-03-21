# AI 购物助手智能体 — 设计文档

> 日期: 2026-03-22
> 状态: 已批准，待实施

## 1. 概述

在微信小程序商城中新增 AI 购物助手智能体，通过自然语言对话帮助用户筛选商品并提供商品详情页链接，引导用户自行下单。

### 1.1 核心需求

- 对话式交互，用户用自然语言描述需求
- 智能体调用商品搜索工具，返回匹配商品
- 下单时提供商品详情页链接，用户自行跳转
- 对话历史持久化，支持多会话管理

### 1.2 能力边界（MVP）

- ✅ 商品搜索与推荐
- ✅ 提供商品详情页链接
- ❌ 订单查询 / 物流查询 / 售后咨询（后续扩展）

## 2. 技术选型

| 项目 | 选择 | 说明 |
|------|------|------|
| AI API | PPIO 派欧云 | OpenAI 兼容接口，base_url: `https://api.ppio.com/openai` |
| AI 模型 | 待定 | 通过环境变量 `PPIO_MODEL` 配置，可随时切换 |
| 架构模式 | 后端代理 | Express 后端作为中间层，安全持有 API Key |
| 流式传输 | SSE | 后端 SSE 推送，前端 `wx.request` + `enableChunked` 接收 |

## 3. 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   微信小程序前端                       │
│                                                     │
│  首页悬浮按钮 ──→ AI 对话页面 (pages/ai-agent/chat)   │
│                   ├ 消息列表 (支持文本 + 商品卡片)      │
│                   ├ 输入框 + 发送按钮                  │
│                   └ 历史会话列表入口                    │
└──────────────┬──────────────────────────────────────┘
               │ POST /api/agent/chat (SSE 流式)
               │ GET  /api/agent/sessions (会话列表)
               │ GET  /api/agent/sessions/:id/messages (历史消息)
               │ DELETE /api/agent/sessions/:id (删除会话)
┌──────────────▼──────────────────────────────────────┐
│                   Express 后端                        │
│                                                     │
│  agent.controller.js                                │
│    ├ 接收用户消息，组装 messages 上下文                 │
│    ├ 调用 PPIO API (OpenAI 兼容, Function Calling)    │
│    ├ 工具: searchProducts(keyword, category,          │
│    │        priceMin, priceMax, sortBy)               │
│    ├ LLM 决定是否调工具 → 执行查询 → 注入结果           │
│    ├ SSE 流式返回给前端                                │
│    └ 对话记录存 MySQL                                 │
└──────────────┬──────────────────────────────────────┘
               │ Sequelize ORM
┌──────────────▼──────────────────────────────────────┐
│  MySQL: chat_sessions / chat_messages / products     │
└─────────────────────────────────────────────────────┘
```

**触发设计**: 首页右下角悬浮按钮（AI 图标），点击 `navigateTo` 进入对话页。

## 4. 数据库设计

新增 2 张表，与现有模型共用 Sequelize 实例。

### 4.1 chat_sessions — 会话表

```sql
CREATE TABLE chat_sessions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,           -- 关联 users.id
  title       VARCHAR(100) DEFAULT 'New Chat', -- 会话标题（取首条消息摘要）
  status      TINYINT DEFAULT 1,               -- 1=active, 0=deleted
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 chat_messages — 消息表

```sql
CREATE TABLE chat_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id  INT UNSIGNED NOT NULL,           -- 关联 chat_sessions.id
  role        ENUM('user','assistant') NOT NULL,
  content     TEXT NOT NULL,                   -- 纯文本内容
  metadata    JSON DEFAULT NULL,               -- 商品卡片数据、工具调用记录等
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_created (session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**设计要点**:
- `metadata` JSON 字段存储结构化数据（如推荐的商品列表），前端据此渲染商品卡片
- 不存 `system` / `tool` 角色消息，这些仅在调用 PPIO 时动态拼装
- 会话标题自动取用户第一条消息的前 20 个字
- 软删除（`status=0`），不物理删除

## 5. 后端 API 设计

新增 4 个接口，挂载在 `/api/agent` 路由下，需要用户 JWT 认证。

### 5.1 发送消息（流式）

```
POST /api/agent/chat
Headers: Authorization: Bearer <token>
         Accept: text/event-stream
Body: {
  "sessionId": null | 123,    // null 则自动创建新会话
  "message": "帮我找200以内的运动鞋"
}

Response: SSE 流式
  event: delta
  data: {"content": "好的，我来帮您"}

  event: delta
  data: {"content": "搜索一下..."}

  event: products
  data: {"products": [
    {"id": 5, "title": "XX运动鞋", "price": 15900, "image": "...", "url": "/pages/goods/details/index?id=5"},
    ...
  ]}

  event: done
  data: {"sessionId": 123, "messageId": 456}
```

### 5.2 会话列表

```
GET /api/agent/sessions?page=1&pageSize=20
Response: {
  "code": 200,
  "data": {
    "list": [
      {"id": 123, "title": "帮我找运动鞋", "updatedAt": "2026-03-22T10:00:00Z"}
    ],
    "total": 5
  }
}
```

### 5.3 历史消息

```
GET /api/agent/sessions/:id/messages?page=1&pageSize=50
Response: {
  "code": 200,
  "data": {
    "list": [
      {"id": 1, "role": "user", "content": "帮我找200以内的运动鞋", "metadata": null, "createdAt": "..."},
      {"id": 2, "role": "assistant", "content": "为您找到3款...", "metadata": {"products": [...]}, "createdAt": "..."}
    ],
    "total": 12
  }
}
```

### 5.4 删除会话

```
DELETE /api/agent/sessions/:id
Response: { "code": 200, "message": "会话已删除" }
```

### 5.5 Function Calling 工具定义

后端向 PPIO 发送请求时注册一个工具，让 LLM 自主决定何时调用：

```json
{
  "type": "function",
  "function": {
    "name": "searchProducts",
    "description": "在商城中搜索商品。当用户表达了购物意图、想找某类商品、或需要商品推荐时调用此工具。",
    "parameters": {
      "type": "object",
      "properties": {
        "keyword":   { "type": "string", "description": "搜索关键词" },
        "category":  { "type": "string", "description": "商品分类名称" },
        "priceMin":  { "type": "integer", "description": "最低价格（分）" },
        "priceMax":  { "type": "integer", "description": "最高价格（分）" },
        "sortBy":    { "type": "string", "enum": ["price_asc", "price_desc", "sales", "newest"], "description": "排序方式" }
      },
      "required": []
    }
  }
}
```

**调用流程**:
1. 后端组装 `messages`（system prompt + 最近 20 条历史消息 + 本次用户消息）
2. 携带 `tools` 定义调用 PPIO ChatCompletion
3. 若 LLM 返回 `tool_calls` → 后端执行 `searchProducts`（查 MySQL）→ 将结果作为 `tool` 消息追加 → 再次调用 LLM 生成最终回复
4. 流式推送文本 delta + 商品卡片事件给前端

## 6. 前端设计

### 6.1 页面结构

新增页面 `pages/ai-agent/chat/index`：

```
┌─────────────────────────────┐
│  ← AI 购物助手    📋历史会话  │  ← 导航栏
├─────────────────────────────┤
│                             │
│  🤖 你好！我是AI购物助手，    │  ← 欢迎语（仅新会话首次）
│     告诉我你想买什么吧~      │
│                             │
│         ┌─────────────┐     │
│         │帮我找200以内  │     │  ← 用户消息气泡（右侧）
│         │的运动鞋       │     │
│         └─────────────┘     │
│                             │
│  ┌──────────────────┐       │
│  │为您找到3款符合条件的│       │  ← AI 消息气泡（左侧）
│  │运动鞋：           │       │
│  └────��─────────────┘       │
│                             │
│  ┌───────┐┌───────┐┌─────┐ │  ← 商品卡片横向滚动
│  │ 📷    ││ 📷    ││ 📷  │ │
│  │XX鞋   ││YY鞋   ││ZZ鞋 │ │
│  │¥159   ││¥189   ││¥199 │ │
│  │[去看看]││[去看看]││[去看]│ │
│  └───────┘└───────┘└─────┘ │
│                             │
│  ┌──────────────────┐       │
│  │点击"去看看"即可查看 │       │
│  │详情并下单哦~       │       │
│  └──────────────────┘       │
│                             │
├─────────────────────────────┤
│ ┌───────────────────┐ [发送]│  ← 底部输入区
│ │想买点什么？说说看... │       │
│ └───────────────────┘       │
└─────────────────────────────┘
```

### 6.2 消息类型

| 消息类型 | 判断逻辑 | 渲染方式 |
|---------|---------|---------|
| 用户文本 | `role === 'user'` | 右侧蓝色气泡 |
| AI 文本 | `role === 'assistant'` 且无 products | 左侧白色气泡 |
| AI 商品推荐 | `role === 'assistant'` 且 `metadata.products` 存在 | 左侧气泡 + 下方商品卡片横向滚动 |
| AI 正在输入 | 流式接收中 | 左侧气泡 + 打字动画 |

### 6.3 商品推荐卡片组件

复用现有商品数据结构，卡片包含：
- 商品图片（`normalizeImageUrl` 处理）
- 商品标题（最多两行）
- 价格（分 → 元展示）
- 「去看看」按钮 → `navigateTo` 跳转到商品详情页

### 6.4 首页悬浮按钮

在 `pages/home/home.wxml` 底部增加固定定位悬浮按钮：

```html
<view class="ai-fab" bind:tap="onAiAgentTap">
  <t-icon name="chat" size="48rpx" color="#fff" />
</view>
```

点击执行 `wx.navigateTo({ url: '/pages/ai-agent/chat/index' })`

### 6.5 SSE 流式接收

微信小程序不支持原生 `EventSource`，使用 `wx.request` + `enableChunked: true` 实现分块接收，逐步拼接 AI 回复内容并实时更新界面。

### 6.6 历史会话

对话页导航栏右侧「历史会话」图标，点击弹出侧边抽屉或跳转列表页，展示用户所有会话，点击可切换加载。

## 7. System Prompt 与对话策略

### 7.1 System Prompt

```
你是一个微信小程序商城的AI购物助手。你的职责是帮助用户找到合适的商品。

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
- 适当使用emoji增加趣味性
```

### 7.2 上下文窗口管理

| 策略 | 说明 |
|------|------|
| 滑动窗口 | 每次请求携带最近 **20 条** 消息（10 轮对话） |
| System Prompt 常驻 | 始终放在 messages 首位 |
| 商品数据精简 | 工具返回结果只保留 id、title、price、image，不传详情全文 |
| 历史摘要（后续优化） | 超出窗口的早期对话可由 LLM 生成摘要压缩 |

### 7.3 错误处理

| 场景 | 处理方式 |
|------|---------|
| PPIO API 超时/错误 | 返回友好提示「抱歉，我暂时开小差了，请稍后再试」 |
| 搜索无结果 | LLM 自行组织语言建议用户放宽条件 |
| 用户未登录 | 点击悬浮按钮时检查登录态，未登录先跳登录页 |
| 流式中断 | 前端展示已接收内容 + 提示「回复中断，请重新发送」 |

## 8. 技术实现要点

### 8.1 后端新增依赖

```
openai   — 用于调用 PPIO 的 OpenAI 兼容接口
```

其余全部复用现有基础设施（Express、Sequelize、JWT 中间件等）。

### 8.2 新增文件清单

```
backend/
  src/
    models/
      ChatSession.js              # Sequelize 模型
      ChatMessage.js              # Sequelize 模型
    controllers/
      agent.controller.js         # 核心控制器：chat、sessions CRUD
    services/
      agent.service.js            # PPIO 调用、Function Calling 调度、商品搜索逻辑
    routes/
      agent.js                    # /api/agent/* 路由定义
    config/
      agent-prompt.js             # System Prompt 配置

Wechat_Online_Shopping/
  pages/
    ai-agent/
      chat/
        index.js                  # 对话页逻辑
        index.wxml                # 对话页模板
        index.wxss                # 对话页样式
        index.json                # 页面配置
      components/
        product-card/             # 商品推荐卡片组件
          index.js / wxml / wxss / json
  services/
    agent/
      agent.js                    # 前端 agent API 封装（SSE 请求）
  pages/home/
    home.wxml                     # 修改：增加悬浮按钮
    home.wxss                     # 修改：悬浮按钮样式
    home.js                       # 修改：增加跳转方法
```

### 8.3 环境变量

```env
PPIO_API_KEY=<your-api-key>
PPIO_BASE_URL=https://api.ppio.com/openai
PPIO_MODEL=deepseek/deepseek-r1    # 可随时切换
```

### 8.4 安全考虑

| 项目 | 措施 |
|------|------|
| API Key | 仅存后端 `.env`，不进 git |
| 请求频率 | 单用户限流：每分钟最多 10 条消息 |
| 输入长度 | 单条消息最大 500 字 |
| 会话上限 | 每用户最多 50 个活跃会话 |
| XSS 防护 | 前端渲染 AI 回复时转义 HTML |

### 8.5 测试计划

| 层级 | 测试内容 |
|------|---------|
| 后端单元测试 | agent.service.js 的工具调度逻辑、消息组装、商品搜索 SQL |
| 后端接口测试 | /api/agent/* 的认证、参数校验、SSE 流式响应 |
| 前端单元测试 | SSE 解析、消息渲染逻辑、商品卡片 adapter |
