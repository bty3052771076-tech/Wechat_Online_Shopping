# 项目记忆

最后更新：2026-04-07  
工作区：`E:\AI\cc+glm`

## 当前结构

- 前端小程序：`E:\AI\cc+glm\Wechat_Online_Shopping`
- 后端服务：`E:\AI\cc+glm\backend`
- MCP 工具目录：`E:\AI\cc+glm\tools\weapp-dev-mcp`
- 本地记忆文件：`E:\AI\cc+glm\MEMORY.md`
- 测试报告：`E:\AI\cc+glm\docs\plans\`

## Git 状态

- 远程仓库：`https://github.com/bty3052771076-tech/Wechat_Online_Shopping.git`
- 当前分支：`main`
- 最近完成提交：待提交（coupon goods filtering #21）

## Issue #21 完成记录（2026-04-07）

**Issue**: 优惠券适用商品无筛选  
**优先级**: P3  
**状态**: ✅ COMPLETED  

### 实现范围

| 组件 | 内容 | 状态 |
|------|------|------|
| 数据库 | coupon_categories 表 + CouponCategory 模型 | ✅ |
| 后端 API | GET /api/coupons/:id/goods 端点 + 分类过滤 | ✅ |
| 前端服务 | fetchCouponGoods 服务函数 | ✅ |
| 前端页面 | coupon-activity-goods 页面集成 | ✅ |
| 管理端 | 优惠券分类多选管理 | ✅ |
| 测试数据 | 11 条分类绑定 (3 个优惠券) | ✅ |
| 后端测试 | 39/39 通过 | ✅ |
| 前端测试 | 83/83 通过 | ✅ |
| 微信开发者工具测试 | 所有功能正常 | ✅ |
| 测试报告 | 完整文档已生成 | ✅ |

### 关键文件

**新增**:
- `docs/plans/2026-04-07-coupon-goods-filtering-report.md` - 完整测试报告
- `backend/scripts/seed-coupon-categories.js` - 分类绑定数据种子脚本
- `database/sql/12-coupon-categories.sql` - 数据库迁移脚本

**修改**:
- `backend/src/controllers/coupon.controller.js` - 添加 GET /api/coupons/:id/goods 端点
- `backend/src/models/CouponCategory.js` - 新建 Sequelize 模型
- `Wechat_Online_Shopping/pages/coupon/activity-goods/index.js` - 页面完整实现
- `Wechat_Online_Shopping/services/coupon/index.js` - 服务层函数
- `backend/tests/coupon.test.js` - 添加 39 项新测试
- `Wechat_Online_Shopping/tests/coupon.test.cjs` - 添加 83 项前端测试

### 测试验证

**后端测试** (39/39 通过):
- 优惠券 CRUD + 分类操作 (8 tests)
- 分类关联管理 (6 tests)
- 商品分类过滤 (8 tests)
- 价格转换精度 (5 tests)
- 分页处理 (6 tests)
- 管理端分类操作 (6 tests)

**前端测试** (83/83 通过):
- 服务层集成 (12 tests)
- 页面生命周期 (15 tests)
- 组件渲染 (20 tests)
- 用户交互 (18 tests)
- 数据转换 (18 tests)

**微信开发者工具**:
- 优惠券商品列表加载正常
- 分类过滤生效正确
- 价格显示准确 (fen 单位)
- 导航和返回正常
- 刷新和重试功能正常

## 待修正项修复进度

### 第一轮 #1-#13 (2026-03-31 全部完成)
见 `docs/fix-log.md`

### 第二轮 #14-#21

| Issue | 标题 | 优先级 | 状态 | 完成时间 |
|-------|------|--------|------|----------|
| #14 | 优惠券页面 type 格式错误 | P1 | ✅ 完成 | 2026-03-31 |
| #15 | 商品详情页无收藏按钮 | P1 | ✅ 完成 | 2026-03-31 |
| #16 | 用户中心无收藏列表页 | P2 | ✅ 完成 | 2026-03-31 |
| #17 | Admin 无优惠券管理页 | P2 | ✅ 完成 | 2026-03-31 |
| #18 | Admin 无促销活动管理 | P2 | ✅ 完成 | 2026-03-31 |
| #19 | Admin 无 Banner 管理 | P2 | ✅ 完成 | 2026-03-31 |
| #20 | 发票功能 stub | P2 | ✅ 完成 | 2026-03-31 |
| #21 | 优惠券适用商品无筛选 | P3 | ✅ **完成** | **2026-04-07** |

## 最近验证结果

- 后端完整测试：`cd E:\AI\cc+glm\backend && node --test tests\*.test.js` → **39/39** 通过
- 前端完整测试：`cd E:\AI\cc+glm\Wechat_Online_Shopping && node --test tests\*.test.cjs` → **83/83** 通过
- 微信开发者工具实机测试：所有功能正常

## 数据库状态 (2026-04-07)

- 总表数：30 张
- product_spus: 105 行
- product_skus: 216 行
- banners: 3+ 行
- coupons: 3+ 行（test data）
- **coupon_categories: 11 行（新增，分类绑定数据）**
- promotions: 3+ 行
- invoices: empty
- SQL 迁移脚本：`database/sql/01-13`（新增 12、13）

## MCP / 微信开发者工具状态

### 工具路径

- DevTools CLI：`D:\微信web开发者工具\cli.bat`
- 本地 MCP：`E:\AI\cc+glm\tools\weapp-dev-mcp`

### 推荐连接方式

- 模式：`connect`
- WebSocket 端点：`ws://localhost:9420`

### 当前实际状态

- `ws://localhost:9420` 已恢复监听，`mp_ensureConnection` 成功
- 微信开发者工具当前已连接到 `Wechat_Online_Shopping` 项目
- Issue #21 微信开发者工具实机测试已完成，所有功能正常

## 测试账号

- 普通用户：`testuser / 123456`
- 普通用户：`zhangsan / 123456`
- 管理员：`admin / admin123`
- 管理员：`staff01 / 123456`

## 代码规范与约定

- API 响应格式：`{ code, msg, data }` （note: 字段名是 `msg` 不是 `message`）
- 权限验证：JWT Bearer token 在 `Authorization` header
- JWT payload：用户 ID 是 `req.user.user_id`（不是 `req.user.id`）
- 货币值：数据库存储元（DECIMAL），前端使用分（integer cents）
- 页面契约助手：`services/_utils/page-contract-helpers.js`
- TDesign `t-input` 必须用 `bind:change`，不能用 `bind:input`
- 搜索历史删除后必须调用 `saveSearchHistory()` 写回 wx.setStorageSync

## 新会话建议开场

```text
工作区是 E:\AI\cc+glm。Issue #21 已完成（2026-04-07）。
请读取 MEMORY.md 和 docs/plans/2026-04-07-coupon-goods-filtering-report.md 恢复上下文。
```
