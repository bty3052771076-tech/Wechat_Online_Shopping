# 微信在线购物小程序

前后端一体的微信小程序电商系统，涵盖用户购物全链路、商家管理后台及 AI 购物助手。

## 仓库结构

```
E:\AI\cc+glm\
├── Wechat_Online_Shopping/   微信小程序前端（TDesign Weapp）
├── backend/                  Node.js / Express 后端 API
├── database/                 MySQL 初始化脚本
├── docs/                     方案设计、排查记录
└── tools/weapp-dev-mcp/      微信开发者工具 MCP 目录
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 商品浏览 | 首页、分类、详情、搜索（含历史记录）、热门推荐 |
| 购物车 | 加购、数量调整、选中结算 |
| 订单 | 下单、支付、查看订单、确认收货、发票、物流跟踪 |
| 售后 | 申请退款/退货、售后进度跟踪 |
| 个人中心 | 收货地址、优惠券、浏览历史 |
| 管理后台 | 商品、订单、用户、售后、配送区域管理 |
| AI 购物助手 | 自然语言对话推荐商品（PPIO 大模型 + Function Calling + SSE 流式） |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序（原生）+ TDesign Weapp |
| 后端 | Node.js / Express + Sequelize ORM |
| 数据库 | MySQL 8 |
| AI | PPIO API（OpenAI 兼容）+ Function Calling，SSE 流式输出 |

## 环境要求

- Node.js 18+
- MySQL 8+
- 微信开发者工具

## 快速开始

### 1. 安装依赖

```bash
cd backend && npm install
cd Wechat_Online_Shopping && npm install
```

### 2. 初始化数据库

```bash
mysql -u root -p < database/sql/01-create-tables.sql
mysql -u root -p < database/sql/02-init-data.sql
```

### 3. 配置后端环境变量

复制 `backend/.env.example` 为 `backend/.env`，填写以下字段：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=replace_with_a_random_secret

# AI 购物助手（可选）
PPIO_API_KEY=your_ppio_key
PPIO_BASE_URL=https://api.ppio.com/openai
PPIO_MODEL=minimax/minimax-m2.7
```

### 4. 启动后端

```bash
cd backend
npm start        # 生产
npm run dev      # 开发（热重载）
```

### 5. 打开前端项目

1. 打开微信开发者工具，导入 `Wechat_Online_Shopping/` 目录
2. 工具菜单 → 构建 npm
3. 编译运行（前端接口基址默认 `http://localhost:3000/api`）

## API 概览

| 分组 | 前缀 | 说明 |
|------|------|------|
| 商品 | `/api/products` | 列表、详情、搜索 |
| 购物车 | `/api/cart` | 增删查改 |
| 订单 | `/api/orders` | 下单、支付、查询、售后 |
| 用户 | `/api/user` | 登录、地址、优惠券 |
| 管理员 | `/api/admin` | 登录、商品/订单/用户/售后管理 |
| AI 助手 | `/api/agent` | SSE 对话、会话 CRUD |

统一响应格式：`{ code, msg, data }`

## AI 购物助手

- 入口：首页右下角悬浮按钮
- 支持自然语言描述需求，自动搜索商品并以卡片形式展示推荐结果
- 技术：SSE 流式输出 + Function Calling，对话历史持久化至 MySQL
- 限制：10 条/分钟/用户，单条 ≤500 字，最多 50 个会话

## 测试

```bash
# 前端单元测试
cd Wechat_Online_Shopping
node --test tests/*.test.cjs

# 后端单元测试
cd backend
node --test tests/*.test.js
```

当前状态（2026-03-23）：前端 **83/83** ✅ · 后端 **35/35** ✅

## 微信开发者工具 MCP 联调

### 启动顺序

```bash
# 拉起项目窗口并开放自动化端口
"D:\微信web开发者工具\cli.bat" auto --project E:\AI\cc+glm\Wechat_Online_Shopping --auto-port 9420
```

在开发者工具中确认开启 `HTTP Debugging` 和 `Automation Testing`，再连接 MCP 客户端（`ws://localhost:9420`）。

### 常见问题

| 现象 | 排查方向 |
|------|---------|
| `mp_ensureConnection` 报错 | 检查 9420 端口：`Test-NetConnection localhost -Port 9420` |
| 小程序请求不到后端 | 检查后端是否监听 3000；前端是否重新编译；DevTools 是否关闭域名校验 |
| 后端启动失败 | 检查 MySQL 是否启动、`backend/.env` 是否存在 |

## 测试账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 普通用户 | `testuser` | `123456` |
| 普通用户 | `zhangsan` | `123456` |
| 管理员 | `admin` | `admin123` |
| 员工 | `staff01` | `123456` |

## 开源协议

MIT
