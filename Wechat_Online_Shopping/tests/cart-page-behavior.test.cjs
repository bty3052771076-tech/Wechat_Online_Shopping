const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('cart page refreshes cart data when the tab becomes visible again', () => {
  const pageCode = fs.readFileSync('pages/cart/index.js', 'utf8');
  const onShowMatch = pageCode.match(/onShow\s*\(\)\s*\{([\s\S]*?)\n\s*\},/);

  assert.ok(onShowMatch, 'expected cart page to define an onShow lifecycle method');
  assert.match(onShowMatch[1], /this\.getTabBar\(\)\.init\(\);/);
  assert.match(onShowMatch[1], /this\.refreshData\(\);/);
});
