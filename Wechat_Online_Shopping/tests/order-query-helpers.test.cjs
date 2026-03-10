const test = require('node:test');
const assert = require('node:assert/strict');

const { parseGoodsRequestListParam } = require('../services/_utils/order-query-helpers');

test('parseGoodsRequestListParam supports raw JSON query payload', () => {
  const payload = JSON.stringify([{ skuId: '1', quantity: 2 }]);
  assert.deepEqual(parseGoodsRequestListParam(payload), [{ skuId: '1', quantity: 2 }]);
});

test('parseGoodsRequestListParam supports encoded JSON query payload', () => {
  const payload = encodeURIComponent(JSON.stringify([{ skuId: '1', quantity: 2 }]));
  assert.deepEqual(parseGoodsRequestListParam(payload), [{ skuId: '1', quantity: 2 }]);
});

test('parseGoodsRequestListParam returns an empty list for invalid payload', () => {
  assert.deepEqual(parseGoodsRequestListParam('%not-json%'), []);
  assert.deepEqual(parseGoodsRequestListParam(''), []);
});
