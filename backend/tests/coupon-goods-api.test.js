// backend/tests/coupon-goods-api.test.js
// 测试 GET /api/coupons/:id/goods 接口 (#21)
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
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/coupons/1/goods — 返回按分类过滤的商品', async () => {
  const res = await api.get('/api/coupons/1/goods');
  assert.equal(res.status, 200);
  assert.equal(res.data.code, 'Success');
  assert.equal(res.data.data.isGlobal, false, 'coupon id=1 应绑定分类，非全场通用');
  assert.ok(Array.isArray(res.data.data.categoryNames), 'categoryNames 应为数组');
  assert.ok(res.data.data.categoryNames.length > 0, 'categoryNames 不应为空');
  assert.ok(Array.isArray(res.data.data.list), 'list 应为数组');
  assert.ok(typeof res.data.data.total === 'number', 'total 应为数字');
});

test('GET /api/coupons/1/goods — 商品字段完整', async () => {
  const res = await api.get('/api/coupons/1/goods?pageSize=5');
  assert.equal(res.status, 200);
  // 验证每个商品有必要字段
  for (const item of res.data.data.list) {
    assert.ok(item.id, '商品应有 id');
    assert.ok(typeof item.title === 'string', '商品应有 title');
    assert.ok(typeof item.min_sale_price === 'number', '商品应有 min_sale_price');
  }
});

test('GET /api/coupons/999/goods — 不存在的券返回全场通用', async () => {
  const res = await api.get('/api/coupons/999/goods');
  assert.equal(res.status, 200);
  assert.equal(res.data.data.isGlobal, true, '无绑定分类时应为全场通用');
  assert.ok(Array.isArray(res.data.data.list), 'list 应为数组');
});

test('GET /api/coupons/1/goods — 分页参数正常', async () => {
  const res = await api.get('/api/coupons/1/goods?page=1&pageSize=5');
  assert.equal(res.status, 200);
  assert.ok(res.data.data.list.length <= 5, '返回数量不超过 pageSize');
  assert.equal(res.data.data.page, 1);
  assert.equal(res.data.data.pageSize, 5);
});
