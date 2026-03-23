# 微信在线购物小程序

基于微信原生小程序（TDesign Weapp）+ Node.js 后端的完整电商系统，涵盖用户购物全链路、商家管理后台及 AI 购物助手。

---

## 项目介绍

### 功能模块

| 模块 | 说明 |
|------|------|
| 商品浏览 | 首页、分类、商品详情、搜索、热门推荐 |
| 购物车 | 加购、数量调整、选中结算 |
| 订单 | 下单、支付、查看订单、确认收货、发票 |
| 售后 | 申请退款/退货、售后进度跟踪 |
| 个人中心 | 收货地址、优惠券、浏览历史 |
| 管理后台 | 商品管理、订单管理、用户管理、售后处理、配送区域配置 |
| AI 购物助手 | 自然语言对话式商品推荐（PPIO 大模型 + Function Calling） |

### 页面结构

```
pages/
├── home/              首页
├── category/          分类页
├── goods/
│   ├── details/       商品详情
│   ├── search/        搜索（含历史记录）
│   ├── result/        搜索结果
│   └── comments/      商品评论
├── cart/              购物车
├── order/
│   ├── order-confirm/ 确认下单
│   ├── order-list/    订单列表
│   ├── order-detail/  订单详情
│   ├── pay-result/    支付结果
│   ├── invoice/       发票
│   ├── delivery-detail/ 物流详情
│   ├── fill-tracking-no/ 填写运单号
│   ├── receipt/       确认收货
│   ├── after-service-list/  售后列表
│   ├── after-service-detail/ 售后详情
│   └── apply-service/ 申请售后
├── coupon/            优惠券
├── usercenter/        个人中心（含收货地址）
├── admin/
│   ├── login/         管理员登录
│   ├── dashboard/     后台总览
│   ├── goods-manage/  商品管理
│   ├── order-manage/  订单管理
│   ├── user-manage/   用户管理
│   ├── after-sale-manage/ 售后管理
│   └── delivery-manage/   配送区域管理
└── ai-agent/
    └── chat/          AI 购物助手对话页
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序（原生）+ TDesign Weapp |
| 后端 | Node.js / Express + Sequelize ORM |
| 数据库 | MySQL |
| AI | PPIO API（OpenAI 兼容）+ Function Calling，SSE 流式输出 |

---

## 项目结构

```
.
├── Wechat_Online_Shopping/   # 小程序前端
│   ├── pages/                # 页面
│   ├── components/           # 公共组件
│   ├── services/             # 接口调用层
│   ├── model/                # Mock 数据
│   ├── config/               # 基础配置（含 apiBaseURL、useMock 开关）
│   ├── style/                # 公共样式与 iconfont
│   └── tests/                # 前端单元测试（node --test）
└── backend/                  # Node.js 后端
    └── src/
        ├── controllers/      # 业务控制器
        ├── services/         # 业务逻辑（含 AI Agent）
        ├── models/           # Sequelize 数据模型
        ├── routes/           # Express 路由
        ├── middlewares/      # JWT 鉴权等中间件
        ├── config/           # 服务端配置（含 AI System Prompt）
        └── validators/       # 参数校验
```

---

## 快速开始

### 前置条件

- 微信开发者工具
- Node.js >= 18
- MySQL 8.x

### 前端

1. 在微信开发者工具中导入 `Wechat_Online_Shopping/` 目录
2. 修改 `config/index.js` 中的 `apiBaseURL` 指向后端地址
3. 构建 npm（工具菜单 → 构建 npm）

### 后端

```bash
cd backend
npm install
# 配置环境变量（复制并填写）
cp .env.example .env
# 初始化数据库（确保 MySQL 已启动）
npm run db:sync
npm run dev
```

### 环境变量（`backend/.env`）

| 变量 | 说明 |
|------|------|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | MySQL 连接配置 |
| `JWT_SECRET` | JWT 签名密钥 |
| `PPIO_API_KEY` | PPIO 大模型 API Key |
| `PPIO_BASE_URL` | PPIO API 地址（默认 `https://api.ppio.com/openai`） |
| `PPIO_MODEL` | 使用的模型（如 `minimax/minimax-m2.7`） |

---

## API 概览

| 分组 | 前缀 | 说明 |
|------|------|------|
| 商品 | `/api/products` | 列表、详情、搜索 |
| 购物车 | `/api/cart` | 增删查改 |
| 订单 | `/api/orders` | 下单、支付、查询、售后 |
| 用户 | `/api/user` | 登录、地址、优惠券 |
| 管理员 | `/api/admin` | 登录、商品/订单/用户/售后管理 |
| AI 助手 | `/api/agent` | SSE 对话、会话管理 |

API 响应统一格式：`{ code, msg, data }`

---

## 测试

```bash
# 前端单元测试
cd Wechat_Online_Shopping
node --test tests/*.test.cjs

# 后端单元测试
cd backend
node --test tests/*.test.js
```

当前测试状态：前端 83/83 ✅ · 后端 35/35 ✅

---

## AI 购物助手

- 入口：首页右下角悬浮按钮
- 支持自然语言描述需求，助手自动调用商品搜索接口并以卡片形式展示推荐结果
- 技术：SSE 流式输出 + Function Calling，对话历史持久化至数据库
- 限制：每用户 10 条/分钟、单条消息 500 字、最多 50 个会话

---

## 开源协议

MIT
