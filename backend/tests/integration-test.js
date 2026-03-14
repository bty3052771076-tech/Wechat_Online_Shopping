const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tempDataDir = path.join(__dirname, '.tmp-integration-data');
process.env.ADMIN_DATA_DIR = tempDataDir;
fs.rmSync(tempDataDir, { recursive: true, force: true });

const { startServer } = require('../src/app');

let server;
let api;

test.before(async () => {
  server = await new Promise((resolve, reject) => {
    const instance = startServer(0);
    instance.once('listening', () => resolve(instance));
    instance.once('error', reject);
  });

  const { port } = server.address();
  api = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
    timeout: 15000,
    validateStatus: () => true,
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  fs.rmSync(tempDataDir, { recursive: true, force: true });
});

async function registerUser() {
  const stamp = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const payload = {
    username: `integration_user_${stamp}`,
    password: '123456',
    phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    email: `integration_${stamp}@example.test`,
  };

  const response = await api.post('/api/users/register', payload);

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return payload;
}

async function registerAndLoginUser() {
  const credentials = await registerUser();
  const token = await loginUser({
    username: credentials.username,
    password: credentials.password,
  });

  return {
    credentials,
    token,
  };
}

async function loginUser(credentials = { username: 'testuser', password: '123456' }) {
  const response = await api.post('/api/users/login', credentials);

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.ok(response.data.data.token, JSON.stringify(response.data));

  return response.data.data.token;
}

async function loginAdmin() {
  const response = await api.post('/api/admin/login', {
    username: 'admin',
    password: 'admin123',
  });

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.ok(response.data.data.token, JSON.stringify(response.data));

  return response.data.data.token;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function createAddress(token) {
  const stamp = Date.now();
  const response = await api.post(
    '/api/addresses',
    {
      receiverName: `Integration User ${stamp}`,
      receiverPhone: '13800138000',
      provinceCode: '110000',
      provinceName: 'Beijing',
      cityCode: '110100',
      cityName: 'Beijing',
      districtCode: '110105',
      districtName: 'Chaoyang',
      detailAddress: `Integration Street ${stamp}`,
      isDefault: 1,
    },
    {
      headers: authHeaders(token),
    },
  );

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data.id;
}

async function createOrder(token, options = {}) {
  const addressId = options.addressId || (await createAddress(token));
  const response = await api.post(
    '/api/orders/create',
    {
      items: [{ skuId: 1, quantity: 1 }],
      addressId,
      remark: options.remark || 'integration-test-order',
    },
    {
      headers: authHeaders(token),
    },
  );

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data;
}

async function payOrder(token, orderNo) {
  const response = await api.put(
    `/api/orders/${orderNo}/pay`,
    {},
    {
      headers: authHeaders(token),
    },
  );

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data;
}

async function createAfterSale(token) {
  const { id: orderId, order_no: orderNo } = await createOrder(token, {
    remark: 'integration-after-sale',
  });
  const detailResponse = await api.get(`/api/orders/detail/${orderId}`, {
    headers: authHeaders(token),
  });

  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.ok(Array.isArray(detailResponse.data.data.items));
  assert.ok(detailResponse.data.data.items.length > 0);

  const firstItem = detailResponse.data.data.items[0];
  const applyResponse = await api.post(
    '/api/orders/after-sales/apply',
    {
      orderNo,
      refundRequestAmount: Math.round(Number(firstItem.total_amount) * 100),
      rightsImageUrls: ['https://example.com/proof.png'],
      rightsReasonDesc: 'integration after-sale apply',
      rightsReasonType: 1,
      rightsType: 20,
      refundMemo: 'integration memo',
      items: [
        {
          skuId: firstItem.sku_id,
          spuId: firstItem.spu_id,
          rightsQuantity: 1,
          itemTotalAmount: Math.round(Number(firstItem.total_amount) * 100),
        },
      ],
    },
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(applyResponse.status, 201, JSON.stringify(applyResponse.data));
  assert.equal(applyResponse.data.code, 'Success', JSON.stringify(applyResponse.data));

  return {
    orderId,
    orderNo,
    rightsNo: applyResponse.data.data.rightsNo,
  };
}

test('consumer auth and catalog smoke flow satisfies requirement baseline', async () => {
  const healthResponse = await api.get('/health');
  assert.equal(healthResponse.status, 200, JSON.stringify(healthResponse.data));
  assert.equal(healthResponse.data.status, 'ok');

  const credentials = await registerUser();
  const token = await loginUser({
    username: credentials.username,
    password: credentials.password,
  });

  const profileResponse = await api.get('/api/users/profile', {
    headers: authHeaders(token),
  });

  assert.equal(profileResponse.status, 200, JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.code, 'Success', JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.data.username, credentials.username);

  const productListResponse = await api.get('/api/products/list', {
    params: {
      page: 1,
      pageSize: 10,
      keyword: '苹果',
    },
  });

  assert.equal(productListResponse.status, 200, JSON.stringify(productListResponse.data));
  assert.equal(productListResponse.data.code, 'Success', JSON.stringify(productListResponse.data));
  assert.ok(Array.isArray(productListResponse.data.data));
  assert.ok(productListResponse.data.data.length > 0, 'expected searchable products');

  const productId = productListResponse.data.data[0].id;
  const productDetailResponse = await api.get(`/api/products/detail/${productId}`);
  assert.equal(productDetailResponse.status, 200, JSON.stringify(productDetailResponse.data));
  assert.equal(productDetailResponse.data.code, 'Success', JSON.stringify(productDetailResponse.data));
  assert.ok(Array.isArray(productDetailResponse.data.data.skus));
  assert.ok(productDetailResponse.data.data.skus.length > 0);

  const categoriesResponse = await api.get('/api/products/categories/tree');
  assert.equal(categoriesResponse.status, 200, JSON.stringify(categoriesResponse.data));
  assert.equal(categoriesResponse.data.code, 'Success', JSON.stringify(categoriesResponse.data));
  assert.ok(Array.isArray(categoriesResponse.data.data));
  assert.ok(categoriesResponse.data.data.length > 0, 'expected category tree');
  assert.ok(Array.isArray(categoriesResponse.data.data[0].children));
});

test('consumer cart, address and order flow works end-to-end', async () => {
  const { token } = await registerAndLoginUser();
  const addressId = await createAddress(token);

  const addCartResponse = await api.post(
    '/api/cart/add',
    {
      skuId: 1,
      quantity: 1,
    },
    {
      headers: authHeaders(token),
    },
  );

  assert.equal(addCartResponse.status, 201, JSON.stringify(addCartResponse.data));
  assert.equal(addCartResponse.data.code, 'Success', JSON.stringify(addCartResponse.data));
  assert.ok(addCartResponse.data.data.id);

  const cartListResponse = await api.get('/api/cart/list', {
    headers: authHeaders(token),
  });
  assert.equal(cartListResponse.status, 200, JSON.stringify(cartListResponse.data));
  assert.equal(cartListResponse.data.code, 'Success', JSON.stringify(cartListResponse.data));
  assert.ok(Array.isArray(cartListResponse.data.data.items));
  assert.ok(cartListResponse.data.data.items.some((item) => Number(item.id) === Number(addCartResponse.data.data.id)));

  const updateCartResponse = await api.put(
    '/api/cart/update',
    {
      cartId: addCartResponse.data.data.id,
      quantity: 2,
      isChecked: 1,
    },
    {
      headers: authHeaders(token),
    },
  );
  assert.equal(updateCartResponse.status, 200, JSON.stringify(updateCartResponse.data));
  assert.equal(updateCartResponse.data.code, 'Success', JSON.stringify(updateCartResponse.data));
  assert.equal(updateCartResponse.data.data.quantity, 2);

  const addressListResponse = await api.get('/api/addresses', {
    headers: authHeaders(token),
  });
  assert.equal(addressListResponse.status, 200, JSON.stringify(addressListResponse.data));
  assert.ok(Array.isArray(addressListResponse.data.data));
  assert.ok(addressListResponse.data.data.some((item) => Number(item.id) === Number(addressId)));

  const order = await createOrder(token, {
    addressId,
    remark: 'integration-consumer-order',
  });
  const orderListResponse = await api.get('/api/orders/list', {
    headers: authHeaders(token),
    params: {
      page: 1,
      pageSize: 10,
    },
  });

  assert.equal(orderListResponse.status, 200, JSON.stringify(orderListResponse.data));
  assert.equal(orderListResponse.data.code, 'Success', JSON.stringify(orderListResponse.data));
  assert.ok(Array.isArray(orderListResponse.data.data.list));
  assert.ok(orderListResponse.data.data.list.some((item) => item.order_no === order.order_no));

  const orderDetailResponse = await api.get(`/api/orders/detail/${order.id}`, {
    headers: authHeaders(token),
  });
  assert.equal(orderDetailResponse.status, 200, JSON.stringify(orderDetailResponse.data));
  assert.equal(orderDetailResponse.data.data.order_no, order.order_no);
  assert.ok(Array.isArray(orderDetailResponse.data.data.items));

  const paidOrder = await payOrder(token, order.order_no);
  assert.equal(paidOrder.orderNo, order.order_no);
  assert.equal(paidOrder.payStatus, 1);
});

test('consumer after-sale flow exposes preview, reasons, apply, list and detail', async () => {
  const { token } = await registerAndLoginUser();
  const order = await createOrder(token, {
    remark: 'integration-after-sale-preview',
  });

  const orderDetailResponse = await api.get(`/api/orders/detail/${order.id}`, {
    headers: authHeaders(token),
  });
  const firstItem = orderDetailResponse.data.data.items[0];

  const previewResponse = await api.get('/api/orders/after-sales/preview', {
    headers: authHeaders(token),
    params: {
      orderNo: order.order_no,
      skuId: firstItem.sku_id,
      spuId: firstItem.spu_id,
      numOfSku: 1,
    },
  });
  assert.equal(previewResponse.status, 200, JSON.stringify(previewResponse.data));
  assert.equal(previewResponse.data.code, 'Success', JSON.stringify(previewResponse.data));

  const reasonsResponse = await api.get('/api/orders/after-sales/reasons', {
    headers: authHeaders(token),
    params: {
      rightsReasonType: 1,
    },
  });
  assert.equal(reasonsResponse.status, 200, JSON.stringify(reasonsResponse.data));
  assert.equal(reasonsResponse.data.code, 'Success', JSON.stringify(reasonsResponse.data));
  assert.ok(Array.isArray(reasonsResponse.data.data.rightsReasonList));
  assert.ok(reasonsResponse.data.data.rightsReasonList.length > 0);

  const afterSale = await createAfterSale(token);

  const afterSaleListResponse = await api.get('/api/orders/after-sales', {
    headers: authHeaders(token),
  });
  assert.equal(afterSaleListResponse.status, 200, JSON.stringify(afterSaleListResponse.data));
  assert.ok(Array.isArray(afterSaleListResponse.data.data.list));
  assert.ok(afterSaleListResponse.data.data.list.some((item) => item.rightsNo === afterSale.rightsNo));

  const afterSaleDetailResponse = await api.get(`/api/orders/after-sales/${afterSale.rightsNo}`, {
    headers: authHeaders(token),
  });
  assert.equal(afterSaleDetailResponse.status, 200, JSON.stringify(afterSaleDetailResponse.data));
  assert.equal(afterSaleDetailResponse.data.code, 'Success', JSON.stringify(afterSaleDetailResponse.data));
  assert.equal(afterSaleDetailResponse.data.data.rightsNo, afterSale.rightsNo);
});

test('admin management flow covers products, orders, users, delivery and after-sales', async () => {
  const adminToken = await loginAdmin();
  const { token: userToken } = await registerAndLoginUser();

  const profileResponse = await api.get('/api/admin/profile', {
    headers: authHeaders(adminToken),
  });
  assert.equal(profileResponse.status, 200, JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.code, 'Success', JSON.stringify(profileResponse.data));

  const productsResponse = await api.get('/api/admin/products', {
    headers: authHeaders(adminToken),
  });
  assert.equal(productsResponse.status, 200, JSON.stringify(productsResponse.data));
  assert.equal(productsResponse.data.code, 'Success', JSON.stringify(productsResponse.data));
  assert.ok(Array.isArray(productsResponse.data.data));

  const createProductResponse = await api.post(
    '/api/admin/products',
    {
      title: `Integration Product ${Date.now()}`,
      categoryId: 4,
      brand: 'Integration Brand',
      primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
      detailImages: ['https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png'],
      productDetail: 'integration detail',
      skus: [
        {
          sku_name: '默认规格',
          price: 88.8,
          line_price: 99.9,
          stock: 20,
          specs: { weight: '500g' },
        },
      ],
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(createProductResponse.status, 201, JSON.stringify(createProductResponse.data));
  assert.equal(createProductResponse.data.code, 'Success', JSON.stringify(createProductResponse.data));
  const productId = createProductResponse.data.data.id;

  const productDetailResponse = await api.get(`/api/admin/products/${productId}`, {
    headers: authHeaders(adminToken),
  });
  assert.equal(productDetailResponse.status, 200, JSON.stringify(productDetailResponse.data));
  assert.equal(productDetailResponse.data.data.id, productId);

  const updateProductResponse = await api.put(
    `/api/admin/products/${productId}`,
    {
      status: 0,
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(updateProductResponse.status, 200, JSON.stringify(updateProductResponse.data));
  assert.equal(updateProductResponse.data.code, 'Success', JSON.stringify(updateProductResponse.data));

  const usersResponse = await api.get('/api/admin/users', {
    headers: authHeaders(adminToken),
  });
  assert.equal(usersResponse.status, 200, JSON.stringify(usersResponse.data));
  assert.ok(Array.isArray(usersResponse.data.data));
  assert.ok(usersResponse.data.data.length > 0);
  const userId = usersResponse.data.data[0].id;

  const updateRemarkResponse = await api.put(
    `/api/admin/users/${userId}/remark`,
    {
      remark: 'integration remark',
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(updateRemarkResponse.status, 200, JSON.stringify(updateRemarkResponse.data));
  assert.equal(updateRemarkResponse.data.data.remark, 'integration remark');

  const userDetailResponse = await api.get(`/api/admin/users/${userId}`, {
    headers: authHeaders(adminToken),
  });
  assert.equal(userDetailResponse.status, 200, JSON.stringify(userDetailResponse.data));
  assert.equal(userDetailResponse.data.data.id, userId);
  assert.ok(Array.isArray(userDetailResponse.data.data.orderHistory));

  const createAreaResponse = await api.post(
    '/api/admin/delivery-areas',
    {
      areaName: `Integration Area ${Date.now()}`,
      description: 'integration area',
      baseFee: 800,
      freeThreshold: 19900,
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(createAreaResponse.status, 201, JSON.stringify(createAreaResponse.data));
  const areaId = createAreaResponse.data.data.id;

  const updateAreaResponse = await api.put(
    `/api/admin/delivery-areas/${areaId}`,
    {
      areaName: `Integration Area Updated ${Date.now()}`,
      description: 'integration area updated',
      baseFee: 1200,
      freeThreshold: 29900,
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(updateAreaResponse.status, 200, JSON.stringify(updateAreaResponse.data));
  assert.equal(updateAreaResponse.data.code, 'Success', JSON.stringify(updateAreaResponse.data));

  const deleteAreaResponse = await api.delete(`/api/admin/delivery-areas/${areaId}`, {
    headers: authHeaders(adminToken),
  });
  assert.equal(deleteAreaResponse.status, 200, JSON.stringify(deleteAreaResponse.data));
  assert.equal(deleteAreaResponse.data.code, 'Success', JSON.stringify(deleteAreaResponse.data));

  const order = await createOrder(userToken, {
    remark: 'integration-admin-ship',
  });
  await payOrder(userToken, order.order_no);

  const adminOrdersResponse = await api.get('/api/admin/orders', {
    headers: authHeaders(adminToken),
    params: {
      orderNo: order.order_no,
    },
  });
  assert.equal(adminOrdersResponse.status, 200, JSON.stringify(adminOrdersResponse.data));
  assert.equal(adminOrdersResponse.data.code, 'Success', JSON.stringify(adminOrdersResponse.data));
  assert.ok(Array.isArray(adminOrdersResponse.data.data));
  assert.ok(adminOrdersResponse.data.data.some((item) => item.order_no === order.order_no));

  const shipOrderResponse = await api.put(
    `/api/admin/orders/${order.order_no}/ship`,
    {
      deliveryCompany: 'SF Express',
      deliveryNo: `SF${Date.now()}`,
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(shipOrderResponse.status, 200, JSON.stringify(shipOrderResponse.data));
  assert.equal(shipOrderResponse.data.code, 'Success', JSON.stringify(shipOrderResponse.data));

  const afterSale = await createAfterSale(userToken);
  const adminAfterSalesResponse = await api.get('/api/admin/after-sales', {
    headers: authHeaders(adminToken),
  });
  assert.equal(adminAfterSalesResponse.status, 200, JSON.stringify(adminAfterSalesResponse.data));
  assert.ok(Array.isArray(adminAfterSalesResponse.data.data));
  assert.ok(adminAfterSalesResponse.data.data.some((item) => item.id === afterSale.rightsNo));

  const auditResponse = await api.put(
    `/api/admin/after-sales/${afterSale.rightsNo}/audit`,
    {
      approved: true,
    },
    {
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    },
  );
  assert.equal(auditResponse.status, 200, JSON.stringify(auditResponse.data));
  assert.equal(auditResponse.data.code, 'Success', JSON.stringify(auditResponse.data));
  assert.equal(auditResponse.data.data.status, 50);
});
