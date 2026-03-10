# 可视化测试指南

> **目标**: 使用图形化工具进行测试，无需命令行
> **适合**: 喜欢可视化界面的开发者

---

## 🎨 可视化测试工具对比

| 工具 | 类型 | 适用场景 | 难度 | 推荐度 |
|------|------|---------|------|--------|
| **Postman** | API测试 | 后端API测试 | ⭐ | ⭐⭐⭐⭐⭐ |
| **微信开发者工具** | 小程序IDE | 前端界面测试 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **浏览器** | Web浏览器 | 简单GET请求 | ⭐ | ⭐⭐⭐⭐ |
| **Thunder Client** | VS Code插件 | 快速API测试 | ⭐ | ⭐⭐⭐⭐ |
| **Insomnia** | API测试 | REST API | ⭐⭐ | ⭐⭐⭐ |

---

## 方法一：Postman测试（推荐）

### 为什么选择Postman？

✅ 图形化界面，操作直观
✅ 保存请求历史
✅ 环境变量管理
✅ 自动化测试支持
✅ 团队协作功能

### 安装Postman

**1. 下载安装**
- 访问：https://www.postman.com/downloads/
- 下载Windows版本
- 安装并启动

**2. 创建工作空间**
- 打开Postman
- 点击"Create Workspace"
- 命名："微信小程序购物API测试"
- 点击"Create"

---

### Postman测试步骤

#### 测试1：用户登录

**步骤**：

1. **创建新请求**
   - 点击"New" → "HTTP Request"
   - 命名："用户登录"

2. **设置请求**
   ```
   方法: POST
   URL: http://localhost:3001/api/users/login
   ```

3. **设置Headers**
   点击"Headers"标签，添加：
   ```
   Key: Content-Type
   Value: application/json
   ```

4. **设置Body**
   - 点击"Body"标签
   - 选择"raw"
   - 选择"JSON"
   - 输入：
   ```json
   {
     "username": "testuser",
     "password": "123456"
   }
   ```

5. **发送请求**
   - 点击"Send"按钮
   - 查看响应结果

**预期响应**：
```json
{
  "code": "Success",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "msg": "登录成功"
}
```

**💡 保存Token**：
- 复制返回的token值
- 后续请求需要用到

---

#### 测试2：获取商品列表

**步骤**：

1. **创建新请求**
   - 命名："商品列表"

2. **设置请求**
   ```
   方法: GET
   URL: http://localhost:3001/api/products/list
   ```

3. **发送请求**
   - 点击"Send"

**预期响应**：显示商品列表JSON数据

---

#### 测试3：获取购物车列表（需要认证）

**步骤**：

1. **创建新请求**
   - 命名："购物车列表"

2. **设置请求**
   ```
   方法: GET
   URL: http://localhost:3001/api/cart/list
   ```

3. **设置Authorization**
   - 点击"Authorization"标签
   - Type: "Bearer Token"
   - Token: 粘贴之前复制的token

4. **发送请求**

**预期响应**：
```json
{
  "code": "Success",
  "data": {
    "items": [...],
    "summary": {...}
  }
}
```

---

#### 测试4：加入购物车

**步骤**：

1. **创建新请求**
   - 命名："加入购物车"

2. **设置请求**
   ```
   方法: POST
   URL: http://localhost:3001/api/cart/add
   ```

3. **设置Headers**
   ```
   Content-Type: application/json
   Authorization: Bearer {你的token}
   ```

4. **设置Body**
   ```json
   {
     "skuId": 1,
     "quantity": 2
   }
   ```

5. **发送请求**

---

### Postman环境变量（高级）

**设置环境变量**：

1. **创建环境**
   - 点击眼睛图标（Environments）
   - 点击"Create"
   - 命名："开发环境"

2. **添加变量**
   ```
   Variable: baseUrl
   Value: http://localhost:3001
   Variable: token
   Value: {你的token}
   ```

3. **在请求中使用变量**
   ```
   URL: {{baseUrl}}/api/users/login
   Authorization: Bearer {{token}}
   ```

---

## 方法二：浏览器测试（最简单）

### 适用场景

✅ 测试GET请求
✅ 快速验证API
✅ 查看JSON响应

### 测试步骤

#### 测试1：健康检查

**直接在浏览器地址栏输入**：
```
http://localhost:3001/health
```

**页面显示**：
```json
{"status":"ok","timestamp":"...","database":"connected"}
```

---

#### 测试2：商品列表

**在浏览器地址栏输入**：
```
http://localhost:3001/api/products/list
```

**页面显示**：商品列表JSON数据

---

#### 测试3：商品详情

**在浏览器地址栏输入**：
```
http://localhost:3001/api/products/detail/1
```

**页面显示**：商品详情JSON数据

---

### 浏览器JSON格式化

**如果JSON显示不整齐**：

1. **安装Chrome扩展**
   - "JSON Viewer"
   - "JSON Formatter"

2. **或者使用在线工具**
   - 复制JSON数据
   - 访问：https://jsonformatter.org/
   - 粘贴并格式化

---

## 方法三：微信开发者工具（前端测试）

### 测试小程序界面

**步骤**：

1. **打开微信开发者工具**

2. **导入项目**
   - 点击"导入项目"
   - 目录：`E:/AI/cc+glm/Wechat_Online_Shopping`
   - AppID：选择"测试号"

3. **配置本地设置**
   - 点击"详情"
   - "本地设置"
   - ✅ 勾选"不校验合法域名"

4. **点击编译**

5. **测试功能**
   - 登录：testuser / 123456
   - 浏览商品
   - 加入购物车
   - 查看订单

---

### 使用调试工具

**Console（控制台）**：
- 查看日志输出
- 查看API请求
- 查看错误信息

**Network（网络）**：
- 查看所有API请求
- 查看请求参数
- 查看响应数据

**Storage（存储）**：
- 查看保存的token
- 查看用户信息
- 查看购物车数据

---

## 方法四：Thunder Client（VS Code插件）

### 安装

1. **打开VS Code**
2. **扩展商店**
3. **搜索"Thunder Client"**
4. **点击安装**

### 使用

**测试API**：

1. **点击Thunder Client图标**（左侧边栏）
2. **创建新请求**
3. **设置方法和URL**
4. **添加Headers和Body**
5. **点击Send**

**优点**：
- 无需离开VS Code
- 界面简洁
- 保存请求历史

---

## 🎯 推荐测试流程

### 方案A：完整可视化测试

```
1️⃣ 启动后端
   npm start (端口3001)

2️⃣ 打开Postman

3️⃣ 测试后端API
   - 用户登录
   - 商品列表
   - 购物车功能

4️⃣ 打开微信开发者工具

5️⃣ 测试小程序前端
   - 登录
   - 浏览商品
   - 加入购物车
```

---

### 方案B：快速验证

```
1️⃣ 启动后端
   npm start

2️⃣ 浏览器测试
   http://localhost:3001/health
   http://localhost:3001/api/products/list

3️⃣ 微信开发者工具
   导入项目并测试
```

---

## 📊 可视化测试检查清单

### Postman测试清单

- [ ] 安装Postman
- [ ] 创建工作空间
- [ ] 测试用户登录
- [ ] 保存token
- [ ] 测试商品列表
- [ ] 测试商品详情
- [ ] 测试购物车（需要token）
- [ ] 测试加入购物车

### 浏览器测试清单

- [ ] 健康检查: /health
- [ ] 商品列表: /api/products/list
- [ ] 商品详情: /api/products/detail/1
- [ ] 分类列表: /api/products/categories/list

### 微信开发者工具清单

- [ ] 导入项目
- [ ] 勾选"不校验合法域名"
- [ ] 编译成功
- [ ] 测试登录
- [ ] 测试商品浏览
- [ ] 测试购物车
- [ ] 测试下单流程

---

## 💡 提示和技巧

### Postman技巧

**1. 快速切换环境**
```
点击右上角环境选择器
在"开发环境"和"生产环境"之间切换
```

**2. 保存请求示例**
```
点击"Save Example"
记录成功的请求响应
```

**3. 创建集合**
```
将相关请求分组
例如："用户认证"、"商品"、"购物车"
```

**4. 自动化测试**
```
使用Collection Runner
批量运行测试
```

---

### 浏览器技巧

**1. 使用JSON查看扩展**
```
安装"JSON Viewer"扩展
自动格式化JSON响应
```

**2. 书签常用URL**
```
将测试URL添加到书签栏
快速访问
```

---

### 微信开发者工具技巧

**1. 清缓存**
```
如果遇到问题：
清除缓存 → 清除全部缓存 → 重新编译
```

**2. 真机预览**
```
点击"预览" → 扫码在真机上测试
```

**3. 性能监控**
```
Audits标签 → 运行性能检查
```

---

## 🎬 视频化测试演示（概念）

如果你想看视频教程，可以：

**Postman官方教程**：
- https://learning.postman.com/

**微信小程序官方文档**：
- https://developers.weixin.qq.com/miniprogram/dev/framework/

---

## 📝 常见问题

### Q1: Postman请求失败？

**检查**：
1. 服务器是否启动（访问http://localhost:3001/health）
2. URL是否正确（端口号3001）
3. 请求方法是否正确（GET/POST）
4. Headers是否正确（Content-Type: application/json）

### Q2: 浏览器显示ERR_CONNECTION_REFUSED？

**原因**：服务器未启动

**解决**：
```bash
cd E:/AI/cc+glm/backend
npm start
```

### Q3: 微信开发者工具无法连接后端？

**检查**：
1. 后端服务是否启动
2. 是否勾选"不校验合法域名"
3. API地址配置是否正确

### Q4: Token过期了怎么办？

**重新登录**：
1. 再次调用登录API
2. 获取新token
3. 更新Postman/微信开发者工具中的token

---

## 🎉 总结

### 最简单的可视化测试

**新手推荐**：
1. 浏览器测试GET请求
2. 微信开发者工具测试界面

**专业推荐**：
1. Postman测试所有API
2. 微信开发者工具测试前端

### 快速开始

**现在就可以测试**：

1. **打开浏览器**
   ```
   http://localhost:3001/api/products/list
   ```

2. **打开微信开发者工具**
   ```
   导入: E:/AI/cc+glm/Wechat_Online_Shopping
   测试登录和购物功能
   ```

3. **下载Postman**（可选）
   ```
   https://www.postman.com/downloads/
   ```

---

**你更喜欢哪种可视化测试方式？**

我可以：
1. 帮你配置Postman
2. 指导微信开发者工具测试
3. 提供更详细的浏览器测试步骤
