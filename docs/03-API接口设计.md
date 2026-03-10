# 微信小程序在线购物系统 - API接口设计文档

## 文档信息

- **项目名称**: 微信小程序在线购物系统
- **文档版本**: v1.0.0
- **创建日期**: 2026-03-04
- **最后更新**: 2026-03-04
- **文档状态**: 正式版

---

## 目录

1. [接口设计规范](#1-接口设计规范)
2. [认证与授权接口](#2-认证与授权接口)
3. [用户管理接口](#3-用户管理接口)
4. [商品管理接口（用户端）](#4-商品管理接口用户端)
5. [商品管理接口（管理端）](#5-商品管理接口管理端)
6. [购物车接口](#6-购物车接口)
7. [订单接口](#7-订单接口)
8. [订单管理接口（管理端）](#8-订单管理接口管理端)
9. [支付接口](#9-支付接口)
10. [物流接口](#10-物流接口)
11. [售后接口](#11-售后接口)
12. [售后管理接口（管理端）](#12-售后管理接口管理端)
13. [配送管理接口](#13-配送管理接口)
14. [用户管理接口（管理端）](#14-用户管理接口管理端)
15. [文件上传接口](#15-文件上传接口)
16. [错误码说明](#16-错误码说明)

---

## 1. 接口设计规范

### 1.1 接口基础URL

```
开发环境: https://dev-api.example.com
测试环境: https://test-api.example.com
生产环境: https://api.example.com
```

### 1.2 通用请求头

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
X-Client-Platform: wechat-mini-program
X-Client-Version: 1.0.0
X-Request-ID: {unique_request_id}
```

### 1.3 响应格式统一规范

#### 成功响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1640995200000
}
```

#### 失败响应格式

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": {
    "field": ["错误详情"]
  },
  "timestamp": 1640995200000
}
```

#### 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  },
  "timestamp": 1640995200000
}
```

### 1.4 HTTP状态码规范

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或Token过期） |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.5 业务错误码规范

| 错误码 | 说明 |
|--------|------|
| 10001 | 参数验证失败 |
| 10002 | 用户不存在 |
| 10003 | 密码错误 |
| 10004 | 用户已存在 |
| 10005 | 验证码错误 |
| 10006 | 验证码已过期 |
| 20001 | Token无效 |
| 20002 | Token已过期 |
| 20003 | 无权限访问 |
| 30001 | 商品不存在 |
| 30002 | 商品库存不足 |
| 30003 | 商品已下架 |
| 40001 | 购物车商品不存在 |
| 40002 | 购物车商品数量超限 |
| 50001 | 订单不存在 |
| 50002 | 订单状态错误 |
| 50003 | 订单已支付 |
| 50004 | 订单已取消 |
| 60001 | 支付失败 |
| 60002 | 支付已处理 |
| 70001 | 地址不存在 |
| 80001 | 售后申请不存在 |
| 80002 | 售后状态错误 |
| 90001 | 文件上传失败 |
| 90002 | 文件类型不支持 |
| 90003 | 文件大小超限 |

---

## 2. 认证与授权接口

### 2.1 用户注册

**接口路径**: `POST /api/auth/register`

**接口描述**: 用户通过手机号或邮箱注册账户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名（3-20字符） |
| password | string | 是 | 密码（6-20字符） |
| phone | string | 是 | 手机号 |
| email | string | 否 | 邮箱 |
| code | string | 是 | 验证码 |
| nickname | string | 否 | 昵称 |

**请求示例**:

```json
{
  "username": "user123",
  "password": "123456",
  "phone": "13800138000",
  "email": "user@example.com",
  "code": "123456",
  "nickname": "小明"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user_id": 1001,
    "username": "user123",
    "phone": "13800138000",
    "nickname": "小明",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  },
  "timestamp": 1640995200000
}
```

---

### 2.2 用户登录

**接口路径**: `POST /api/auth/login`

**接口描述**: 用户通过账号密码登录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 账号（用户名/手机号/邮箱） |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "account": "user123",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": 1001,
    "username": "user123",
    "nickname": "小明",
    "avatar": "https://cdn.example.com/avatar/1001.jpg",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  },
  "timestamp": 1640995200000
}
```

---

### 2.3 用户登出

**接口路径**: `POST /api/auth/logout`

**接口描述**: 用户退出登录

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

### 2.4 微信授权登录

**接口路径**: `POST /api/auth/wechat-login`

**接口描述**: 通过微信授权快速登录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 微信授权码 |
| encryptedData | string | 否 | 加密数据（含用户信息） |
| iv | string | 否 | 加密算法的初始向量 |

**请求示例**:

```json
{
  "code": "071abc2345678def",
  "encryptedData": "K2v8y9...",
  "iv": "1234567890123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": 1001,
    "openid": "oXXXXxx",
    "unionid": "uXXXXxx",
    "nickname": "微信用户",
    "avatar": "https://thirdwx.qlogo.cn/...",
    "is_new_user": false,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  },
  "timestamp": 1640995200000
}
```

---

### 2.5 发送验证码

**接口路径**: `POST /api/auth/send-code`

**接口描述**: 发送短信或邮箱验证码

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| type | string | 是 | 验证码类型：register/login/reset_password |

**请求示例**:

```json
{
  "phone": "13800138000",
  "type": "register"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expires_in": 300
  },
  "timestamp": 1640995200000
}
```

---

### 2.6 刷新Token

**接口路径**: `POST /api/auth/refresh-token`

**接口描述**: 使用refresh_token刷新访问令牌

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refresh_token | string | 是 | 刷新令牌 |

**请求示例**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  },
  "timestamp": 1640995200000
}
```

---

## 3. 用户管理接口

### 3.1 获取用户信息

**接口路径**: `GET /api/user/profile`

**接口描述**: 获取当前登录用户的详细信息

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user_id": 1001,
    "username": "user123",
    "nickname": "小明",
    "avatar": "https://cdn.example.com/avatar/1001.jpg",
    "phone": "13800138000",
    "email": "user@example.com",
    "gender": 1,
    "birthday": "1990-01-01",
    "register_time": "2026-01-01 00:00:00",
    "last_login_time": "2026-03-04 10:00:00",
    "total_orders": 10,
    "total_amount": 5680.50
  },
  "timestamp": 1640995200000
}
```

---

### 3.2 更新用户信息

**接口路径**: `PUT /api/user/profile`

**接口描述**: 更新用户个人信息

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| gender | integer | 否 | 性别：0-未知 1-男 2-女 |
| birthday | string | 否 | 生日（格式：YYYY-MM-DD） |

**请求示例**:

```json
{
  "nickname": "新昵称",
  "gender": 1,
  "birthday": "1990-01-01"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "user_id": 1001,
    "nickname": "新昵称",
    "gender": 1,
    "birthday": "1990-01-01"
  },
  "timestamp": 1640995200000
}
```

---

### 3.3 获取收货地址列表

**接口路径**: `GET /api/user/addresses`

**接口描述**: 获取用户的所有收货地址

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区XX大厦10楼",
      "postal_code": "518000",
      "is_default": true,
      "created_at": "2026-01-01 00:00:00"
    },
    {
      "id": 2,
      "receiver_name": "李四",
      "phone": "13900139000",
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "detail": "天河路XX号",
      "postal_code": "510000",
      "is_default": false,
      "created_at": "2026-02-01 00:00:00"
    }
  ],
  "timestamp": 1640995200000
}
```

---

### 3.4 添加收货地址

**接口路径**: `POST /api/user/addresses`

**接口描述**: 添加新的收货地址

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| receiver_name | string | 是 | 收货人姓名 |
| phone | string | 是 | 收货人手机号 |
| province | string | 是 | 省 |
| city | string | 是 | 市 |
| district | string | 是 | 区 |
| detail | string | 是 | 详细地址 |
| postal_code | string | 否 | 邮政编码 |
| is_default | boolean | 否 | 是否设为默认地址 |

**请求示例**:

```json
{
  "receiver_name": "王五",
  "phone": "13700137000",
  "province": "广东省",
  "city": "深圳市",
  "district": "福田区",
  "detail": "深南大道XX号",
  "postal_code": "518000",
  "is_default": false
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 3,
    "receiver_name": "王五",
    "phone": "13700137000",
    "province": "广东省",
    "city": "深圳市",
    "district": "福田区",
    "detail": "深南大道XX号",
    "postal_code": "518000",
    "is_default": false
  },
  "timestamp": 1640995200000
}
```

---

### 3.5 更新收货地址

**接口路径**: `PUT /api/user/addresses/:id`

**接口描述**: 更新指定的收货地址

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 地址ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| receiver_name | string | 否 | 收货人姓名 |
| phone | string | 否 | 收货人手机号 |
| province | string | 否 | 省 |
| city | string | 否 | 市 |
| district | string | 否 | 区 |
| detail | string | 否 | 详细地址 |
| postal_code | string | 否 | 邮政编码 |
| is_default | boolean | 否 | 是否设为默认地址 |

**请求示例**:

```json
{
  "receiver_name": "王五(更新)",
  "detail": "深南大道XX号10楼"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 3,
    "receiver_name": "王五(更新)",
    "phone": "13700137000",
    "province": "广东省",
    "city": "深圳市",
    "district": "福田区",
    "detail": "深南大道XX号10楼",
    "postal_code": "518000",
    "is_default": false
  },
  "timestamp": 1640995200000
}
```

---

### 3.6 删除收货地址

**接口路径**: `DELETE /api/user/addresses/:id`

**接口描述**: 删除指定的收货地址

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 地址ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

### 3.7 设置默认地址

**接口路径**: `POST /api/user/addresses/default`

**接口描述**: 设置某个地址为默认地址

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 地址ID |

**请求示例**:

```json
{
  "id": 3
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "设置成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

## 4. 商品管理接口（用户端）

### 4.1 获取分类列表

**接口路径**: `GET /api/categories`

**接口描述**: 获取商品分类列表（树形结构）

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "食品饮料",
      "icon": "https://cdn.example.com/icons/food.png",
      "parent_id": 0,
      "sort": 1,
      "children": [
        {
          "id": 11,
          "name": "零食",
          "icon": "https://cdn.example.com/icons/snack.png",
          "parent_id": 1,
          "sort": 1
        },
        {
          "id": 12,
          "name": "饮料",
          "icon": "https://cdn.example.com/icons/drink.png",
          "parent_id": 1,
          "sort": 2
        }
      ]
    },
    {
      "id": 2,
      "name": "日用百货",
      "icon": "https://cdn.example.com/icons/daily.png",
      "parent_id": 0,
      "sort": 2,
      "children": []
    }
  ],
  "timestamp": 1640995200000
}
```

---

### 4.2 获取商品列表

**接口路径**: `GET /api/products`

**接口描述**: 获取商品列表，支持分页、筛选、排序

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |
| category_id | integer | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序方式：default/sales_price-asc/price-desc/newest |
| min_price | number | 否 | 最低价格 |
| max_price | number | 否 | 最高价格 |
| brand | string | 否 | 品牌 |

**请求示例**:

```
GET /api/products?page=1&page_size=20&category_id=11&sort=price_asc
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 101,
        "name": "薯片(原味)",
        "subtitle": "好吃不上火",
        "images": [
          "https://cdn.example.com/products/101-1.jpg",
          "https://cdn.example.com/products/101-2.jpg"
        ],
        "price": 12.80,
        "original_price": 15.00,
        "sales": 1000,
        "stock": 500,
        "category_id": 11,
        "category_name": "零食",
        "brand": "乐事",
        "tags": ["热销", "新品"],
        "is_new": true,
        "is_hot": true
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  },
  "timestamp": 1640995200000
}
```

---

### 4.3 获取商品详情

**接口路径**: `GET /api/products/:id`

**接口描述**: 获取商品的详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 商品ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 101,
    "name": "薯片(原味)",
    "subtitle": "好吃不上火",
    "description": "精选优质土豆，非油炸，健康美味...",
    "images": [
      "https://cdn.example.com/products/101-1.jpg",
      "https://cdn.example.com/products/101-2.jpg",
      "https://cdn.example.com/products/101-3.jpg"
    ],
    "price": 12.80,
    "original_price": 15.00,
    "cost_price": 8.00,
    "sales": 1000,
    "stock": 500,
    "category_id": 11,
    "category_name": "零食",
    "brand": "乐事",
    "production_date": "2026-01-01",
    "shelf_life": "12个月",
    "specs": [
      {
        "id": 1,
        "name": "规格",
        "values": ["70g", "100g", "150g"]
      }
    ],
    "tags": ["热销", "新品"],
    "is_new": true,
    "is_hot": true,
    "is_on_sale": true,
    "created_at": "2026-01-01 00:00:00",
    "updated_at": "2026-03-01 00:00:00"
  },
  "timestamp": 1640995200000
}
```

---

### 4.4 搜索商品

**接口路径**: `GET /api/products/search`

**接口描述**: 根据关键词搜索商品

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |

**请求示例**:

```
GET /api/products/search?keyword=薯片&page=1&page_size=20
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 101,
        "name": "薯片(原味)",
        "images": ["https://cdn.example.com/products/101-1.jpg"],
        "price": 12.80,
        "sales": 1000
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "total_pages": 3
    }
  },
  "timestamp": 1640995200000
}
```

---

### 4.5 热销商品

**接口路径**: `GET /api/products/hot`

**接口描述**: 获取热销商品列表

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | integer | 否 | 返回数量，默认20 |
| category_id | integer | 否 | 分类ID |

**请求示例**:

```
GET /api/products/hot?limit=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "name": "薯片(原味)",
      "images": ["https://cdn.example.com/products/101-1.jpg"],
      "price": 12.80,
      "sales": 1000
    }
  ],
  "timestamp": 1640995200000
}
```

---

### 4.6 新品推荐

**接口路径**: `GET /api/products/new`

**接口描述**: 获取新品推荐列表

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | integer | 否 | 返回数量，默认20 |
| category_id | integer | 否 | 分类ID |

**请求示例**:

```
GET /api/products/new?limit=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 201,
      "name": "新品薯片(番茄味)",
      "images": ["https://cdn.example.com/products/201-1.jpg"],
      "price": 13.80,
      "sales": 100,
      "is_new": true
    }
  ],
  "timestamp": 1640995200000
}
```

---

## 5. 商品管理接口（管理端）

### 5.1 创建商品

**接口路径**: `POST /api/admin/products`

**接口描述**: 管理员创建新商品

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 商品名称 |
| subtitle | string | 否 | 商品副标题 |
| description | string | 否 | 商品描述 |
| category_id | integer | 是 | 分类ID |
| brand | string | 否 | 品牌 |
| price | number | 是 | 售价 |
| original_price | number | 否 | 原价 |
| cost_price | number | 否 | 成本价 |
| stock | integer | 是 | 库存数量 |
| production_date | string | 否 | 生产日期 |
| shelf_life | string | 否 | 保质期 |
| images | array | 是 | 商品图片URL数组 |
| specs | array | 否 | 规格列表 |
| tags | array | 否 | 标签数组 |
| is_new | boolean | 否 | 是否新品 |
| is_hot | boolean | 否 | 是否热销 |
| is_on_sale | boolean | 否 | 是否促销 |

**请求示例**:

```json
{
  "name": "薯片(原味)",
  "subtitle": "好吃不上火",
  "description": "精选优质土豆，非油炸，健康美味",
  "category_id": 11,
  "brand": "乐事",
  "price": 12.80,
  "original_price": 15.00,
  "cost_price": 8.00,
  "stock": 500,
  "production_date": "2026-01-01",
  "shelf_life": "12个月",
  "images": [
    "https://cdn.example.com/products/101-1.jpg",
    "https://cdn.example.com/products/101-2.jpg"
  ],
  "specs": [
    {
      "name": "规格",
      "values": ["70g", "100g", "150g"]
    }
  ],
  "tags": ["热销", "新品"],
  "is_new": true,
  "is_hot": true,
  "is_on_sale": true
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 101,
    "name": "薯片(原味)",
    "price": 12.80,
    "stock": 500
  },
  "timestamp": 1640995200000
}
```

---

### 5.2 更新商品

**接口路径**: `PUT /api/admin/products/:id`

**接口描述**: 管理员更新商品信息

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 商品ID |

**请求参数**: 同创建商品（所有字段可选）

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 101,
    "name": "薯片(原味)",
    "price": 12.80
  },
  "timestamp": 1640995200000
}
```

---

### 5.3 删除商品

**接口路径**: `DELETE /api/admin/products/:id`

**接口描述**: 管理员删除商品（软删除）

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 商品ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

### 5.4 上传商品图片

**接口路径**: `POST /api/admin/products/:id/images`

**接口描述**: 为商品上传图片

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**请求类型**: `multipart/form-data`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 商品ID |

**表单参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 图片文件 |
| is_primary | boolean | 否 | 是否为主图 |

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/products/101-3.jpg",
    "is_primary": false
  },
  "timestamp": 1640995200000
}
```

---

### 5.5 管理分类列表

**接口路径**: `GET /api/admin/categories`

**接口描述**: 获取所有分类（管理端）

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parent_id | integer | 否 | 父分类ID，0获取顶级分类 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "食品饮料",
      "icon": "https://cdn.example.com/icons/food.png",
      "parent_id": 0,
      "sort": 1,
      "product_count": 100,
      "children": [
        {
          "id": 11,
          "name": "零食",
          "icon": "https://cdn.example.com/icons/snack.png",
          "parent_id": 1,
          "sort": 1,
          "product_count": 50
        }
      ]
    }
  ],
  "timestamp": 1640995200000
}
```

---

### 5.6 创建分类

**接口路径**: `POST /api/admin/categories`

**接口描述**: 管理员创建新分类

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 分类名称 |
| icon | string | 否 | 分类图标URL |
| parent_id | integer | 否 | 父分类ID，默认0（顶级分类） |
| sort | integer | 否 | 排序，默认0 |

**请求示例**:

```json
{
  "name": "零食",
  "icon": "https://cdn.example.com/icons/snack.png",
  "parent_id": 1,
  "sort": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 11,
    "name": "零食",
    "icon": "https://cdn.example.com/icons/snack.png",
    "parent_id": 1,
    "sort": 1
  },
  "timestamp": 1640995200000
}
```

---

### 5.7 更新分类

**接口路径**: `PUT /api/admin/categories/:id`

**接口描述**: 管理员更新分类信息

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 分类ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 分类名称 |
| icon | string | 否 | 分类图标URL |
| parent_id | integer | 否 | 父分类ID |
| sort | integer | 否 | 排序 |

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 11,
    "name": "零食",
    "sort": 2
  },
  "timestamp": 1640995200000
}
```

---

### 5.8 删除分类

**接口路径**: `DELETE /api/admin/categories/:id`

**接口描述**: 管理员删除分类

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 分类ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

## 6. 购物车接口

### 6.1 获取购物车

**接口路径**: `GET /api/cart`

**接口描述**: 获取当前用户的购物车列表

**请求头**: 需要 `Authorization: Bearer {access_token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "product_id": 101,
      "product_name": "薯片(原味)",
      "product_image": "https://cdn.example.com/products/101-1.jpg",
      "price": 12.80,
      "quantity": 2,
      "selected": true,
      "stock": 500,
      "specs": "100g"
    },
    {
      "id": 2,
      "product_id": 102,
      "product_name": "可乐",
      "product_image": "https://cdn.example.com/products/102-1.jpg",
      "price": 3.50,
      "quantity": 5,
      "selected": true,
      "stock": 1000,
      "specs": "330ml"
    }
  ],
  "summary": {
    "total_count": 7,
    "total_amount": 43.10,
    "selected_count": 7,
    "selected_amount": 43.10
  },
  "timestamp": 1640995200000
}
```

---

### 6.2 添加商品到购物车

**接口路径**: `POST /api/cart`

**接口描述**: 添加商品到购物车（如果已存在则增加数量）

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_id | integer | 是 | 商品ID |
| quantity | integer | 是 | 数量 |
| specs | string | 否 | 规格 |

**请求示例**:

```json
{
  "product_id": 101,
  "quantity": 2,
  "specs": "100g"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cart_id": 1,
    "product_id": 101,
    "quantity": 2
  },
  "timestamp": 1640995200000
}
```

---

### 6.3 更新购物车商品数量

**接口路径**: `PUT /api/cart/:id`

**接口描述**: 更新购物车中商品的数量

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 购物车项ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| quantity | integer | 是 | 新数量（大于0） |

**请求示例**:

```json
{
  "quantity": 3
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "quantity": 3
  },
  "timestamp": 1640995200000
}
```

---

### 6.4 删除购物车商品

**接口路径**: `DELETE /api/cart/:id`

**接口描述**: 从购物车中删除指定商品

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 购物车项ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1640995200000
}
```

---

### 6.5 清空购物车

**接口路径**: `POST /api/cart/clear`

**接口描述**: 清空当前用户的购物车

**请求头**: 需要 `Authorization: Bearer {access_token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "购物车已清空",
  "data": null,
  "timestamp": 1640995200000
}
```

---

### 6.6 选择/取消选择商品

**接口路径**: `POST /api/cart/select`

**接口描述**: 批量选择或取消选择购物车中的商品

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| cart_ids | array | 是 | 购物车项ID数组 |
| selected | boolean | 是 | 是否选中 |

**请求示例**:

```json
{
  "cart_ids": [1, 2, 3],
  "selected": true
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "selected_count": 3,
    "selected_amount": 43.10
  },
  "timestamp": 1640995200000
}
```

---

## 7. 订单接口

### 7.1 创建订单

**接口路径**: `POST /api/orders`

**接口描述**: 根据购物车选中商品创建订单

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| address_id | integer | 是 | 收货地址ID |
| cart_ids | array | 是 | 购物车项ID数组 |
| remark | string | 否 | 订单备注 |
| coupon_id | integer | 否 | 优惠券ID |

**请求示例**:

```json
{
  "address_id": 1,
  "cart_ids": [1, 2],
  "remark": "请周末配送",
  "coupon_id": 101
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "order_id": "20260304100001",
    "order_no": "20260304100001",
    "total_amount": 43.10,
    "discount_amount": 5.00,
    "delivery_fee": 6.00,
    "payable_amount": 44.10,
    "items": [
      {
        "product_id": 101,
        "product_name": "薯片(原味)",
        "product_image": "https://cdn.example.com/products/101-1.jpg",
        "price": 12.80,
        "quantity": 2,
        "subtotal": 25.60
      },
      {
        "product_id": 102,
        "product_name": "可乐",
        "product_image": "https://cdn.example.com/products/102-1.jpg",
        "price": 3.50,
        "quantity": 5,
        "subtotal": 17.50
      }
    ],
    "address": {
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区XX大厦10楼"
    },
    "created_at": "2026-03-04 10:00:00"
  },
  "timestamp": 1640995200000
}
```

---

### 7.2 获取订单列表

**接口路径**: `GET /api/orders`

**接口描述**: 获取当前用户的订单列表

**请求头**: 需要 `Authorization: Bearer {access_token}`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认10 |
| status | string | 否 | 订单状态：all/unpaid/pending/shipped/received/refund |

**请求示例**:

```
GET /api/orders?page=1&page_size=10&status=unpaid
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "order_id": "20260304100001",
        "order_no": "20260304100001",
        "status": "unpaid",
        "status_text": "待付款",
        "total_amount": 44.10,
        "product_count": 7,
        "product_image": "https://cdn.example.com/products/101-1.jpg",
        "created_at": "2026-03-04 10:00:00",
        "can_cancel": true,
        "can_pay": true
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 20,
      "total_pages": 2
    }
  },
  "timestamp": 1640995200000
}
```

---

### 7.3 获取订单详情

**接口路径**: `GET /api/orders/:id`

**接口描述**: 获取订单详细信息

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "20260304100001",
    "order_no": "20260304100001",
    "status": "shipped",
    "status_text": "待收货",
    "total_amount": 44.10,
    "discount_amount": 5.00,
    "delivery_fee": 6.00,
    "payable_amount": 44.10,
    "paid_amount": 44.10,
    "payment_method": "wechat",
    "payment_time": "2026-03-04 10:05:00",
    "remark": "请周末配送",
    "items": [
      {
        "product_id": 101,
        "product_name": "薯片(原味)",
        "product_image": "https://cdn.example.com/products/101-1.jpg",
        "price": 12.80,
        "quantity": 2,
        "subtotal": 25.60
      }
    ],
    "address": {
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区XX大厦10楼"
    },
    "shipment": {
      "logistics_company": "顺丰速运",
      "tracking_no": "SF1234567890",
      "shipped_at": "2026-03-04 15:00:00"
    },
    "timeline": [
      {
        "status": "created",
        "text": "订单已创建",
        "time": "2026-03-04 10:00:00"
      },
      {
        "status": "paid",
        "text": "订单已支付",
        "time": "2026-03-04 10:05:00"
      },
      {
        "status": "shipped",
        "text": "商家已发货",
        "time": "2026-03-04 15:00:00"
      }
    ],
    "created_at": "2026-03-04 10:00:00",
    "can_cancel": false,
    "can_pay": false,
    "can_confirm": true,
    "can_refund": true
  },
  "timestamp": 1640995200000
}
```

---

### 7.4 取消订单

**接口路径**: `POST /api/orders/:id/cancel`

**接口描述**: 取消未支付的订单

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reason | string | 否 | 取消原因 |

**请求示例**:

```json
{
  "reason": "不想要了"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "order_id": "20260304100001",
    "status": "cancelled"
  },
  "timestamp": 1640995200000
}
```

---

### 7.5 支付订单

**接口路径**: `POST /api/orders/:id/pay`

**接口描述**: 发起订单支付

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| payment_method | string | 是 | 支付方式：wechat/alipay |

**请求示例**:

```json
{
  "payment_method": "wechat"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "支付参数已生成",
  "data": {
    "order_id": "20260304100001",
    "payment_params": {
      "timeStamp": "1640995200",
      "nonceStr": "abc123",
      "package": "prepay_id=wx123",
      "signType": "RSA",
      "paySign": "sign123"
    }
  },
  "timestamp": 1640995200000
}
```

---

## 8. 订单管理接口（管理端）

### 8.1 订单列表（管理端）

**接口路径**: `GET /api/admin/orders`

**接口描述**: 管理员获取订单列表，支持复杂查询

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |
| order_no | string | 否 | 订单号 |
| receiver_name | string | 否 | 收货人姓名 |
| phone | string | 否 | 收货人手机号 |
| status | string | 否 | 订单状态 |
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**请求示例**:

```
GET /api/admin/orders?page=1&page_size=20&status=pending&phone=138
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "order_id": "20260304100001",
        "order_no": "20260304100001",
        "status": "pending",
        "status_text": "待发货",
        "total_amount": 44.10,
        "user": {
          "user_id": 1001,
          "nickname": "小明",
          "avatar": "https://cdn.example.com/avatar/1001.jpg"
        },
        "receiver_name": "张三",
        "phone": "13800138000",
        "address": "广东省深圳市南山区科技园南区XX大厦10楼",
        "payment_method": "wechat",
        "created_at": "2026-03-04 10:00:00",
        "paid_at": "2026-03-04 10:05:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  },
  "timestamp": 1640995200000
}
```

---

### 8.2 订单详情（管理端）

**接口路径**: `GET /api/admin/orders/:id`

**接口描述**: 管理员获取订单详细信息

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "20260304100001",
    "order_no": "20260304100001",
    "status": "pending",
    "status_text": "待发货",
    "total_amount": 44.10,
    "discount_amount": 5.00,
    "delivery_fee": 6.00,
    "payable_amount": 44.10,
    "paid_amount": 44.10,
    "payment_method": "wechat",
    "payment_time": "2026-03-04 10:05:00",
    "remark": "请周末配送",
    "user": {
      "user_id": 1001,
      "username": "user123",
      "nickname": "小明",
      "phone": "13800138000",
      "avatar": "https://cdn.example.com/avatar/1001.jpg",
      "register_time": "2026-01-01 00:00:00",
      "total_orders": 10,
      "total_amount": 5680.50
    },
    "items": [
      {
        "product_id": 101,
        "product_name": "薯片(原味)",
        "product_image": "https://cdn.example.com/products/101-1.jpg",
        "price": 12.80,
        "quantity": 2,
        "subtotal": 25.60
      }
    ],
    "address": {
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区XX大厦10楼",
      "postal_code": "518000"
    },
    "shipment": {
      "logistics_company": "顺丰速运",
      "tracking_no": "SF1234567890",
      "shipped_at": "2026-03-04 15:00:00"
    },
    "created_at": "2026-03-04 10:00:00"
  },
  "timestamp": 1640995200000
}
```

---

### 8.3 订单发货

**接口路径**: `POST /api/admin/orders/:id/ship`

**接口描述**: 管理员为订单安排发货

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logistics_company | string | 是 | 物流公司 |
| tracking_no | string | 是 | 快递单号 |
| remark | string | 否 | 发货备注 |

**请求示例**:

```json
{
  "logistics_company": "顺丰速运",
  "tracking_no": "SF1234567890",
  "remark": "包裹轻放"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "发货成功",
  "data": {
    "order_id": "20260304100001",
    "status": "shipped",
    "shipment": {
      "logistics_company": "顺丰速运",
      "tracking_no": "SF1234567890",
      "shipped_at": "2026-03-04 15:00:00"
    }
  },
  "timestamp": 1640995200000
}
```

---

### 8.4 更新订单状态

**接口路径**: `PUT /api/admin/orders/:id/status`

**接口描述**: 管理员手动更新订单状态

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 是 | 新状态 |
| remark | string | 否 | 备注说明 |

**请求示例**:

```json
{
  "status": "received",
  "remark": "用户已确认收货"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "order_id": "20260304100001",
    "status": "received"
  },
  "timestamp": 1640995200000
}
```

---

### 8.5 订单统计

**接口路径**: `GET /api/admin/orders/statistics`

**接口描述**: 获取订单统计数据

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**请求示例**:

```
GET /api/admin/orders/statistics?start_date=2026-03-01&end_date=2026-03-04
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_orders": 500,
    "total_amount": 25000.00,
    "paid_orders": 450,
    "paid_amount": 23000.00,
    "unpaid_orders": 30,
    "unpaid_amount": 1500.00,
    "shipped_orders": 300,
    "received_orders": 100,
    "cancelled_orders": 20,
    "refunded_orders": 5,
    "refunded_amount": 250.00,
    "by_status": {
      "unpaid": 30,
      "pending": 100,
      "shipped": 300,
      "received": 50,
      "cancelled": 20
    },
    "by_date": [
      {
        "date": "2026-03-01",
        "orders": 150,
        "amount": 7500.00
      },
      {
        "date": "2026-03-02",
        "orders": 180,
        "amount": 9000.00
      }
    ]
  },
  "timestamp": 1640995200000
}
```

---

## 9. 支付接口

### 9.1 创建支付

**接口路径**: `POST /api/payment/create`

**接口描述**: 创建支付订单，获取支付参数

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 是 | 订单号 |
| payment_method | string | 是 | 支付方式：wechat/alipay |

**请求示例**:

```json
{
  "order_id": "20260304100001",
  "payment_method": "wechat"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "支付参数已生成",
  "data": {
    "payment_id": "PAY20260304100001",
    "order_id": "20260304100001",
    "amount": 44.10,
    "payment_params": {
      "timeStamp": "1640995200",
      "nonceStr": "abc123",
      "package": "prepay_id=wx123",
      "signType": "RSA",
      "paySign": "sign123"
    }
  },
  "timestamp": 1640995200000
}
```

---

### 9.2 支付回调

**接口路径**: `POST /api/payment/callback`

**接口描述**: 微信支付回调接口（服务端调用）

**请求参数**: 微信支付回调数据

**响应示例**:

```json
{
  "code": "SUCCESS",
  "message": "成功"
}
```

---

### 9.3 查询支付状态

**接口路径**: `GET /api/payment/:id/status`

**接口描述**: 查询订单支付状态

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "20260304100001",
    "payment_id": "PAY20260304100001",
    "status": "paid",
    "status_text": "已支付",
    "payment_method": "wechat",
    "amount": 44.10,
    "paid_at": "2026-03-04 10:05:00",
    "transaction_id": "wx1234567890"
  },
  "timestamp": 1640995200000
}
```

---

### 9.4 申请退款

**接口路径**: `POST /api/payment/refund`

**接口描述**: 申请订单退款

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 是 | 订单号 |
| reason | string | 是 | 退款原因 |
| amount | number | 否 | 退款金额，不填则全额退款 |

**请求示例**:

```json
{
  "order_id": "20260304100001",
  "reason": "商品质量问题",
  "amount": 44.10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "退款申请已提交",
  "data": {
    "refund_id": "REF20260304100001",
    "order_id": "20260304100001",
    "amount": 44.10,
    "status": "processing"
  },
  "timestamp": 1640995200000
}
```

---

## 10. 物流接口

### 10.1 查询物流信息

**接口路径**: `GET /api/orders/:id/shipment`

**接口描述**: 用户查询订单物流信息

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "20260304100001",
    "logistics_company": "顺丰速运",
    "logistics_code": "SF",
    "tracking_no": "SF1234567890",
    "status": "shipping",
    "status_text": "运输中",
    "traces": [
      {
        "time": "2026-03-04 18:00:00",
        "status": "已签收",
        "location": "深圳市南山区科技园",
        "description": "已签收，签收人：前台"
      },
      {
        "time": "2026-03-04 10:00:00",
        "status": "派送中",
        "location": "深圳市南山区营业点",
        "description": "快件正在派送中"
      },
      {
        "time": "2026-03-03 20:00:00",
        "status": "运输中",
        "location": "深圳转运中心",
        "description": "快件已到达深圳转运中心"
      },
      {
        "time": "2026-03-03 15:00:00",
        "status": "已揽收",
        "location": "深圳市营业点",
        "description": "顺丰速运 已收取快件"
      }
    ],
    "shipped_at": "2026-03-03 15:00:00",
    "estimated_delivery": "2026-03-05"
  },
  "timestamp": 1640995200000
}
```

---

### 10.2 录入快递单号

**接口路径**: `POST /api/admin/orders/:id/tracking-no`

**接口描述**: 管理员为订单录入或更新快递单号

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 订单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logistics_company | string | 是 | 物流公司 |
| tracking_no | string | 是 | 快递单号 |

**请求示例**:

```json
{
  "logistics_company": "顺丰速运",
  "tracking_no": "SF1234567890"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "录入成功",
  "data": {
    "order_id": "20260304100001",
    "logistics_company": "顺丰速运",
    "tracking_no": "SF1234567890"
  },
  "timestamp": 1640995200000
}
```

---

### 10.3 物流轨迹查询

**接口路径**: `GET /api/logistics/:company/:no`

**接口描述**: 根据快递公司和单号查询物流轨迹

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| company | string | 是 | 物流公司代码（SF/YTO/STO等） |
| no | string | 是 | 快递单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "logistics_company": "顺丰速运",
    "logistics_code": "SF",
    "tracking_no": "SF1234567890",
    "status": "shipping",
    "status_text": "运输中",
    "traces": [
      {
        "time": "2026-03-04 18:00:00",
        "status": "已签收",
        "location": "深圳市南山区科技园",
        "description": "已签收，签收人：前台"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

---

## 11. 售后接口

### 11.1 申请售后

**接口路径**: `POST /api/refunds`

**接口描述**: 用户申请退款或退货

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 是 | 订单号 |
| type | string | 是 | 售后类型：refund/return |
| reason | string | 是 | 售后原因 |
| description | string | 否 | 详细说明 |
| images | array | 否 | 凭证图片URL数组 |
| amount | number | 否 | 退款金额 |

**请求示例**:

```json
{
  "order_id": "20260304100001",
  "type": "refund",
  "reason": "商品质量问题",
  "description": "收到的商品包装破损",
  "images": [
    "https://cdn.example.com/refund/101-1.jpg",
    "https://cdn.example.com/refund/101-2.jpg"
  ],
  "amount": 44.10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "售后申请已提交",
  "data": {
    "refund_id": "REF20260304100001",
    "order_id": "20260304100001",
    "type": "refund",
    "status": "pending",
    "amount": 44.10
  },
  "timestamp": 1640995200000
}
```

---

### 11.2 售后列表

**接口路径**: `GET /api/refunds`

**接口描述**: 获取用户的售后申请列表

**请求头**: 需要 `Authorization: Bearer {access_token}`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认10 |
| status | string | 否 | 状态：all/pending/approved/rejected/completed |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "refund_id": "REF20260304100001",
        "order_id": "20260304100001",
        "type": "refund",
        "status": "pending",
        "status_text": "待审核",
        "reason": "商品质量问题",
        "amount": 44.10,
        "created_at": "2026-03-04 20:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 5,
      "total_pages": 1
    }
  },
  "timestamp": 1640995200000
}
```

---

### 11.3 售后详情

**接口路径**: `GET /api/refunds/:id`

**接口描述**: 获取售后申请详情

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 售后单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "refund_id": "REF20260304100001",
    "order_id": "20260304100001",
    "type": "refund",
    "status": "approved",
    "status_text": "已通过",
    "reason": "商品质量问题",
    "description": "收到的商品包装破损",
    "images": [
      "https://cdn.example.com/refund/101-1.jpg"
    ],
    "amount": 44.10,
    "refund_amount": 44.10,
    "reply": "已审核通过，退款将在3-5个工作日内到账",
    "timeline": [
      {
        "status": "created",
        "text": "提交售后申请",
        "time": "2026-03-04 20:00:00"
      },
      {
        "status": "approved",
        "text": "审核通过",
        "time": "2026-03-05 10:00:00"
      }
    ],
    "created_at": "2026-03-04 20:00:00",
    "updated_at": "2026-03-05 10:00:00"
  },
  "timestamp": 1640995200000
}
```

---

### 11.4 取消售后

**接口路径**: `POST /api/refunds/:id/cancel`

**接口描述**: 用户取消售后申请

**请求头**: 需要 `Authorization: Bearer {access_token}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 售后单号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "售后申请已取消",
  "data": {
    "refund_id": "REF20260304100001",
    "status": "cancelled"
  },
  "timestamp": 1640995200000
}
```

---

## 12. 售后管理接口（管理端）

### 12.1 售后申请列表（管理端）

**接口路径**: `GET /api/admin/refunds`

**接口描述**: 管理员获取售后申请列表

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |
| status | string | 否 | 状态 |
| type | string | 否 | 类型 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "refund_id": "REF20260304100001",
        "order_id": "20260304100001",
        "type": "refund",
        "status": "pending",
        "status_text": "待审核",
        "reason": "商品质量问题",
        "amount": 44.10,
        "user": {
          "user_id": 1001,
          "nickname": "小明",
          "phone": "13800138000"
        },
        "created_at": "2026-03-04 20:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "total_pages": 3
    }
  },
  "timestamp": 1640995200000
}
```

---

### 12.2 审核通过

**接口路径**: `PUT /api/admin/refunds/:id/approve`

**接口描述**: 管理员审核通过售后申请

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 售后单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reply | string | 否 | 审核回复 |
| refund_amount | number | 否 | 实际退款金额 |

**请求示例**:

```json
{
  "reply": "已审核通过，退款将在3-5个工作日内到账",
  "refund_amount": 44.10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "审核通过",
  "data": {
    "refund_id": "REF20260304100001",
    "status": "approved",
    "refund_amount": 44.10
  },
  "timestamp": 1640995200000
}
```

---

### 12.3 审核驳回

**接口路径**: `PUT /api/admin/refunds/:id/reject`

**接口描述**: 管理员驳回售后申请

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 售后单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reason | string | 是 | 驳回原因 |

**请求示例**:

```json
{
  "reason": "商品已使用，不符合退货条件"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "已驳回",
  "data": {
    "refund_id": "REF20260304100001",
    "status": "rejected"
  },
  "timestamp": 1640995200000
}
```

---

### 12.4 处理退款

**接口路径**: `POST /api/admin/refunds/:id/refund`

**接口描述**: 管理员处理退款操作

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 售后单号 |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| amount | number | 是 | 退款金额 |

**请求示例**:

```json
{
  "amount": 44.10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "退款处理成功",
  "data": {
    "refund_id": "REF20260304100001",
    "status": "completed",
    "refund_amount": 44.10,
    "refunded_at": "2026-03-05 15:00:00"
  },
  "timestamp": 1640995200000
}
```

---

## 13. 配送管理接口

### 13.1 查询配送费

**接口路径**: `GET /api/delivery/fee`

**接口描述**: 查询订单的配送费用

**请求头**: 需要 `Authorization: Bearer {access_token}`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| province | string | 是 | 省 |
| city | string | 是 | 市 |
| district | string | 是 | 区 |
| cart_ids | array | 是 | 购物车项ID数组 |

**请求示例**:

```
GET /api/delivery/fee?province=广东省&city=深圳市&district=南山区&cart_ids=1,2
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "delivery_fee": 6.00,
    "free_delivery_threshold": 99.00,
    "current_amount": 43.10,
    "is_free": false,
    "rules": [
      {
        "region": "深圳市",
        "fee": 6.00,
        "free_threshold": 99.00
      }
    ]
  },
  "timestamp": 1640995200000
}
```

---

### 13.2 更新配送规则

**接口路径**: `PUT /api/admin/delivery/rules`

**接口描述**: 管理员更新配送规则

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| rules | array | 是 | 配送规则数组 |

**请求示例**:

```json
{
  "rules": [
    {
      "region_type": "city",
      "province": "广东省",
      "city": "深圳市",
      "fee": 6.00,
      "free_threshold": 99.00
    },
    {
      "region_type": "city",
      "province": "广东省",
      "city": "广州市",
      "fee": 8.00,
      "free_threshold": 99.00
    },
    {
      "region_type": "default",
      "fee": 10.00,
      "free_threshold": 99.00
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "updated_count": 3
  },
  "timestamp": 1640995200000
}
```

---

## 14. 用户管理接口（管理端）

### 14.1 用户列表

**接口路径**: `GET /api/admin/users`

**接口描述**: 管理员获取用户列表

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（昵称/手机号） |
| start_date | string | 否 | 注册开始日期 |
| end_date | string | 否 | 注册结束日期 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "user_id": 1001,
        "username": "user123",
        "nickname": "小明",
        "avatar": "https://cdn.example.com/avatar/1001.jpg",
        "phone": "13800138000",
        "register_time": "2026-01-01 00:00:00",
        "last_login_time": "2026-03-04 10:00:00",
        "total_orders": 10,
        "total_amount": 5680.50,
        "remark": ""
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 500,
      "total_pages": 25
    }
  },
  "timestamp": 1640995200000
}
```

---

### 14.2 用户详情

**接口路径**: `GET /api/admin/users/:id`

**接口描述**: 管理员获取用户详细信息

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user_id": 1001,
    "username": "user123",
    "nickname": "小明",
    "avatar": "https://cdn.example.com/avatar/1001.jpg",
    "phone": "13800138000",
    "email": "user@example.com",
    "gender": 1,
    "birthday": "1990-01-01",
    "register_time": "2026-01-01 00:00:00",
    "last_login_time": "2026-03-04 10:00:00",
    "total_orders": 10,
    "total_amount": 5680.50,
    "addresses": [
      {
        "id": 1,
        "receiver_name": "张三",
        "phone": "13800138000",
        "province": "广东省",
        "city": "深圳市",
        "district": "南山区",
        "detail": "科技园南区XX大厦10楼",
        "is_default": true
      }
    ],
    "remark": "VIP客户"
  },
  "timestamp": 1640995200000
}
```

---

### 14.3 用户订单

**接口路径**: `GET /api/admin/users/:id/orders`

**接口描述**: 管理员查看指定用户的订单列表

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20 |
| status | string | 否 | 订单状态 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "user_id": 1001,
      "nickname": "小明",
      "phone": "13800138000"
    },
    "items": [
      {
        "order_id": "20260304100001",
        "order_no": "20260304100001",
        "status": "received",
        "status_text": "已完成",
        "total_amount": 44.10,
        "created_at": "2026-03-04 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 10,
      "total_pages": 1
    }
  },
  "timestamp": 1640995200000
}
```

---

### 14.4 用户备注

**接口路径**: `PUT /api/admin/users/:id/remark`

**接口描述**: 管理员为用户添加或修改备注

**请求头**: 需要 `Authorization: Bearer {access_token}`（管理员权限）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| remark | string | 是 | 备注内容 |

**请求示例**:

```json
{
  "remark": "VIP客户，优先处理"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "备注已更新",
  "data": {
    "user_id": 1001,
    "remark": "VIP客户，优先处理"
  },
  "timestamp": 1640995200000
}
```

---

## 15. 文件上传接口

### 15.1 上传图片

**接口路径**: `POST /api/upload/image`

**接口描述**: 上传图片文件

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求类型**: `multipart/form-data`

**表单参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 图片文件 |
| type | string | 否 | 图片类型：product/avatar/refund/other |

**请求示例**:

```
POST /api/upload/image
Content-Type: multipart/form-data

file: [binary]
type: product
```

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/20260304/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 102400,
    "width": 800,
    "height": 600,
    "mime_type": "image/jpeg"
  },
  "timestamp": 1640995200000
}
```

---

### 15.2 上传文件

**接口路径**: `POST /api/upload/file`

**接口描述**: 上传普通文件

**请求头**: 需要 `Authorization: Bearer {access_token}`

**请求类型**: `multipart/form-data`

**表单参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 文件 |
| type | string | 否 | 文件类型 |

**请求示例**:

```
POST /api/upload/file
Content-Type: multipart/form-data

file: [binary]
type: document
```

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/files/20260304/xyz789.pdf",
    "filename": "xyz789.pdf",
    "size": 204800,
    "mime_type": "application/pdf"
  },
  "timestamp": 1640995200000
}
```

---

## 16. 错误码说明

### 16.1 通用错误码（10xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 10001 | 参数验证失败 | 检查请求参数格式和必填项 |
| 10002 | 用户不存在 | 确认用户ID或账号是否正确 |
| 10003 | 密码错误 | 确认密码是否正确 |
| 10004 | 用户已存在 | 使用其他账号注册 |
| 10005 | 验证码错误 | 确认验证码是否正确 |
| 10006 | 验证码已过期 | 重新获取验证码 |

### 16.2 认证错误码（20xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 20001 | Token无效 | 重新登录获取新Token |
| 20002 | Token已过期 | 使用refresh_token刷新或重新登录 |
| 20003 | 无权限访问 | 确认用户权限等级 |

### 16.3 商品错误码（30xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 30001 | 商品不存在 | 确认商品ID是否正确 |
| 30002 | 商品库存不足 | 减少购买数量或等待补货 |
| 30003 | 商品已下架 | 选择其他商品 |

### 16.4 购物车错误码（40xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 40001 | 购物车商品不存在 | 刷新购物车重新添加 |
| 40002 | 购物车商品数量超限 | 减少购买数量 |

### 16.5 订单错误码（50xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 50001 | 订单不存在 | 确认订单号是否正确 |
| 50002 | 订单状态错误 | 确认当前订单状态是否允许该操作 |
| 50003 | 订单已支付 | 无需重复支付 |
| 50004 | 订单已取消 | 重新下单 |

### 16.6 支付错误码（60xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 60001 | 支付失败 | 检查支付账户余额或重新发起支付 |
| 60002 | 支付已处理 | 不要重复处理支付结果 |

### 16.7 地址错误码（70xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 70001 | 地址不存在 | 确认地址ID是否正确 |

### 16.8 售后错误码（80xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 80001 | 售后申请不存在 | 确认售后单号是否正确 |
| 80002 | 售后状态错误 | 确认当前状态是否允许该操作 |

### 16.9 文件错误码（90xxx）

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 90001 | 文件上传失败 | 检查网络或重新上传 |
| 90002 | 文件类型不支持 | 上传支持的文件类型 |
| 90003 | 文件大小超限 | 压缩文件或选择较小的文件 |

---

## 附录

### A. 订单状态枚举

| 状态值 | 说明 | 中文 |
|--------|------|------|
| unpaid | 未支付 | 待付款 |
| pending | 已支付待发货 | 待发货 |
| shipped | 已发货 | 待收货 |
| received | 已收货 | 已完成 |
| cancelled | 已取消 | 已取消 |
| refunding | 退款中 | 退款中 |
| refunded | 已退款 | 已退款 |

### B. 售后状态枚举

| 状态值 | 说明 | 中文 |
|--------|------|------|
| pending | 待审核 | 待审核 |
| approved | 已通过 | 已通过 |
| rejected | 已驳回 | 已驳回 |
| completed | 已完成 | 已完成 |
| cancelled | 已取消 | 已取消 |

### C. 售后类型枚举

| 类型值 | 说明 | 中文 |
|--------|------|------|
| refund | 仅退款 | 仅退款 |
| return | 退货退款 | 退货退款 |

### D. 支付方式枚举

| 方式值 | 说明 | 中文 |
|--------|------|------|
| wechat | 微信支付 | 微信支付 |
| alipay | 支付宝 | 支付宝 |

### E. 物流公司代码

| 代码 | 名称 |
|------|------|
| SF | 顺丰速运 |
| YTO | 圆通速递 |
| STO | 申通快递 |
| ZTO | 中通快递 |
| Yunda | 韵达快递 |
| EMS | EMS |

### F. 性能要求

- 接口响应时间：
  - 查询接口：< 200ms
  - 列表接口：< 500ms
  - 创建/更新接口：< 1000ms

- 并发支持：
  - 支持至少1000并发用户
  - 峰值支持5000 QPS

### G. 安全要求

1. 所有接口必须使用HTTPS协议
2. 敏感数据必须加密传输
3. Token有效期2小时，refresh_token有效期30天
4. 接口限流：同一用户每秒最多10次请求
5. 文件上传大小限制：单文件最大10MB
6. 支持的图片格式：JPG、PNG、GIF、WEBP

---

## 文档修订记录

| 版本 | 日期 | 修订人 | 修订内容 |
|------|------|--------|----------|
| v1.0.0 | 2026-03-04 | 系统 | 初始版本 |

---

**文档结束**
