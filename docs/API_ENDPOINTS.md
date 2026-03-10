# API端点完整清单

**项目**: 微信小程序"在线购物"
**版本**: v1.0.0
**更新日期**: 2026-03-05
**API基础路径**: http://localhost:3000/api

## 目录

- [用户端API](#用户端api)
  - [商品模块](#商品模块)
  - [购物车模块](#购物车模块)
  - [订单模块](#订单模块)
  - [收货地址模块](#收货地址模块)
  - [用户认证模块](#用户认证模块)
- [管理端API](#管理端api)
  - [管理员认证](#管理员认证)
  - [商品管理](#商品管理)
  - [订单管理](#订单管理)
- [系统API](#系统api)
- [响应格式](#响应格式)
- [错误代码](#错误代码)

---

## 用户端API

### 商品模块

#### 1. 获取商品列表

**基本信息**
- **方法**: GET
- **路径**: `/api/products/list`
- **说明**: 获取商品列表，支持分页、排序、筛选
- **认证**: 不需要

**请求参数**
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| page | Integer | 否 | 页码，默认1 | 1 |
| pageSize | Integer | 否 | 每页数量，默认10 | 10 |
| categoryId | Integer | 否 | 分类ID | 4 |
| keyword | String | 否 | 搜索关键词 | "苹果" |
| sortBy | String | 否 | 排序字段，默认created_at | "sold_num" |
| sortOrder | String | 否 | 排序方向，默认DESC | "ASC" |
| tag | String | 否 | 商品标签 | "热销" |

**请求示例**
```http
GET /api/products/list?page=1&pageSize=10&categoryId=4&sortBy=sold_num&sortOrder=DESC
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "spu_code": "SPU001",
      "title": "新疆阿克苏苹果",
      "subtitle": "新鲜脆甜 果园直发",
      "category_id": 4,
      "brand": "阿克苏",
      "primary_image": "https://example.com/products/apple.jpg",
      "min_sale_price": "29.90",
      "max_line_price": "59.00",
      "sold_num": 128,
      "tags": "热销",
      "status": 1,
      "category": {
        "id": 4,
        "category_name": "蔬菜水果",
        "category_code": "FRESH_FRUIT"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 7,
    "totalPages": 1
  },
  "msg": "获取成功"
}
```

#### 2. 获取商品详情

**基本信息**
- **方法**: GET
- **路径**: `/api/products/detail/:id`
- **说明**: 获取商品SPU详情，包含SKU列表
- **认证**: 不需要

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 商品SPU ID |

**请求示例**
```http
GET /api/products/detail/1
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "spu_code": "SPU001",
    "title": "新疆阿克苏苹果",
    "subtitle": "新鲜脆甜 果园直发",
    "description": "产自新疆阿克苏的优质苹果...",
    "category_id": 4,
    "brand": "阿克苏",
    "primary_image": "https://example.com/products/apple.jpg",
    "min_sale_price": "29.90",
    "max_line_price": "59.00",
    "sold_num": 128,
    "total_stock": 500,
    "tags": "热销",
    "status": 1,
    "category": {
      "id": 4,
      "category_name": "蔬菜水果",
      "category_code": "FRESH_FRUIT"
    },
    "skus": [
      {
        "id": 1,
        "sku_code": "SKU001-1",
        "spu_id": 1,
        "specs": "{\"颜色\": \"红色\", \"重量\": \"5kg\"}",
        "sale_price": "29.90",
        "line_price": "39.90",
        "stock": 200
      }
    ]
  },
  "msg": "获取成功"
}
```

#### 3. 获取分类列表

**基本信息**
- **方法**: GET
- **路径**: `/api/products/categories/list`
- **说明**: 获取所有分类（扁平结构）
- **认证**: 不需要

**请求示例**
```http
GET /api/products/categories/list
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "category_name": "生鲜食品",
      "category_code": "CATEGORY_FRESH",
      "icon_url": "https://example.com/icons/fresh.png",
      "sort_order": 1,
      "status": 1
    }
  ],
  "msg": "获取成功"
}
```

#### 4. 获取分类树

**基本信息**
- **方法**: GET
- **路径**: `/api/products/categories/tree`
- **说明**: 获取分类树形结构
- **认证**: 不需要

**请求示例**
```http
GET /api/products/categories/tree
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "category_name": "生鲜食品",
      "category_code": "CATEGORY_FRESH",
      "icon_url": "https://example.com/icons/fresh.png",
      "sort_order": 1,
      "status": 1,
      "children": [
        {
          "id": 4,
          "parent_id": 1,
          "category_name": "蔬菜水果",
          "category_code": "FRESH_FRUIT",
          "children": []
        }
      ]
    }
  ],
  "msg": "获取成功"
}
```

---

### 购物车模块

#### 5. 加入购物车

**基本信息**
- **方法**: POST
- **路径**: `/api/cart/add`
- **说明**: 添加商品到购物车
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "sku_id": 1,
  "quantity": 2
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sku_id | Integer | 是 | 商品SKU ID |
| quantity | Integer | 是 | 数量 |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "user_id": 1,
    "sku_id": 1,
    "quantity": 2,
    "is_checked": 1
  },
  "msg": "添加成功"
}
```

#### 6. 获取购物车列表

**基本信息**
- **方法**: GET
- **路径**: `/api/cart/list`
- **说明**: 获取用户购物车列表
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "sku_id": 1,
      "quantity": 2,
      "is_checked": 1,
      "sku": {
        "id": 1,
        "sku_code": "SKU001-1",
        "sale_price": "29.90",
        "stock": 200,
        "spu": {
          "id": 1,
          "title": "新疆阿克苏苹果",
          "primary_image": "https://example.com/products/apple.jpg"
        }
      }
    }
  ],
  "msg": "获取成功"
}
```

#### 7. 修改购物车

**基本信息**
- **方法**: PUT
- **路径**: `/api/cart/update`
- **说明**: 修改购物车商品数量
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "id": 1,
  "quantity": 3
}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "quantity": 3
  },
  "msg": "修改成功"
}
```

#### 8. 删除购物车商品

**基本信息**
- **方法**: DELETE
- **路径**: `/api/cart/delete/:id`
- **说明**: 删除购物车中的商品
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 购物车项ID |

**响应示例**
```json
{
  "code": "Success",
  "data": null,
  "msg": "删除成功"
}
```

---

### 订单模块

#### 9. 创建订单

**基本信息**
- **方法**: POST
- **路径**: `/api/orders/create`
- **说明**: 创建新订单
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "address_id": 1,
  "items": [
    {
      "sku_id": 1,
      "quantity": 2
    }
  ],
  "remark": "请尽快发货"
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| address_id | Integer | 是 | 收货地址ID |
| items | Array | 是 | 商品列表 |
| items[].sku_id | Integer | 是 | 商品SKU ID |
| items[].quantity | Integer | 是 | 数量 |
| remark | String | 否 | 订单备注 |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "order_no": "ORD20260305001",
    "user_id": 1,
    "total_amount": "59.80",
    "status": "pending",
    "created_at": "2026-03-05T15:30:00.000Z"
  },
  "msg": "订单创建成功"
}
```

#### 10. 获取订单列表

**基本信息**
- **方法**: GET
- **路径**: `/api/orders/list`
- **说明**: 获取用户订单列表
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| status | String | 否 | 订单状态筛选 |

**请求示例**
```http
GET /api/orders/list?page=1&pageSize=10
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "order_no": "ORD20260305001",
      "total_amount": "59.80",
      "status": "pending",
      "created_at": "2026-03-05T15:30:00.000Z",
      "items": [
        {
          "id": 1,
          "sku_id": 1,
          "quantity": 2,
          "price": "29.90"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  },
  "msg": "获取成功"
}
```

#### 11. 获取订单详情

**基本信息**
- **方法**: GET
- **路径**: `/api/orders/detail/:id`
- **说明**: 获取订单详情
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 订单ID |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "order_no": "ORD20260305001",
    "user_id": 1,
    "total_amount": "59.80",
    "status": "pending",
    "remark": "请尽快发货",
    "created_at": "2026-03-05T15:30:00.000Z",
    "address": {
      "consignee": "张三",
      "phone": "13800138000",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "detail_address": "某某街道123号"
    },
    "items": [
      {
        "id": 1,
        "sku_id": 1,
        "quantity": 2,
        "price": "29.90",
        "sku": {
          "spu": {
            "title": "新疆阿克苏苹果",
            "primary_image": "https://example.com/products/apple.jpg"
          }
        }
      }
    ]
  },
  "msg": "获取成功"
}
```

---

### 收货地址模块

#### 12. 添加收货地址

**基本信息**
- **方法**: POST
- **路径**: `/api/addresses`
- **说明**: 添加新的收货地址
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "consignee": "张三",
  "phone": "13800138000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail_address": "某某街道123号",
  "is_default": 1
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| consignee | String | 是 | 收货人姓名 |
| phone | String | 是 | 收货人电话 |
| province | String | 是 | 省份 |
| city | String | 是 | 城市 |
| district | String | 是 | 区县 |
| detail_address | String | 是 | 详细地址 |
| is_default | Integer | 否 | 是否默认地址，0或1 |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "user_id": 1,
    "consignee": "张三",
    "phone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail_address": "某某街道123号",
    "is_default": 1
  },
  "msg": "添加成功"
}
```

#### 13. 获取收货地址列表

**基本信息**
- **方法**: GET
- **路径**: `/api/addresses`
- **说明**: 获取用户所有收货地址
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "consignee": "张三",
      "phone": "13800138000",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "detail_address": "某某街道123号",
      "is_default": 1
    }
  ],
  "msg": "获取成功"
}
```

#### 14. 更新收货地址

**基本信息**
- **方法**: PUT
- **路径**: `/api/addresses/:id`
- **说明**: 更新收货地址信息
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 地址ID |

**请求体**
```json
{
  "consignee": "李四",
  "phone": "13900139000",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "detail_address": "某某路456号"
}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "consignee": "李四",
    "phone": "13900139000"
  },
  "msg": "更新成功"
}
```

#### 15. 删除收货地址

**基本信息**
- **方法**: DELETE
- **路径**: `/api/addresses/:id`
- **说明**: 删除收货地址
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 地址ID |

**响应示例**
```json
{
  "code": "Success",
  "data": null,
  "msg": "删除成功"
}
```

---

### 用户认证模块

#### 16. 用户注册

**基本信息**
- **方法**: POST
- **路径**: `/api/users/register`
- **说明**: 新用户注册
- **认证**: 不需要

**请求体**
```json
{
  "username": "newuser",
  "password": "123456",
  "phone": "13800138000"
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名（唯一） |
| password | String | 是 | 密码（6-20位） |
| phone | String | 是 | 手机号（唯一） |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 3,
    "username": "newuser",
    "phone": "13800138000",
    "nickname": null,
    "avatar": null
  },
  "msg": "注册成功"
}
```

#### 17. 用户登录

**基本信息**
- **方法**: POST
- **路径**: `/api/users/login`
- **说明**: 用户登录获取Token
- **认证**: 不需要

**请求体**
```json
{
  "username": "testuser",
  "password": "123456"
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "phone": "13800138000",
      "nickname": "测试用户",
      "avatar": null
    }
  },
  "msg": "登录成功"
}
```

#### 18. 获取用户信息

**基本信息**
- **方法**: GET
- **路径**: `/api/users/profile`
- **说明**: 获取当前登录用户信息
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "username": "testuser",
    "phone": "13800138000",
    "nickname": "测试用户",
    "avatar": null,
    "gender": null,
    "birthday": null
  },
  "msg": "获取成功"
}
```

#### 19. 更新用户信息

**基本信息**
- **方法**: PUT
- **路径**: `/api/users/profile`
- **说明**: 更新用户个人信息
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "nickname": "新昵称",
  "gender": 1,
  "birthday": "1990-01-01"
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | String | 否 | 昵称 |
| gender | Integer | 否 | 性别（0:未知,1:男,2:女） |
| birthday | String | 否 | 生日（YYYY-MM-DD） |
| avatar | String | 否 | 头像URL |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "gender": 1,
    "birthday": "1990-01-01"
  },
  "msg": "更新成功"
}
```

---

## 管理端API

### 管理员认证

#### 20. 管理员登录

**基本信息**
- **方法**: POST
- **路径**: `/api/admin/login`
- **说明**: 管理员登录获取Token
- **认证**: 不需要

**请求体**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 管理员用户名 |
| password | String | 是 | 密码 |

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
      "id": 1,
      "username": "admin",
      "real_name": "Admin",
      "role": "super_admin",
      "status": 1
    }
  },
  "msg": "登录成功"
}
```

#### 21. 获取管理员信息

**基本信息**
- **方法**: GET
- **路径**: `/api/admin/profile`
- **说明**: 获取当前登录管理员信息
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "username": "admin",
    "real_name": "Admin",
    "role": "super_admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1
  },
  "msg": "获取成功"
}
```

---

### 商品管理

#### 22. 获取商品列表（管理端）

**基本信息**
- **方法**: GET
- **路径**: `/api/admin/products`
- **说明**: 获取所有商品列表（管理端，包含所有状态）
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| status | Integer | 否 | 状态筛选 |

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "spu_code": "SPU001",
      "title": "新疆阿克苏苹果",
      "status": 1,
      "total_stock": 500,
      "sold_num": 128
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 7
  },
  "msg": "获取成功"
}
```

#### 23. 添加商品

**基本信息**
- **方法**: POST
- **路径**: `/api/admin/products`
- **说明**: 添加新商品
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "spu_code": "SPU008",
  "title": "新商品",
  "subtitle": "商品副标题",
  "category_id": 4,
  "brand": "品牌名",
  "min_sale_price": "29.90",
  "max_line_price": "59.90",
  "total_stock": 100,
  "skus": [
    {
      "sku_code": "SKU008-1",
      "specs": "{\"规格\": \"默认\"}",
      "sale_price": "29.90",
      "line_price": "39.90",
      "stock": 100
    }
  ]
}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 8,
    "spu_code": "SPU008",
    "title": "新商品"
  },
  "msg": "添加成功"
}
```

#### 24. 更新商品

**基本信息**
- **方法**: PUT
- **路径**: `/api/admin/products/:id`
- **说明**: 更新商品信息
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "title": "更新后的商品标题"
  },
  "msg": "更新成功"
}
```

#### 25. 删除商品

**基本信息**
- **方法**: DELETE
- **路径**: `/api/admin/products/:id`
- **说明**: 删除商品（软删除）
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**响应示例**
```json
{
  "code": "Success",
  "data": null,
  "msg": "删除成功"
}
```

---

### 订单管理

#### 26. 获取订单列表（管理端）

**基本信息**
- **方法**: GET
- **路径**: `/api/admin/orders`
- **说明**: 获取所有订单列表
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| status | String | 否 | 订单状态筛选 |

**响应示例**
```json
{
  "code": "Success",
  "data": [
    {
      "id": 1,
      "order_no": "ORD20260305001",
      "user_id": 1,
      "total_amount": "59.80",
      "status": "pending",
      "created_at": "2026-03-05T15:30:00.000Z",
      "user": {
        "username": "testuser",
        "phone": "13800138000"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  },
  "msg": "获取成功"
}
```

#### 27. 订单发货

**基本信息**
- **方法**: PUT
- **路径**: `/api/admin/orders/:id/ship`
- **说明**: 订单发货
- **认证**: 需要

**请求头**
```
Authorization: Bearer {token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 订单ID |

**请求体**
```json
{
  "logistics_company": "顺丰快递",
  "logistics_no": "SF1234567890"
}
```

**响应示例**
```json
{
  "code": "Success",
  "data": {
    "id": 1,
    "status": "shipped",
    "logistics_company": "顺丰快递",
    "logistics_no": "SF1234567890"
  },
  "msg": "发货成功"
}
```

---

## 系统API

### 健康检查

#### 28. 健康检查

**基本信息**
- **方法**: GET
- **路径**: `/health`
- **说明**: 检查服务器和数据库状态
- **认证**: 不需要

**响应示例**
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T15:30:00.000Z",
  "database": "connected"
}
```

---

## 响应格式

### 成功响应

所有API在成功时返回统一格式：

```json
{
  "code": "Success",
  "data": { /* 数据内容 */ },
  "msg": "操作成功"
}
```

### 错误响应

错误时返回格式：

```json
{
  "code": "ErrorCode",
  "data": null,
  "msg": "错误信息"
}
```

### 分页响应

列表类接口返回分页信息：

```json
{
  "code": "Success",
  "data": [ /* 数据列表 */ ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  },
  "msg": "获取成功"
}
```

---

## 错误代码

### 通用错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|------------|
| Success | 成功 | 200 |
| Fail | 失败 | 400 |
| NotFound | 资源不存在 | 404 |
| Unauthorized | 未授权 | 401 |
| Forbidden | 禁止访问 | 403 |
| ServerError | 服务器错误 | 500 |

### 业务错误代码

| 代码 | 说明 |
|------|------|
| UserNotFound | 用户不存在 |
| UserExists | 用户已存在 |
| PasswordError | 密码错误 |
| TokenInvalid | Token无效 |
| TokenExpired | Token已过期 |
| ProductNotFound | 商品不存在 |
| StockInsufficient | 库存不足 |
| CartNotFound | 购物车不存在 |
| OrderNotFound | 订单不存在 |
| AddressNotFound | 地址不存在 |
| InvalidParam | 参数错误 |

---

## 认证说明

### Token获取

用户/管理员登录后，服务器返回JWT Token：

```json
{
  "code": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Token使用

需要认证的接口，在请求头中添加：

```
Authorization: Bearer {token}
```

### Token有效期

- 默认有效期：24小时
- 过期后需要重新登录获取新Token

---

## 使用示例

### 完整的购物流程示例

```javascript
// 1. 用户登录
const loginResponse = await axios.post('/api/users/login', {
  username: 'testuser',
  password: '123456'
});
const token = loginResponse.data.data.token;

// 2. 浏览商品列表
const products = await axios.get('/api/products/list?page=1&pageSize=10');

// 3. 查看商品详情
const product = await axios.get(`/api/products/detail/1`);

// 4. 加入购物车
await axios.post('/api/cart/add', {
  sku_id: 1,
  quantity: 2
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 5. 添加收货地址
await axios.post('/api/addresses', {
  consignee: '张三',
  phone: '13800138000',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  detail_address: '某某街道123号'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 6. 创建订单
const order = await axios.post('/api/orders/create', {
  address_id: 1,
  items: [
    { sku_id: 1, quantity: 2 }
  ]
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 7. 查看订单详情
const orderDetail = await axios.get(`/api/orders/detail/${order.data.data.id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

**文档版本**: v1.0.0
**更新日期**: 2026-03-05
**维护者**: 开发团队
