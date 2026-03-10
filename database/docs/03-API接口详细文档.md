# 微信小程序"在线购物"API接口详细文档

> **基础URL**: `http://localhost:3000/api`（开发环境）
> **生产URL**: `https://api.yourdomain.com/api`
> **协议**: HTTP/HTTPS
> **数据格式**: JSON
> **字符编码**: UTF-8

---

## 📋 目录

1. [通用说明](#通用说明)
2. [用户端API](#用户端api)
3. [管理端API](#管理端api)
4. [错误码说明](#错误码说明)

---

## 通用说明

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>  // 需要认证的接口
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "code": 400,
  "message": "错误描述",
  "errors": {
    // 详细错误信息（验证失败时）
  }
}
```

---

## 用户端API

### 1. 用户模块

#### 1.1 用户注册

```http
POST /api/users/register
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（3-30字符） |
| password | string | 是 | 密码（6-30字符） |
| phone | string | 否 | 手机号（11位） |
| email | string | 否 | 邮箱 |
| nickname | string | 否 | 昵称 |

**请求示例**:

```json
{
  "username": "testuser",
  "password": "123456",
  "phone": "13800138000",
  "email": "test@example.com"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "testuser",
      "phone": "13800138000",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 1.2 用户登录

```http
POST /api/users/login
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar_url": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 1.3 微信快捷登录

```http
POST /api/users/wechat-login
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录凭证 |
| encryptedData | string | 否 | 加密数据 |
| iv | string | 否 | 加密算法初始向量 |

**请求示例**:

```json
{
  "code": "071aBcDe23f4eF1gHh2iJ3kL4mN5oP6Q"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "openid": "oXXXX...",
      "nickname": "微信用户",
      "avatar_url": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 1.4 获取用户信息

```http
GET /api/users/info
```

**需要认证**: ✅

**请求头**:

```http
Authorization: Bearer <token>
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar_url": "https://...",
    "phone": "13800138000",
    "email": "test@example.com",
    "gender": 1,
    "total_orders": 12,
    "total_spent": 2598.00,
    "register_time": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2. 商品模块

#### 2.1 获取商品列表

```http
GET /api/products/list
```

**请求参数** (Query String):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| categoryId | number | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| sortBy | string | 否 | 排序字段：price/sold_num/create_time |
| sortOrder | string | 否 | 排序方向：asc/desc |
| tag | string | 否 | 标签：hot/new |

**请求示例**:

```http
GET /api/products/list?page=1&pageSize=20&categoryId=1&sortBy=sold_num&sortOrder=desc
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "spu_code": "SPU001",
        "title": "智能手机 Pro Max",
        "subtitle": "5G旗舰 骁龙8Gen2",
        "primary_image": "https://...",
        "min_sale_price": 5999.00,
        "max_line_price": 6999.00,
        "sold_num": 2580,
        "tags": ["热销"],
        "stock": 100
      }
    ]
  }
}
```

---

#### 2.2 获取商品详情

```http
GET /api/products/detail/:id
```

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 商品SPU ID |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "spu": {
      "id": 1,
      "title": "智能手机 Pro Max",
      "subtitle": "5G旗舰 骁龙8Gen2",
      "primary_image": "https://...",
      "detail_images": ["https://...", "https://..."],
      "product_detail": "<p>商品详情HTML...</p>",
      "min_sale_price": 5999.00,
      "total_stock": 100,
      "sold_num": 2580
    },
    "skus": [
      {
        "id": 1,
        "sku_name": "黑色 128G",
        "price": 5999.00,
        "stock": 50,
        "specs": {
          "颜色": "黑色",
          "存储": "128G"
        }
      }
    ],
    "specs": [
      {
        "spec_name": "颜色",
        "spec_values": ["黑色", "白色", "蓝色"]
      },
      {
        "spec_name": "存储",
        "spec_values": ["128G", "256G", "512G"]
      }
    ]
  }
}
```

---

### 3. 购物车模块

#### 3.1 加入购物车

```http
POST /api/cart/add
```

**需要认证**: ✅

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skuId | number | 是 | 商品SKU ID |
| quantity | number | 是 | 数量 |

**请求示例**:

```json
{
  "skuId": 1,
  "quantity": 2
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "加入购物车成功",
  "data": {
    "cart": {
      "id": 1,
      "sku_id": 1,
      "quantity": 2,
      "product": {
        "title": "智能手机 Pro Max",
        "image": "https://...",
        "price": 5999.00
      }
    }
  }
}
```

---

#### 3.2 获取购物车列表

```http
GET /api/cart/list
```

**需要认证**: ✅

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "sku_id": 1,
        "quantity": 2,
        "is_checked": true,
        "product": {
          "spu_id": 1,
          "title": "智能手机 Pro Max",
          "image": "https://...",
          "sku_name": "黑色 128G",
          "price": 5999.00
        }
      }
    ],
    "total_amount": 11998.00,
    "total_count": 3
  }
}
```

---

#### 3.3 修改购物车

```http
PUT /api/cart/update
```

**需要认证**: ✅

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cartId | number | 是 | 购物车ID |
| quantity | number | 是 | 新数量 |
| isChecked | boolean | 否 | 是否选中 |

**请求示例**:

```json
{
  "cartId": 1,
  "quantity": 3,
  "isChecked": true
}
```

---

#### 3.4 删除购物车商品

```http
DELETE /api/cart/delete/:id
```

**需要认证**: ✅

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 购物车ID |

---

### 4. 订单模块

#### 4.1 创建订单

```http
POST /api/orders/create
```

**需要认证**: ✅

**请求参数**:

```json
{
  "items": [
    {
      "skuId": 1,
      "quantity": 2
    }
  ],
  "addressId": 1,
  "deliveryFee": 10.00,
  "remark": "尽快发货"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 201,
  "message": "订单创建成功",
  "data": {
    "order": {
      "id": 1001,
      "order_no": "202603041234567890",
      "total_amount": 12008.00,
      "pay_amount": 12008.00,
      "order_status": 1,
      "pay_status": 0
    }
  }
}
```

---

#### 4.2 获取订单列表

```http
GET /api/orders/list
```

**需要认证**: ✅

**请求参数** (Query String):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | number | 否 | 订单状态筛选 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 1001,
        "order_no": "202603041234567890",
        "total_amount": 12008.00,
        "order_status": 1,
        "pay_status": 0,
        "created_at": "2026-03-04T12:34:56Z",
        "items": [
          {
            "product_title": "智能手机 Pro Max",
            "product_image": "https://...",
            "quantity": 2,
            "price": 5999.00
          }
        ]
      }
    ]
  }
}
```

---

#### 4.3 获取订单详情

```http
GET /api/orders/detail/:id
```

**需要认证**: ✅

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "order": {
      "id": 1001,
      "order_no": "202603041234567890",
      "total_amount": 12008.00,
      "pay_amount": 12008.00,
      "order_status": 2,
      "pay_status": 1,
      "receiver_name": "张三",
      "receiver_phone": "13800138000",
      "receiver_address": "北京市朝阳区XXX",
      "delivery_company": "顺丰速运",
      "delivery_no": "SF1234567890",
      "created_at": "2026-03-04T12:34:56Z",
      "pay_time": "2026-03-04T12:35:00Z"
    },
    "items": [
      {
        "id": 1,
        "product_title": "智能手机 Pro Max",
        "product_image": "https://...",
        "sku_spec_info": "黑色 128G",
        "quantity": 2,
        "price": 5999.00,
        "total_amount": 11998.00
      }
    ]
  }
}
```

---

## 管理端API

### 1. 管理员模块

#### 1.1 管理员登录

```http
POST /api/admin/login
```

**请求参数**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "real_name": "系统管理员",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. 商品管理模块

#### 2.1 获取商品列表

```http
GET /api/admin/products
```

**需要认证**: ✅
**需要权限**: 管理员

**请求参数** (Query String):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词 |
| categoryId | number | 否 | 分类ID |
| status | number | 否 | 状态：0下架，1上架 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1,
        "spu_code": "SPU001",
        "title": "智能手机 Pro Max",
        "category_name": "电子产品",
        "primary_image": "https://...",
        "min_sale_price": 5999.00,
        "total_stock": 100,
        "sold_num": 2580,
        "status": 1,
        "created_at": "2026-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

#### 2.2 添加商品

```http
POST /api/admin/products
```

**需要认证**: ✅
**需要权限**: 管理员

**请求参数**:

```json
{
  "title": "智能手机 Pro Max",
  "subtitle": "5G旗舰 骁龙8Gen2",
  "categoryId": 1,
  "brand": "华为",
  "primary_image": "https://...",
  "detail_images": ["https://...", "https://..."],
  "product_detail": "<p>商品详情HTML</p>",
  "skus": [
    {
      "sku_name": "黑色 128G",
      "price": 5999.00,
      "stock": 50,
      "specs": {
        "颜色": "黑色",
        "存储": "128G"
      }
    }
  ],
  "tags": ["热销"],
  "status": 1
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 201,
  "message": "添加成功",
  "data": {
    "id": 2,
    "spu_code": "SPU002"
  }
}
```

---

#### 2.3 更新商品

```http
PUT /api/admin/products/:id
```

**需要认证**: ✅
**需要权限**: 管理员

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 商品SPU ID |

**请求参数**: 同添加商品

---

#### 2.4 删除商品

```http
DELETE /api/admin/products/:id
```

**需要认证**: ✅
**需要权限**: 管理员

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 商品SPU ID |

---

### 3. 订单管理模块

#### 3.1 获取订单列表

```http
GET /api/admin/orders
```

**需要认证**: ✅
**需要权限**: 管理员

**请求参数** (Query String):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| orderNo | string | 否 | 订单号 |
| receiverPhone | string | 否 | 收货人手机号 |
| status | number | 否 | 订单状态 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1001,
        "order_no": "202603041234567890",
        "user": {
          "username": "testuser",
          "nickname": "测试用户"
        },
        "total_amount": 12008.00,
        "order_status": 2,
        "pay_status": 1,
        "receiver_name": "张三",
        "receiver_phone": "13800138000",
        "created_at": "2026-03-04T12:34:56Z"
      }
    ]
  }
}
```

---

#### 3.2 订单发货

```http
PUT /api/admin/orders/:id/ship
```

**需要认证**: ✅
**需要权限**: 管理员

**请求参数**:

```json
{
  "delivery_company": "顺丰速运",
  "delivery_no": "SF1234567890"
}
```

---

### 4. 用户管理模块

#### 4.1 获取用户列表

```http
GET /api/admin/users
```

**需要认证**: ✅
**需要权限**: 管理员

**请求参数** (Query String):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词 |

---

#### 4.2 获取用户详情

```http
GET /api/admin/users/:id
```

**需要认证**: ✅
**需要权限**: 管理员

---

## 错误码说明

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户名已存在 |
| 1002 | 用户名或密码错误 |
| 1003 | Token无效或已过期 |
| 1004 | 用户已被禁用 |
| 2001 | 商品不存在 |
| 2002 | 商品库存不足 |
| 2003 | 商品已下架 |
| 3001 | 购物车商品不存在 |
| 3002 | 购物车商品数量超过库存 |
| 4001 | 订单不存在 |
| 4002 | 订单状态不允许此操作 |
| 4003 | 收货地址不存在 |
| 5001 | 权限不足 |
| 5002 | 管理员已被禁用 |
| 9999 | 系统错误 |

---

**文档版本**: v1.0
**最后更新**: 2026-03-04
