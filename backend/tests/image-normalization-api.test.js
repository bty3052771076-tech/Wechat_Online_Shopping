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

function collectTreeImages(nodes = []) {
  return nodes.flatMap((node) => {
    const current = [];
    if (node && node.icon_url) {
      current.push(String(node.icon_url));
    }
    if (node && node.thumbnail) {
      current.push(String(node.thumbnail));
    }
    return current.concat(collectTreeImages(Array.isArray(node.children) ? node.children : []));
  });
}

test('product and category endpoints replace placeholder example.com images', async () => {
  const productListResponse = await api.get('/api/products/list', {
    params: {
      keyword: '苹果',
      page: 1,
      pageSize: 10,
    },
  });

  assert.equal(productListResponse.status, 200, JSON.stringify(productListResponse.data));
  assert.equal(productListResponse.data.code, 'Success', JSON.stringify(productListResponse.data));
  assert.ok(Array.isArray(productListResponse.data.data));
  assert.ok(productListResponse.data.data.length > 0, 'expected at least one product');
  assert.ok(
    productListResponse.data.data.every((item) => !String(item.primary_image || '').includes('example.com')),
    JSON.stringify(productListResponse.data.data),
  );

  const detailResponse = await api.get('/api/products/detail/1');
  assert.equal(detailResponse.status, 200, JSON.stringify(detailResponse.data));
  assert.equal(detailResponse.data.code, 'Success', JSON.stringify(detailResponse.data));
  assert.ok(!String(detailResponse.data.data.primary_image || '').includes('example.com'));
  assert.ok(
    (detailResponse.data.data.detail_images || []).every((item) => !String(item).includes('example.com')),
    JSON.stringify(detailResponse.data.data.detail_images),
  );

  const categoriesResponse = await api.get('/api/products/categories/tree');
  assert.equal(categoriesResponse.status, 200, JSON.stringify(categoriesResponse.data));
  assert.equal(categoriesResponse.data.code, 'Success', JSON.stringify(categoriesResponse.data));
  assert.ok(
    collectTreeImages(categoriesResponse.data.data).every((item) => !item.includes('example.com')),
    JSON.stringify(categoriesResponse.data.data),
  );
});

test('order and comment endpoints replace placeholder example.com images', async () => {
  const token = await login();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const orderListResponse = await api.get('/api/orders/list', {
    headers,
    params: {
      page: 1,
      pageSize: 10,
    },
  });

  assert.equal(orderListResponse.status, 200, JSON.stringify(orderListResponse.data));
  assert.equal(orderListResponse.data.code, 'Success', JSON.stringify(orderListResponse.data));
  assert.ok(Array.isArray(orderListResponse.data.data.list));
  assert.ok(
    orderListResponse.data.data.list.every((order) =>
      !String(order.previewItem && order.previewItem.product_image ? order.previewItem.product_image : '').includes(
        'example.com',
      ),
    ),
    JSON.stringify(orderListResponse.data.data.list),
  );

  const commentsResponse = await api.get('/api/products/1/comments', {
    params: {
      page: 1,
      pageSize: 3,
    },
  });

  assert.equal(commentsResponse.status, 200, JSON.stringify(commentsResponse.data));
  assert.equal(commentsResponse.data.code, 'Success', JSON.stringify(commentsResponse.data));
  assert.ok(Array.isArray(commentsResponse.data.data.list));
  assert.ok(
    commentsResponse.data.data.list.every((item) =>
      (Array.isArray(item.commentResources) ? item.commentResources : []).every(
        (resource) => !String(resource && resource.src ? resource.src : '').includes('example.com'),
      ),
    ),
    JSON.stringify(commentsResponse.data.data.list),
  );
});
