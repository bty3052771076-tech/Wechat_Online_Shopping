# Example 项目架构分析与定制指南

> **项目**: Wechat_Online_Shopping
> **基础项目**: TDesign 零售模板示例
> **文档版本**: v1.0
> **更新时间**: 2026-03-04

---

## 📋 目录

1. [Example 项目架构分析](#1-example-项目架构分析)
2. [项目结构详解](#2-项目结构详解)
3. [数据流程分析](#3-数据流程分析)
4. [如何修改商品数据](#4-如何修改商品数据)
5. [如何适配个人账号](#5-如何适配个人账号)
6. [项目配置指南](#6-项目配置指南)
7. [常见定制场景](#7-常见定制场景)

---

## 1. Example 项目架构分析

### 1.1 项目概述

**Example 项目是基于 TDesign 组件库的完整电商小程序模板**，包含：
- 28个完整页面
- 完整的购物流程
- Mock 数据系统
- 响应式设计

### 1.2 技术架构

```
┌─────────────────────────────────────┐
│        小程序前端 (View)            │
│  ┌───────────────────────────────┐  │
│  │   Pages (页面)                │  │
│  │   Components (组件)           │  │
│  └───────────────────────────────┘  │
│             ↓                        │
│  ┌───────────────────────────────┐  │
│  │   Services (服务层)           │  │
│  └───────────────────────────────┘  │
│             ↓                        │
│  ┌───────────────────────────────┐  │
│  │   Model (数据层/Mock)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**数据流：**
```
Page (页面) → Services (服务) → Model (数据)
     ↑              ↓
    渲染         Mock数据
```

### 1.3 核心文件说明

| 文件类型 | 位置 | 说明 |
|---------|------|------|
| **页面文件** | `pages/*/` | 每个页面的逻辑和视图 |
| **组件文件** | `components/*/` | 可复用的UI组件 |
| **服务文件** | `services/*/` | 数据获取和业务逻辑 |
| **数据文件** | `model/*.js` | Mock 数据定义 |
| **工具文件** | `utils/*.js` | 通用工具函数 |
| **配置文件** | `config/*.js` | 项目配置 |

---

## 2. 项目结构详解

### 2.1 目录结构树

```
example/
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── sitemap.json            # 爬虫配置
├── project.config.json     # 项目配置
│
├── pages/                  # 页面目录
│   ├── home/               # 首页
│   ├── category/           # 分类页
│   ├── cart/               # 购物车
│   ├── usercenter/         # 个人中心
│   ├── goods/              # 商品相关（分包）
│   ├── order/              # 订单相关（分包）
│   ├── user/               # 用户相关（分包）
│   ├── coupon/             # 优惠券（分包）
│   └── promotion/          # 营销活动（分包）
│
├── components/             # 组件目录
│   ├── goods-card/         # 商品卡片
│   ├── goods-list/         # 商品列表
│   ├── filter/             # 筛选组件
│   ├── price/              # 价格组件
│   └── ...                 # 其他组件
│
├── services/               # 服务层
│   ├── home/               # 首页服务
│   ├── good/               # 商品服务
│   ├── cart/               # 购物车服务
│   ├── order/              # 订单服务
│   └── ...                 # 其他服务
│
├── model/                  # Mock数据
│   ├── goods.js            # 商品数据
│   ├── cart.js             # 购物车数据
│   ├── category.js         # 分类数据
│   └── ...                 # 其他数据
│
├── utils/                  # 工具函数
│   ├── mock.js             # Mock工具
│   ├── util.js             # 通用工具
│   └── ...                 # 其他工具
│
├── config/                 # 配置文件
│   ├── index.js            # 基础配置
│   └── ...                 # 其他配置
│
├── style/                  # 公共样式
│   ├── index.wxss          # 主样式文件
│   └── ...                 # 其他样式
│
└── custom-tab-bar/         # 自定义TabBar
    ├── index.js
    ├── index.wxml
    └── index.wxss
```

### 2.2 页面文件结构

**每个页面包含4个文件：**

```
pages/home/
├── home.js      # 页面逻辑
├── home.json    # 页面配置
├── home.wxml    # 页面结构
└── home.wxss    # 页面样式
```

**说明：**
- `.js` - 定义数据、生命周期、事件处理
- `.json` - 定义页面标题、引入组件等
- `.wxml` - 类似HTML，定义页面结构
- `.wxss` - 类似CSS，定义页面样式

---

## 3. 数据流程分析

### 3.1 Mock 数据系统

**Example 项目使用 Mock 数据，不依赖真实后端。**

#### 数据层级

```
Model (Mock数据)
    ↓
Services (数据服务)
    ↓
Pages (页面显示)
```

#### 工作流程

**以首页为例：**

1. **Mock 数据定义** (`model/goods.js`)
```javascript
export const goodsList = [
  {
    id: '1',
    title: '商品名称',
    price: 29900,
    // ...
  }
];
```

2. **服务层封装** (`services/good/fetchGoods.js`)
```javascript
import { goodsList } from '../../model/goods';

export function fetchGoodsList() {
  return Promise.resolve(goodsList);
}
```

3. **页面调用** (`pages/home/home.js`)
```javascript
import { fetchGoodsList } from '../../services/good/fetchGoods';

Page({
  onLoad() {
    fetchGoodsList().then(list => {
      this.setData({ goodsList: list });
    });
  }
});
```

4. **页面渲染** (`pages/home/home.wxml`)
```html
<goods-list goods="{{goodsList}}" />
```

### 3.2 配置控制

**使用配置文件控制是否使用 Mock 数据：**

```javascript
// config/index.js
export const config = {
  useMock: true,  // true: 使用Mock, false: 使用真实API
  cdnBase: 'https://tdesign.gtimg.com/miniprogram/template/retail'
};
```

**服务层判断：**

```javascript
// services/home/home.js
export function fetchHome() {
  if (config.useMock) {
    return mockFetchHome();  // 返回Mock数据
  }
  return realFetchHome();     // 返回真实API数据
}
```

---

## 4. 如何修改商品数据

### 4.1 商品数据位置

**主要文件：**
```
example/model/good.js         # 商品数据定义（核心）
example/model/goods.js        # 商品列表生成
```

### 4.2 商品数据结构

**完整的商品数据结构：**

```javascript
{
  // 基本信息
  spuId: '0',                    // 商品SPU ID
  title: '商品名称',              // 商品标题
  primaryImage: '图片URL',        // 主图
  images: ['图片1', '图片2'],     // 图片列表

  // 价格信息
  minSalePrice: 29800,           // 最低售价（分为单位）
  minLinePrice: 29800,           // 最低标价
  maxSalePrice: 29800,           // 最高售价
  maxLinePrice: 40000,           // 最高标价

  // 库存信息
  spuStockQuantity: 510,         // 库存数量
  soldNum: 1020,                 // 已售数量
  isPutOnSale: 1,                // 是否上架

  // 分类信息
  categoryIds: ['分类ID1', '分类ID2'],

  // 规格信息
  specList: [                   // 规格列表
    {
      specId: '10011',
      title: '颜色',
      specValueList: [
        { specValueId: '10012', specValue: '米色' },
        { specValueId: '10013', specValue: '黑色' }
      ]
    }
  ],

  // SKU列表（具体规格商品）
  skuList: [
    {
      skuId: '135676631',        // SKU ID
      specInfo: [...],           // 规格信息
      priceInfo: [               // 价格信息
        { priceType: 1, price: '29800' },  // 原价
        { priceType: 2, price: '40000' }   // 卖价
      ],
      stockInfo: {
        stockQuantity: 175,      // 库存
        soldQuantity: 0           // 已售
      }
    }
  ]
}
```

### 4.3 修改商品数据

#### 方法1：修改现有商品（简单）

**找到文件：** `example/model/good.js`

**修改步骤：**

1. **找到要修改的商品**
```javascript
// 在 allGoods 数组中找到商品
{
  title: '白色短袖连衣裙荷叶边裙摆宽松韩版休闲纯白清爽优雅连衣裙',
  minSalePrice: 29800,
  // ...
}
```

2. **修改商品信息**
```javascript
{
  title: '你的商品名称',              // 修改名称
  minSalePrice: 9900,                 // 修改价格（99元）
  primaryImage: '/assets/your-image.jpg',  // 修改图片
  // ...
}
```

3. **保存文件** → 自动刷新

#### 方法2：添加新商品

**在 `allGoods` 数组中添加：**

```javascript
const allGoods = [
  // 原有商品...

  // 新增商品
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: 'NEW_001',
    title: '你的新商品名称',
    primaryImage: 'https://your-domain.com/image.jpg',
    images: ['图片URL1', '图片URL2'],
    minSalePrice: 19900,        // 199元
    maxSalePrice: 19900,
    spuStockQuantity: 100,      // 库存100
    soldNum: 0,
    isPutOnSale: 1,
    categoryIds: ['你的分类ID'],
    specList: [...],
    skuList: [...]
  }
];
```

#### 方法3：批量替换所有商品

**如果想完全替换商品列表：**

1. **找到文件：** `example/model/good.js`
2. **注释或删除 `allGoods` 数组**
3. **定义你的商品数组**
4. **修改 `genGood` 函数使用你的数据**

```javascript
// 原来的代码
const allGoods = [...];

// 修改成
const allGoods = [
  // 你的商品1
  { title: '商品1', price: 10000 },
  // 你的商品2
  { title: '商品2', price: 20000 },
  // ... 更多商品
];

// 修改 genGood 函数
export function genGood(idx) {
  return allGoods[idx % allGoods.length];
}
```

### 4.4 图片处理

**图片来源选项：**

| 选项 | 说明 | 适用场景 |
|------|------|---------|
| **在线图片** | 使用图片URL | 测试、展示 |
| **本地图片** | 放在 `assets/` 目录 | 正式项目 |
| **云存储** | 腾讯云COS/阿里云OSS | 正式项目 |

**使用本地图片：**

1. **在 `example/` 创建 `assets/` 目录**
2. **放入图片文件：**
```
example/assets/goods/
  ├── product1.jpg
  ├── product2.jpg
  └── ...
```

3. **修改商品数据：**
```javascript
{
  primaryImage: '/assets/goods/product1.jpg',
  images: [
    '/assets/goods/product1.jpg',
    '/assets/goods/product2.jpg'
  ]
}
```

---

## 5. 如何适配个人账号

### 5.1 个人账号的限制

| 功能 | 个人账号 | 示例项目 |
|------|---------|---------|
| 商品展示 | ✅ | ✅ |
| 购物车 | ✅ | ✅ |
| 订单创建 | ✅ | ✅ |
| **微信支付** | ❌ | ❌（示例是Mock） |

**好消息：** Example 项目使用的是 Mock 支付，和个人账号的需求完全匹配！

### 5.2 查看支付相关代码

**支付页面：** `pages/order/pay/index.js`

**示例项目已经实现了 Mock 支付：**

```javascript
// 示例项目的支付流程
handleBuy() {
  // 1. 创建订单
  createOrder().then(orderId => {
    // 2. 发起支付（Mock）
    requestPayment({
      orderId
    });
  });
}

// Mock支付函数
function requestPayment({ orderId }) {
  return new Promise((resolve) => {
    // 模拟支付成功
    resolve({ code: 'SUCCESS' });
  });
}
```

**对于个人账号：**
- ✅ 示例项目的 Mock 支付已经够用
- ✅ 订单可以创建
- ✅ 订单状态可以管理
- ❌ 只是不能调用真实微信支付API

### 5.3 无需修改的部分

**示例项目以下部分不需要修改：**

| 功能 | 状态 | 说明 |
|------|------|------|
| 商品浏览 | ✅ 可直接用 | 完整功能 |
| 购物车 | ✅ 可直接用 | 本地存储 |
| 订单创建 | ✅ 可直接用 | Mock 数据 |
| 订单列表 | ✅ 可直接用 | Mock 数据 |
| 地址管理 | ✅ 可直接用 | 使用微信API |

**只需修改：**
- ❌ 商品数据（改成你的）
- ❌ 项目标题和配置
- ❌ 图片和样式（可选）

---

## 6. 项目配置指南

### 6.1 修改项目基本信息

#### 修改项目名称

**文件：** `example/project.config.json`

```json
{
  "projectname": "你的项目名称"
}
```

#### 修改小程序标题

**文件：** `example/app.json`

```json
{
  "window": {
    "navigationBarTitleText": "你的小程序名称"
  }
}
```

#### 修改 AppID

**文件：** `example/project.config.json`

```json
{
  "appid": "wxYourAppIdHere"
}
```

### 6.2 修改首页配置

**文件：** `example/services/home/home.js`

**修改首页标签：**

```javascript
export function mockFetchHome() {
  return {
    tabList: [
      { text: '精选推荐', key: 0 },
      { text: '你的分类1', key: 1 },
      { text: '你的分类2', key: 2 },
      { text: '你的分类3', key: 3 },
      { text: '你的分类4', key: 4 },
      { text: '你的分类5', key: 5 }
    ]
  };
}
```

### 6.3 修改分类数据

**文件：** `example/model/category.js`

**修改分类：**

```javascript
export const categoryList = [
  {
    id: '1',
    title: '你的分类1',
    imgUrl: '/assets/category1.png'
  },
  {
    id: '2',
    title: '你的分类2',
    imgUrl: '/assets/category2.png'
  }
  // ... 更多分类
];
```

---

## 7. 常见定制场景

### 7.1 修改主题颜色

**文件：** `example/app.json`

```json
{
  "tabBar": {
    "color": "#666666",        // 未选中文字颜色
    "selectedColor": "#FF5F15", // 选中文字颜色（你的主题色）
    "backgroundColor": "#ffffff"
  }
}
```

**文件：** `example/style/index.wxss`

```css
/* 修改主题色变量 */
:root {
  --td-brand-color: #FF5F15;  /* 你的主题色 */
}
```

### 7.2 修改轮播图

**文件：** `example/model/swiper.js`

```javascript
export function genSwiperImageList() {
  return [
    {
      id: '1',
      url: '/assets/banner1.jpg',  // 你的轮播图1
      link: 'pages/goods/details?id=1'
    },
    {
      id: '2',
      url: '/assets/banner2.jpg',  // 你的轮播图2
      link: 'pages/goods/details?id=2'
    }
    // ... 更多轮播图
  ];
}
```

### 7.3 修改用户信息

**文件：** `example/model/usercenter.js`

```javascript
export function fetchUsercenterInfo() {
  return {
    avatar: '/assets/avatar.jpg',        // 你的头像
    nickname: '你的昵称',               // 你的昵称
    isLogin: true,
    topBarList: [...],
    orderCard: {
      orderNum: '10',                  // 你的订单数
      collectNum: '5',                 // 你的收藏数
      viewNum: '100',                   // 你的浏览数
      couponNum: '3'                    // 你的优惠券数
    }
  };
}
```

### 7.4 添加自定义页面

**步骤：**

1. **创建页面文件夹**
```
example/pages/mypage/
  ├── mypage.js
  ├── mypage.json
  ├── mypage.wxml
  └── mypage.wxss
```

2. **在 `app.json` 中注册**
```json
{
  "pages": [
    "pages/home/home",
    "pages/category/index",
    // ...
    "pages/mypage/mypage"  // 新增页面
  ]
}
```

3. **在导航中添加入口**
```javascript
// 在某个页面的 .wxml 中添加跳转
<navigator url="/pages/mypage/mypage">我的页面</navigator>
```

---

## 8. 完整定制步骤

### 步骤1：准备工作

```
1. 复制 example 项目到新目录
   cp -r example Wechat_Online_Shopping

2. 在微信开发者工具中导入新项目
```

### 步骤2：修改基础信息（5分钟）

```
1. 修改 project.config.json
   - projectname: "你的项目名"
   - appid: "你的AppID"

2. 修改 app.json
   - navigationBarTitleText: "你的小程序名"

3. 重新编译查看效果
```

### 步骤3：替换商品数据（15分钟）

```
1. 准备商品图片
2. 修改 model/good.js
   - 替换商品名称、价格、图片
   - 或添加新商品

3. 重新编译查看效果
```

### 步骤4：调整样式（可选，15分钟）

```
1. 修改主题色
2. 修改轮播图
3. 修改分类

4. 重新编译查看效果
```

### 步骤5：测试和调试（30分钟）

```
1. 在模拟器中测试所有功能
2. 预览到手机测试
3. 修复发现的问题
```

### 步骤6：准备发布（参考文档09）

```
1. 检查所有功能
2. 修改配置文件
3. 上传代码
4. 提交审核
```

---

## 9. 快速参考

### 9.1 关键文件位置

| 功能 | 文件路径 |
|------|---------|
| **商品数据** | `model/good.js` |
| **分类数据** | `model/category.js` |
| **购物车数据** | `model/cart.js` |
| **用户数据** | `model/usercenter.js` |
| **轮播图** | `model/swiper.js` |
| **首页服务** | `services/home/home.js` |
| **商品服务** | `services/good/fetchGoods.js` |
| **购物车服务** | `services/cart/cart.js` |
| **订单服务** | `services/order/submitOrder.js` |
| **项目配置** | `config/index.js` |
| **全局配置** | `app.json` |

### 9.2 数据修改速查

**修改商品：** `model/good.js` → `allGoods` 数组
**修改分类：** `model/category.js` → `categoryList` 数组
**修改轮播图：** `model/swiper.js` → `genSwiperImageList` 函数
**修改用户信息：** `model/usercenter.js` → `fetchUsercenterInfo` 函数

### 9.3 常用操作

**修改商品名称：**
```javascript
// model/good.js
{ title: '新名称', }
```

**修改商品价格：**
```javascript
// model/good.js
{ minSalePrice: 19900, }  // 199元
```

**修改商品图片：**
```javascript
// model/good.js
{ primaryImage: '/assets/image.jpg', }
```

**修改主题色：**
```javascript
// app.json
{ "selectedColor": "#你的颜色" }
```

---

## 10. 下一步

### 现在你可以：

1. ✅ **复制项目到你的目录**
2. ✅ **按照本文档修改商品数据**
3. ✅ **调整配置和样式**
4. ✅ **测试和调试**
5. ✅ **准备发布上线**

### 如果需要帮助：

- **修改商品数据** → 参考第4节
- **适配个人账号** → 参考第5节（无需修改代码）
- **配置项目** → 参考第6节
- **常见问题** → 参考第7节

### 其他文档：

- `06-开发环境准备指南.md` - 环境搭建
- `08-微信开发者工具使用指南.md` - 工具使用
- `09-小程序发布流程指南.md` - 发布上线
- `10-从零到运行手把手指南.md` - 入门教程

---

**祝你定制顺利！** 🎉

如有问题，随时问我！
