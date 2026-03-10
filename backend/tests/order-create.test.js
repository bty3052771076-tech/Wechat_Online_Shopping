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

  assert.equal(response.status, 200, 'login should return HTTP 200');
  assert.equal(response.data.code, 'Success', 'login should succeed');
  assert.ok(response.data.data.token, 'login should return token');

  return response.data.data.token;
}

async function createAddress(token) {
  const suffix = Date.now();
  const response = await api.post(
    '/api/addresses',
    {
      receiverName: `Test User ${suffix}`,
      receiverPhone: '13800138000',
      provinceCode: '110000',
      provinceName: 'Beijing',
      cityCode: '110100',
      cityName: 'Beijing',
      districtCode: '110105',
      districtName: 'Chaoyang',
      detailAddress: `Test Street ${suffix}`,
      isDefault: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  assert.equal(response.status, 201, 'create address should return HTTP 201');
  assert.equal(response.data.code, 'Success', 'create address should succeed');
  assert.ok(response.data.data.id, 'create address should return address id');

  return response.data.data.id;
}

test('POST /api/orders/create creates an order for a valid sku and address', async () => {
  const token = await login();
  const addressId = await createAddress(token);

  const response = await api.post(
    '/api/orders/create',
    {
      items: [{ skuId: 1, quantity: 1 }],
      addressId,
      remark: 'order-create-test',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.ok(response.data.data.id, 'create order should return order id');
  assert.ok(response.data.data.order_no, 'create order should return order no');
});
