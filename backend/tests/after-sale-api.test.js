const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tempDataDir = path.join(__dirname, '.tmp-after-sale-data');
process.env.ADMIN_DATA_DIR = tempDataDir;
fs.rmSync(tempDataDir, { recursive: true, force: true });

const { startServer } = require('../src/app');

let server;
let api;
let userToken;
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

  const userLoginResponse = await api.post('/api/users/login', {
    username: 'testuser',
    password: '123456',
  });

  assert.equal(userLoginResponse.status, 200, JSON.stringify(userLoginResponse.data));
  assert.equal(userLoginResponse.data.code, 'Success', JSON.stringify(userLoginResponse.data));
  userToken = userLoginResponse.data.data.token;

  const adminLoginResponse = await api.post('/api/admin/login', {
    username: 'admin',
    password: 'admin123',
  });

  assert.equal(adminLoginResponse.status, 200, JSON.stringify(adminLoginResponse.data));
  assert.equal(adminLoginResponse.data.code, 'Success', JSON.stringify(adminLoginResponse.data));
  adminToken = adminLoginResponse.data.data.token;
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

function getUserHeaders() {
  return {
    Authorization: `Bearer ${userToken}`,
  };
}

function getAdminHeaders() {
  return {
    Authorization: `Bearer ${adminToken}`,
  };
}

test('user after-sales preview and reasons endpoints return real data', async () => {
  const orderListResponse = await api.get('/api/orders/list', {
    headers: getUserHeaders(),
  });

  assert.equal(orderListResponse.status, 200, JSON.stringify(orderListResponse.data));
  assert.equal(orderListResponse.data.code, 'Success', JSON.stringify(orderListResponse.data));
  assert.ok(Array.isArray(orderListResponse.data.data.list));
  assert.ok(orderListResponse.data.data.list.length > 0, 'expected seeded user orders');

  const orderId = orderListResponse.data.data.list[0].id;
  const orderDetailResponse = await api.get(`/api/orders/detail/${orderId}`, {
    headers: getUserHeaders(),
  });

  assert.equal(orderDetailResponse.status, 200, JSON.stringify(orderDetailResponse.data));
  assert.ok(Array.isArray(orderDetailResponse.data.data.items));
  assert.ok(orderDetailResponse.data.data.items.length > 0, 'expected seeded order items');

  const firstItem = orderDetailResponse.data.data.items[0];
  const orderNo = orderDetailResponse.data.data.order_no;
  const previewResponse = await api.get('/api/orders/after-sales/preview', {
    headers: getUserHeaders(),
    params: {
      orderNo,
      skuId: firstItem.sku_id,
      spuId: firstItem.spu_id,
      numOfSku: 1,
    },
  });

  assert.equal(previewResponse.status, 200, JSON.stringify(previewResponse.data));
  assert.equal(previewResponse.data.code, 'Success', JSON.stringify(previewResponse.data));
  assert.equal(previewResponse.data.data.orderNo, orderNo);
  assert.equal(previewResponse.data.data.skuId, firstItem.sku_id);

  const reasonResponse = await api.get('/api/orders/after-sales/reasons', {
    headers: getUserHeaders(),
    params: {
      rightsReasonType: 1,
    },
  });

  assert.equal(reasonResponse.status, 200, JSON.stringify(reasonResponse.data));
  assert.equal(reasonResponse.data.code, 'Success', JSON.stringify(reasonResponse.data));
  assert.ok(Array.isArray(reasonResponse.data.data.rightsReasonList));
  assert.ok(reasonResponse.data.data.rightsReasonList.length > 0);
});

test('user apply flow creates after-sale visible to both user and admin', async () => {
  const orderListResponse = await api.get('/api/orders/list', {
    headers: getUserHeaders(),
  });
  const orderId = orderListResponse.data.data.list[0].id;
  const orderDetailResponse = await api.get(`/api/orders/detail/${orderId}`, {
    headers: getUserHeaders(),
  });
  const firstItem = orderDetailResponse.data.data.items[0];
  const orderNo = orderDetailResponse.data.data.order_no;

  const applyResponse = await api.post(
    '/api/orders/after-sales/apply',
    {
      orderNo,
      refundRequestAmount: Math.round(Number(firstItem.price) * 100),
      rightsImageUrls: ['https://example.com/proof.png'],
      rightsReasonDesc: '自动化回归申请',
      rightsReasonType: 1,
      rightsType: 20,
      refundMemo: '尽快处理',
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
        ...getUserHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(applyResponse.status, 201, JSON.stringify(applyResponse.data));
  assert.equal(applyResponse.data.code, 'Success', JSON.stringify(applyResponse.data));
  assert.ok(applyResponse.data.data.rightsNo);

  const rightsNo = applyResponse.data.data.rightsNo;
  const userListResponse = await api.get('/api/orders/after-sales', {
    headers: getUserHeaders(),
  });

  assert.equal(userListResponse.status, 200, JSON.stringify(userListResponse.data));
  assert.ok(userListResponse.data.data.list.some((item) => item.rightsNo === rightsNo));

  const adminListResponse = await api.get('/api/admin/after-sales', {
    headers: getAdminHeaders(),
  });

  assert.equal(adminListResponse.status, 200, JSON.stringify(adminListResponse.data));
  assert.ok(adminListResponse.data.data.some((item) => item.id === rightsNo));
});

test('user after-sales detail supports logistics updates and cancel', async () => {
  const listResponse = await api.get('/api/orders/after-sales', {
    headers: getUserHeaders(),
  });

  assert.equal(listResponse.status, 200, JSON.stringify(listResponse.data));
  assert.ok(Array.isArray(listResponse.data.data.list));
  assert.ok(listResponse.data.data.list.length > 0, 'expected after-sales records');

  const rightsNo = listResponse.data.data.list[0].rightsNo;
  const logisticsResponse = await api.put(
    `/api/orders/after-sales/${rightsNo}/logistics`,
    {
      logisticsCompanyCode: 'SF',
      logisticsCompanyName: '顺丰速运',
      logisticsNo: 'SF123456789CN',
      remark: '下午上门',
    },
    {
      headers: {
        ...getUserHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  assert.equal(logisticsResponse.status, 200, JSON.stringify(logisticsResponse.data));
  assert.equal(logisticsResponse.data.code, 'Success', JSON.stringify(logisticsResponse.data));
  assert.equal(logisticsResponse.data.data.logisticsVO.logisticsNo, 'SF123456789CN');

  const detailResponse = await api.get(`/api/orders/after-sales/${rightsNo}`, {
    headers: getUserHeaders(),
  });

  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.code, 'Success', JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.data.rightsNo, rightsNo);
  assert.equal(detailResponse.data.data.logisticsVO.logisticsCompanyCode, 'SF');

  const cancelResponse = await api.put(
    `/api/orders/after-sales/${rightsNo}/cancel`,
    {},
    {
      headers: getUserHeaders(),
    },
  );

  assert.equal(cancelResponse.status, 200, JSON.stringify(cancelResponse.data));
  assert.equal(cancelResponse.data.code, 'Success', JSON.stringify(cancelResponse.data));
  assert.equal(cancelResponse.data.data.rightsStatus, 60);
});
