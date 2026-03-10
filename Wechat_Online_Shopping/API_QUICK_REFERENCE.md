# API快速参考卡片

## 服务文件导入

```javascript
// 商品服务
import { getProductList, getProductDetail, getCategoryTree } from '../../services/product';

// 购物车服务
import { addToCart, getCartList, updateCartItem, deleteCartItem } from '../../services/cart-new';

// 订单服务
import { createOrder, getOrderList, getOrderDetail } from '../../services/order-new';

// 收货地址服务
import { addAddress, getAddressList, updateAddress, deleteAddress, setDefaultAddress } from '../../services/address-new';
```

---

## 商品服务 (Product Service)

### getProductList(params)
获取商品列表
```javascript
getProductList({
  pageIndex: 1,      // 页码
  pageSize: 20,      // 每页数量
  categoryId: '1001', // 分类ID（可选）
  keyword: '手机'     // 搜索关键词（可选）
})
```
**API**: `GET /api/products/list`

### getProductDetail(id)
获取商品详情
```javascript
getProductDetail('12345')
```
**API**: `GET /api/products/detail/:id`

### getCategoryTree()
获取分类树
```javascript
getCategoryTree()
```
**API**: `GET /api/products/categories/tree`

---

## 购物车服务 (Cart Service)

### addToCart(data)
添加商品到购物车
```javascript
addToCart({
  productId: '12345',  // 商品ID
  quantity: 2,         // 数量
  skuId: '67890'       // SKU ID
})
```
**API**: `POST /api/cart/add`

### getCartList()
获取购物车列表
```javascript
getCartList()
```
**API**: `GET /api/cart/list`

### updateCartItem(data)
更新购物车商品
```javascript
updateCartItem({
  cartId: 'cart_001',  // 购物车项ID
  quantity: 5          // 新数量
})
```
**API**: `PUT /api/cart/update`

### deleteCartItem(id)
删除购物车商品
```javascript
deleteCartItem('cart_001')
```
**API**: `DELETE /api/cart/delete/:id`

---

## 订单服务 (Order Service)

### createOrder(data)
创建订单
```javascript
createOrder({
  items: [
    {
      productId: '12345',
      quantity: 2,
      skuId: '67890'
    }
  ],
  addressId: 'addr_001',  // 收货地址ID
  remark: '请尽快发货'     // 备注（可选）
})
```
**API**: `POST /api/orders/create`

### getOrderList(params)
获取订单列表
```javascript
getOrderList({
  pageIndex: 1,
  pageSize: 20,
  status: 'pending'  // all/pending/paid/shipped/completed/cancelled
})
```
**API**: `GET /api/orders/list`

### getOrderDetail(id)
获取订单详情
```javascript
getOrderDetail('order_001')
```
**API**: `GET /api/orders/detail/:id`

---

## 收货地址服务 (Address Service)

### addAddress(data)
添加收货地址
```javascript
addAddress({
  receiverName: '张三',
  receiverPhone: '13800138000',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  detailAddress: '某某街道123号',
  isDefault: false
})
```
**API**: `POST /api/addresses`

### getAddressList()
获取地址列表
```javascript
getAddressList()
```
**API**: `GET /api/addresses`

### updateAddress(id, data)
更新地址
```javascript
updateAddress('addr_001', {
  receiverName: '李四',
  receiverPhone: '13900139000',
  province: '上海市',
  city: '上海市',
  district: '浦东新区',
  detailAddress: '某某路456号',
  isDefault: true
})
```
**API**: `PUT /api/addresses/:id`

### deleteAddress(id)
删除地址
```javascript
deleteAddress('addr_001')
```
**API**: `DELETE /api/addresses/:id`

### setDefaultAddress(id)
设置默认地址
```javascript
setDefaultAddress('addr_001')
```
**API**: `PUT /api/addresses/:id/default`

---

## 通用说明

### Token自动管理
所有API调用自动从Storage获取token，无需手动传递：
```javascript
wx.getStorageSync('token')
```

### 返回格式
成功时返回 `res.data`，失败时返回 Promise.reject

### 错误处理
所有API失败时自动显示toast提示

### 使用示例
```javascript
import { getProductList } from '../../services/product';

// 使用async/await
async loadData() {
  try {
    const data = await getProductList({ pageIndex: 1, pageSize: 20 });
    this.setData({ productList: data.list });
  } catch (err) {
    console.error('加载失败', err);
  }
}

// 使用Promise
loadData() {
  getProductList({ pageIndex: 1, pageSize: 20 })
    .then(data => {
      this.setData({ productList: data.list });
    })
    .catch(err => {
      console.error('加载失败', err);
    });
}
```

---

## 配置

### 修改API地址
编辑 `config/index.js`:
```javascript
export const config = {
  useMock: false,
  apiBaseURL: 'http://localhost:3000/api',  // 修改这里
};
```

### 切换回Mock模式
```javascript
export const config = {
  useMock: true,  // 改为true
  apiBaseURL: 'http://localhost:3000/api',
};
```
