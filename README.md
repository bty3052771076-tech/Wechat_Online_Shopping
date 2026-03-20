# WeChat Online Shopping Monorepo

前后端一体的微信小程序电商项目，工作区固定为 `E:\AI\cc+glm`。

## 仓库结构

- `Wechat_Online_Shopping/`: 微信小程序前端
- `backend/`: Node.js + Express 后端 API
- `database/`: MySQL 初始化脚本与说明
- `docs/`: 方案、报告、排查记录
- `tools/weapp-dev-mcp/`: 本地微信开发者工具 MCP 运行目录

## 环境要求

- Node.js 18+
- npm 9+
- MySQL 8+
- 微信开发者工具

## 快速开始

### 1. 安装依赖

```bash
cd E:\AI\cc+glm\backend
npm install

cd E:\AI\cc+glm\Wechat_Online_Shopping
npm install
```

### 2. 初始化数据库

默认数据库名为 `wechat_shop`。

```bash
mysql -u root -p < E:\AI\cc+glm\database\sql\01-create-tables.sql
mysql -u root -p < E:\AI\cc+glm\database\sql\02-init-data.sql
```

### 3. 配置后端环境变量

复制 `backend/.env.example` 到 `backend/.env`，至少确认这些字段：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=replace_with_a_random_secret
```

### 4. 启动后端

```bash
cd E:\AI\cc+glm\backend
npm start
```

启动成功后会看到类似输出：

```text
=================================
Server started
Port: 3000
Env: development
API: http://localhost:3000
=================================
```

### 5. 打开前端项目

1. 打开微信开发者工具
2. 导入目录 `E:\AI\cc+glm\Wechat_Online_Shopping`
3. 执行“工具 -> 构建 npm”
4. 编译项目

默认前端走真实接口，接口基址为 `http://localhost:3000/api`。

## 微信开发者工具 / MCP 联调

### 当前推荐配置

- 模式：`connect`
- WebSocket 端点：`ws://localhost:9420`
- Codex MCP 配置文件：`C:\Users\30527\.codex\config.toml`
- DevTools CLI：`D:\微信web开发者工具\cli.bat`

推荐配置：

```toml
[mcp_servers.weapp-dev]
command = "node"
args = ["E:\\AI\\cc+glm\\tools\\weapp-dev-mcp\\node_modules\\@yfme\\weapp-dev-mcp\\dist\\index.js"]
startup_timeout_ms = 60000

[mcp_servers.weapp-dev.env]
WEAPP_WS_ENDPOINT = "ws://localhost:9420"
WEAPP_AUTOMATOR_MODE = "connect"
```

### 正确启动顺序

1. 拉起微信开发者工具项目窗口：

```bash
"D:\微信web开发者工具\cli.bat" auto --project E:\AI\cc+glm\Wechat_Online_Shopping --auto-port 9420
```

2. 在微信开发者工具中确认已开启：
   - `HTTP Debugging`
   - `Automation Testing`
3. 保持 `Wechat_Online_Shopping` 项目窗口常驻
4. 再连接 MCP 客户端

### 常见失败点

如果 `mp_ensureConnection` 报错，且下面命令返回 `TcpTestSucceeded: False`：

```powershell
Test-NetConnection localhost -Port 9420
```

说明问题在微信开发者工具侧，不在 MCP 配置侧。优先检查：

- DevTools 项目窗口是否真的打开
- 自动化能力是否启用
- 9420 端口是否已监听
- 打开的是否是 `Wechat_Online_Shopping` 项目

## 测试

### 前端

```bash
cd E:\AI\cc+glm\Wechat_Online_Shopping
node --test tests/*.test.cjs
```

### 后端

```bash
cd E:\AI\cc+glm\backend
node --test tests/*.test.js
```

### 最近一次完整验证

2026-03-20：

- 前端：`72/72` 通过
- 后端：`20/20` 通过

## 2026-03-20 最近修复

### 前端

- 售后申请提交时，`rightsReasonType` 改为使用用户实际选择的售后原因，而不是收货状态
- 售后详情页增加安全默认模型，避免加载阶段把 `undefined` 绑定到组件属性
- 订单确认页重建门店卡片时重置备注缓存，避免重复进入后备注错位
- 优惠券弹层按当前门店装载商品和已选券，并修复预选券的 `promotionId`/选中态映射
- 订单确认页在无真实优惠券数据时，不再向弹层注入 mock 优惠券，避免主页面“无优惠”但弹层却展示演示券

### 后端

- 管理端售后审核：退货退款单审核通过后进入 `20`（已审核待寄回）阶段，不再直接跳到完成态
- 用户订单列表分页计数增加 `distinct`，避免多商品订单把总数算大

### 2026-03-20 MCP 页面回归

- 订单确认页：基于真实登录态和真实商品打开后，地址、门店卡片、商品规格、金额汇总正常，且可实际提交到 `pay-result`
- 售后详情页：基于真实 `rightsNo` 打开后，状态文案、退款信息、商品信息、退货地址、凭证列表正常，没有再出现空模型绑定问题
- 无真实券数据时，优惠券弹层已回到空态，MCP 实机回归可见“暂无优惠券”
- 本轮 MCP 回归未发现前端控制台报错；`mp_navigate` 存在偶发超时，但 `mp_currentPage` 可确认页面实际已切换成功

## 测试账号

普通用户：

- `testuser / 123456`
- `zhangsan / 123456`

管理员：

- `admin / admin123`
- `staff01 / 123456`

## 排查建议

### 后端启动失败

- 检查 MySQL 是否启动
- 检查 `backend/.env` 是否存在
- 检查数据库连接参数是否正确

### 小程序请求不到后端

- 检查后端是否在监听 `3000`
- 检查前端是否重新编译
- 检查微信开发者工具是否关闭了域名校验限制

### MCP 连不上 DevTools

- 先查 `ws://localhost:9420` 是否监听
- 再查 DevTools 自动化是否开启
- 最后再查 MCP 客户端配置
