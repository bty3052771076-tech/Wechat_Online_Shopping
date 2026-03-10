# WeChat Online Shopping Monorepo

一个前后端一体的微信小程序在线购物项目，包含：

- 小程序前端：`Wechat_Online_Shopping/`
- Node.js + Express 后端：`backend/`
- MySQL 初始化脚本：`database/sql/`

项目当前默认走真实接口模式，前端接口地址为 `http://localhost:3000/api`。

## Project Structure

```text
.
├─ backend/                  # 后端 API 服务
├─ Wechat_Online_Shopping/   # 微信小程序前端
├─ database/                 # 数据库脚本与说明
└─ docs/                     # 项目文档、计划和报告
```

## Environment Requirements

在本地快速启动前，请先准备：

- Node.js 18+
- npm 9+
- MySQL 8+
- 微信开发者工具

## Quick Start

### 1. 安装依赖

后端依赖：

```bash
cd backend
npm install
```

前端依赖：

```bash
cd ../Wechat_Online_Shopping
npm install
```

### 2. 初始化数据库

项目默认数据库名为 `wechat_shop`。

执行建表脚本：

```bash
mysql -u root -p < database/sql/01-create-tables.sql
```

执行初始化数据脚本：

```bash
mysql -u root -p < database/sql/02-init-data.sql
```

如果你更习惯在 MySQL 客户端里执行，也可以手动导入这两个文件。

### 3. 配置后端环境变量

复制环境变量样例：

```bash
cd backend
cp .env.example .env
```

Windows PowerShell 也可以直接手动复制 `backend/.env.example` 为 `backend/.env`。

然后至少修改这些字段：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
JWT_SECRET=请替换为你自己的随机字符串
```

### 4. 启动后端

```bash
cd backend
npm start
```

看到类似输出说明启动成功：

```text
=================================
Server started
Port: 3000
Env: development
API: http://localhost:3000
=================================
```

### 5. 启动微信小程序前端

1. 打开微信开发者工具
2. 导入项目目录：`Wechat_Online_Shopping`
3. 在微信开发者工具中执行“工具 -> 构建 npm”
4. 普通编译项目

如果需要本地联调，请确认：

- 后端仍在运行
- 前端配置文件 `Wechat_Online_Shopping/config/index.js` 中 `useMock=false`
- 前端接口地址仍为 `http://localhost:3000/api`

## Test Accounts

普通用户：

- `testuser / 123456`
- `zhangsan / 123456`

管理员：

- `admin / admin123`
- `staff01 / 123456`

## Useful Commands

后端测试：

```bash
cd backend
npm test
```

前端适配层测试：

```bash
cd Wechat_Online_Shopping
npm test
```

## Notes

- 本仓库不会提交本地 `.env`、数据库密码、智能体记忆文件和 MCP 工具目录。
- `Wechat_Online_Shopping/miniprogram_npm/` 属于构建产物，clone 后请在微信开发者工具中重新“构建 npm”。
- `Wechat_Online_Shopping/project.private.config.json` 属于本地开发者私有配置，不会进入版本控制。

## Troubleshooting

### 后端启动失败

优先检查：

- MySQL 是否启动
- `backend/.env` 是否存在
- `DB_NAME / DB_USER / DB_PASSWORD` 是否正确

### 小程序请求不到后端

优先检查：

- 后端是否监听 `3000`
- 前端是否已重新编译
- 微信开发者工具是否开启“不校验合法域名”

### 页面样式或组件异常

优先检查：

- 是否已经执行 `npm install`
- 是否已经执行“构建 npm”
- `miniprogram_npm/` 是否是最新构建结果
