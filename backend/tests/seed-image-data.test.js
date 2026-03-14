const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

test('seed SQL does not contain example.com image placeholders', async () => {
  const sql = await fs.readFile(path.resolve(__dirname, '../../database/sql/02-init-data.sql'), 'utf8');
  assert.equal(sql.includes('https://example.com/'), false);
  assert.equal(sql.includes('sp-1a.png'), false);
  assert.equal(sql.includes('/assets/images/products/apple.png'), true);
  assert.equal(sql.includes('/assets/images/categories/fruit.png'), true);
  assert.equal(sql.includes('/assets/images/banners/spring-sale.png'), true);
});

test('after-sale seed data does not contain example.com image placeholders', async () => {
  const json = await fs.readFile(path.resolve(__dirname, '../data/after-sales.json'), 'utf8');
  assert.equal(json.includes('https://example.com/'), false);
  assert.equal(json.includes('/assets/images/products/apple.png'), true);
});
