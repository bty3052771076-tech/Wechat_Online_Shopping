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
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function login() {
  const res = await api.post('/api/users/login', {
    username: 'testuser',
    password: '123456',
  });
  assert.equal(res.status, 200, 'login should succeed');
  return res.data.data.token;
}

test('GET /api/agent/sessions requires authentication', async () => {
  const res = await api.get('/api/agent/sessions');
  assert.equal(res.status, 401);
});

test('GET /api/agent/sessions returns empty list for new user', async () => {
  const token = await login();
  const res = await api.get('/api/agent/sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.code, 'Success');
  assert.ok(Array.isArray(res.data.data));
});

test('POST /api/agent/chat rejects empty message', async () => {
  const token = await login();
  const res = await api.post(
    '/api/agent/chat',
    { message: '' },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(res.status, 400);
  assert.equal(res.data.code, 'InvalidParam');
});

test('POST /api/agent/chat rejects message exceeding max length', async () => {
  const token = await login();
  const longMsg = 'a'.repeat(501);
  const res = await api.post(
    '/api/agent/chat',
    { message: longMsg },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(res.status, 400);
  assert.equal(res.data.code, 'InvalidParam');
});

test('DELETE /api/agent/sessions/999999 returns not found', async () => {
  const token = await login();
  const res = await api.delete('/api/agent/sessions/999999', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 404);
});

test('GET /api/agent/sessions/999999/messages returns not found', async () => {
  const token = await login();
  const res = await api.get('/api/agent/sessions/999999/messages', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 404);
});
