const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tempDataDir = path.join(__dirname, '.tmp-admin-data');
process.env.ADMIN_DATA_DIR = tempDataDir;
fs.rmSync(tempDataDir, { recursive: true, force: true });

const { startServer } = require('../src/app');

let server;
let api;
let adminToken;

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

  const loginResponse = await api.post('/api/admin/login', {
    username: 'admin',
    password: 'admin123',
  });

  assert.equal(loginResponse.status, 200, JSON.stringify(loginResponse.data));
  assert.equal(loginResponse.data.code, 'Success', JSON.stringify(loginResponse.data));
  adminToken = loginResponse.data.data.token;
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

function getAdminHeaders() {
  return {
    Authorization: `Bearer ${adminToken}`,
  };
}

test('GET /api/admin/orders/:orderNo returns admin order detail by order number', async () => {
  const listResponse = await api.get('/api/admin/orders', {
    headers: getAdminHeaders(),
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.equal(listResponse.data.code, 'Success', JSON.stringify(listResponse.data));
  assert.ok(Array.isArray(listResponse.data.data));
  assert.ok(listResponse.data.data.length > 0, 'expected seeded orders');

  const orderNo = listResponse.data.data[0].order_no;
  const detailResponse = await api.get(`/api/admin/orders/${orderNo}`, {
    headers: getAdminHeaders(),
  });

  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.code, 'Success', JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.data.order_no, orderNo);
  assert.ok(Array.isArray(detailResponse.data.data.items));
});

test('GET and PUT /api/admin/users supports remark updates', async () => {
  const listResponse = await api.get('/api/admin/users', {
    headers: getAdminHeaders(),
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.equal(listResponse.data.code, 'Success', JSON.stringify(listResponse.data));
  assert.ok(Array.isArray(listResponse.data.data));
  assert.ok(listResponse.data.data.length > 0, 'expected users');

  const userId = listResponse.data.data[0].id;
  const updateResponse = await api.put(
    `/api/admin/users/${userId}/remark`,
    { remark: '回归测试备注' },
    {
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(updateResponse.status, 200, JSON.stringify(updateResponse.data));
  assert.equal(updateResponse.data.code, 'Success', JSON.stringify(updateResponse.data));

  const detailResponse = await api.get(`/api/admin/users/${userId}`, {
    headers: getAdminHeaders(),
  });

  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.data.remark, '回归测试备注');
  assert.ok(Array.isArray(detailResponse.data.data.orderHistory));
});

test('delivery areas support CRUD through admin API', async () => {
  const createResponse = await api.post(
    '/api/admin/delivery-areas',
    {
      areaName: '测试配送区',
      description: '自动化测试创建',
      baseFee: 800,
      freeThreshold: 19900,
    },
    {
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(createResponse.status, 201, JSON.stringify(createResponse.data));
  assert.equal(createResponse.data.code, 'Success', JSON.stringify(createResponse.data));
  const areaId = createResponse.data.data.id;

  const listResponse = await api.get('/api/admin/delivery-areas', {
    headers: getAdminHeaders(),
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.ok(listResponse.data.data.some((item) => item.id === areaId));

  const updateResponse = await api.put(
    `/api/admin/delivery-areas/${areaId}`,
    {
      areaName: '测试配送区-更新',
      description: '自动化测试更新',
      baseFee: 1200,
      freeThreshold: 29900,
    },
    {
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(updateResponse.status, 200, JSON.stringify(updateResponse.data));
  assert.equal(updateResponse.data.data.areaName, '测试配送区-更新');

  const deleteResponse = await api.delete(`/api/admin/delivery-areas/${areaId}`, {
    headers: getAdminHeaders(),
  });

  assert.equal(deleteResponse.status, 200, JSON.stringify(deleteResponse.data));
  assert.equal(deleteResponse.data.code, 'Success', JSON.stringify(deleteResponse.data));
});

test('after-sales support list, detail and audit flows through admin API', async () => {
  const listResponse = await api.get('/api/admin/after-sales', {
    headers: getAdminHeaders(),
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.equal(listResponse.data.code, 'Success', JSON.stringify(listResponse.data));
  assert.ok(Array.isArray(listResponse.data.data));
  assert.ok(listResponse.data.data.length > 0, 'expected seeded after-sales');

  const afterSaleId = listResponse.data.data[0].id;
  const detailResponse = await api.get(`/api/admin/after-sales/${afterSaleId}`, {
    headers: getAdminHeaders(),
  });

  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.code, 'Success', JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.data.id, afterSaleId);

  const auditResponse = await api.put(
    `/api/admin/after-sales/${afterSaleId}/audit`,
    { approved: true },
    {
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(auditResponse.status, 200, JSON.stringify(auditResponse.data));
  assert.equal(auditResponse.data.code, 'Success', JSON.stringify(auditResponse.data));
  assert.equal(auditResponse.data.data.status, 50);
});
