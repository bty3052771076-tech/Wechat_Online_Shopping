const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
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
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

async function login() {
  const response = await api.post('/api/users/login', {
    username: 'testuser',
    password: '123456',
  });

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data.token;
}

async function createAddress(token) {
  const suffix = Date.now();
  const response = await api.post(
    '/api/addresses',
    {
      receiverName: `Regression User ${suffix}`,
      receiverPhone: '13800138000',
      provinceCode: '110000',
      provinceName: 'Beijing',
      cityCode: '110100',
      cityName: 'Beijing',
      districtCode: '110105',
      districtName: 'Chaoyang',
      detailAddress: `Regression Street ${suffix}`,
      isDefault: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data.id;
}

async function createOrder(token) {
  const addressId = await createAddress(token);
  const response = await api.post(
    '/api/orders/create',
    {
      items: [{ skuId: 1, quantity: 1 }],
      addressId,
      remark: 'order-actions-api',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return response.data.data.order_no;
}

test('GET /api/products/categories/tree returns a hierarchical category tree', async () => {
  const response = await api.get('/api/products/categories/tree');

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.ok(Array.isArray(response.data.data));
  assert.ok(response.data.data.length > 0, 'expected at least one root category');
  assert.ok(Object.prototype.hasOwnProperty.call(response.data.data[0], 'children'));
});

test('product comments endpoints return summary and list payloads', async () => {
  const summaryResponse = await api.get('/api/products/1/comments/summary');
  assert.equal(summaryResponse.status, 200, JSON.stringify(summaryResponse.data));
  assert.equal(summaryResponse.data.code, 'Success', JSON.stringify(summaryResponse.data));
  assert.ok(summaryResponse.data.data.commentCount >= 0);

  const listResponse = await api.get('/api/products/1/comments', {
    params: {
      page: 1,
      pageSize: 10,
    },
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.equal(listResponse.data.code, 'Success', JSON.stringify(listResponse.data));
  assert.ok(Array.isArray(listResponse.data.data.list));
  assert.ok(summaryResponse.data.data.commentCount >= listResponse.data.data.list.length);
});

test('user can pay a pending order through /api/orders/:orderNo/pay', async () => {
  const token = await login();
  const orderNo = await createOrder(token);

  const response = await api.put(
    `/api/orders/${orderNo}/pay`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.equal(response.data.data.orderNo, orderNo);
  assert.equal(response.data.data.orderStatus, 2);
  assert.equal(response.data.data.payStatus, 1);
});

test('user can cancel an unpaid order through /api/orders/:orderNo/cancel', async () => {
  const token = await login();
  const orderNo = await createOrder(token);

  const response = await api.put(
    `/api/orders/${orderNo}/cancel`,
    {
      cancelReason: 'manual regression cancel',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.equal(response.data.data.orderNo, orderNo);
  assert.equal(response.data.data.orderStatus, 6);
});
