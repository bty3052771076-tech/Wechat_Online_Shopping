# API集成测试快速指南

## 快速开始

### 1. 启动后端服务
```bash
cd E:/AI/cc+glm/backend
npm start
```

### 2. 运行集成测试
```bash
# 在新终端窗口中执行
cd E:/AI/cc+glm/backend
node tests/integration-test.js
```

## 测试要求

### 环境准备
- ✅ Node.js 已安装
- ✅ 数据库已启动
- ✅ 后端服务运行在 http://localhost:3000
- ✅ axios 已安装（已包含在项目中）

### 测试账户
确保以下账户存在：
- **用户**: testuser / 123456
- **管理员**: admin / admin123

如果没有测试账户，请先创建：
```sql
-- 创建测试用户
INSERT INTO users (username, password, phone, nickname)
VALUES ('testuser', '$2b$10$...', '13800138000', '测试用户');

-- 创建管理员（如果不存在）
INSERT INTO admins (username, password, real_name, role)
VALUES ('admin', '$2b$10$...', '系统管理员', 'super_admin');
```

## 测试覆盖范围

### 8个测试模块，24个测试用例

1. **用户认证** (3个测试)
   - 用户登录
   - 获取用户信息
   - 验证token有效性

2. **管理员认证** (2个测试)
   - 管理员登录
   - 获取管理员信息

3. **商品API** (4个测试)
   - 获取商品列表
   - 获取商品详情
   - 获取分类列表
   - 获取分类树

4. **购物车API** (4个测试)
   - 加入购物车
   - 获取购物车列表
   - 修改购物车
   - 删除购物车商品

5. **收货地址API** (3个测试)
   - 添加收货地址
   - 获取地址列表
   - 设置默认地址

6. **订单API** (3个测试)
   - 创建订单
   - 获取订单列表
   - 获取订单详情

7. **管理端商品API** (3个测试)
   - 获取商品列表（管理端）
   - 添加商品（测试数据）
   - 更新商品状态

8. **管理端订单API** (2个测试)
   - 获取订单列表（管理端）
   - 订单发货

## 测试输出说明

### 成功标记
- ✅ 测试通过
- ❌ 测试失败
- ℹ️  信息提示

### 结果统计
```
总测试数: 24
通过: 24
失败: 0
通过率: 100.0%
执行时间: 3.45秒
```

### 退出码
- **0**: 所有测试通过
- **1**: 存在失败的测试

## 常见问题

### Q1: 测试失败 "连接被拒绝"
**原因**: 后端服务未启动
**解决**: 先启动后端服务 `npm start`

### Q2: 测试失败 "登录失败"
**原因**: 测试账户不存在或密码错误
**解决**: 检查数据库中是否有testuser和admin账户

### Q3: 测试失败 "商品不存在"
**原因**: 数据库中没有商品数据
**解决**: 先初始化商品数据

### Q4: 部分测试通过，部分失败
**原因**: 某些API功能未实现或有bug
**解决**: 查看失败测试的错误信息，修复对应的API

## 测试报告

测试完成后，可以使用 `INTEGRATION_TEST_REPORT.md` 模板记录测试结果。

报告位置: `E:/AI/cc+glm/backend/tests/INTEGRATION_TEST_REPORT.md`

## 持续集成

可以在CI/CD流水线中集成测试：

```bash
# 运行测试
node tests/integration-test.js

# 检查结果
if [ $? -eq 0 ]; then
  echo "✅ 测试通过，继续部署"
  # 执行部署命令
else
  echo "❌ 测试失败，阻止部署"
  exit 1
fi
```

## 测试数据

测试使用的数据：
- **用户**: testuser
- **管理员**: admin
- **收货地址**: 北京市朝阳区某某街道123号
- **测试商品**: 创建时标记为"集成测试商品"
- **订单**: 使用product_id=1

所有测试数据都使用虚拟或测试数据，不会污染生产数据。

## 扩展测试

如需添加新的测试用例，参考现有格式：

```javascript
await test('新测试名称', async () => {
  const response = await axios.get(`${API_BASE}/api/new-endpoint`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  if (response.data.code !== 'Success') throw new Error('测试失败');
  if (!response.data.data.field) throw new Error('缺少字段');

  logInfo(`测试结果: ${response.data.data.field}`);
});
```

## 技术支持

如有问题，请查看：
- 完成报告: `E:/AI/cc+glm/backend/TASK9_COMPLETION_REPORT.md`
- 测试脚本: `E:/AI/cc+glm/backend/tests/integration-test.js`
- API文档: 相关的controller和route文件

---

**最后更新**: 2026-03-05
**版本**: v1.0
