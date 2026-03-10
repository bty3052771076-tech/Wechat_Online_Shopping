const test = require('node:test');
const assert = require('node:assert/strict');

const { validateAddressForm, collectChildMethodCalls } = require('../services/_utils/form-helpers');

test('validateAddressForm allows names with spaces when other fields are valid', () => {
  const result = validateAddressForm({
    name: 'Test User 1773048954276',
    phone: '13800138000',
    districtName: '南山区',
    detailAddress: '科技园 8 号',
  });

  assert.deepEqual(result, {
    isLegal: true,
    tips: '添加成功',
  });
});

test('validateAddressForm rejects empty receiver name', () => {
  const result = validateAddressForm({
    name: '  ',
    phone: '13800138000',
    districtName: '南山区',
    detailAddress: '科技园 8 号',
  });

  assert.equal(result.isLegal, false);
  assert.equal(result.tips, '请填写收货人');
});

test('collectChildMethodCalls ignores missing children when applying sidebar state changes', async () => {
  const calls = [];
  const children = [
    {
      setTopRightRadius(value) {
        calls.push(['first', value]);
        return Promise.resolve();
      },
    },
  ];

  await Promise.all(collectChildMethodCalls(children, [0, 2], 'setTopRightRadius', false));

  assert.deepEqual(calls, [['first', false]]);
});
