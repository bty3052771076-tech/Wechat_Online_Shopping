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

test('GET /api/products/list supports top-level category filtering via descendant categories', async () => {
  const response = await api.get('/api/products/list', {
    params: {
      categoryId: 1,
      page: 1,
      pageSize: 20,
    },
  });

  assert.equal(response.status, 200, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));
  assert.ok(Array.isArray(response.data.data));
  assert.ok(response.data.data.length > 0, 'expected products under top-level category 1');
  assert.ok(
    response.data.data.every((item) => [4, 5, 6].includes(Number(item.category_id))),
    JSON.stringify(response.data.data),
  );
});
