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

// ---- buildMessages 单元测试 ----

test('buildMessages includes system prompt and user message', async () => {
  const { buildMessages } = require('../src/services/agent.service');
  const { SYSTEM_PROMPT } = require('../src/config/agent-prompt');
  const result = buildMessages([], '你好');
  assert.equal(result[0].role, 'system');
  assert.equal(result[0].content, SYSTEM_PROMPT);
  assert.equal(result[result.length - 1].role, 'user');
  assert.equal(result[result.length - 1].content, '你好');
});

test('buildMessages includes history and truncates to context window', async () => {
  const { buildMessages } = require('../src/services/agent.service');
  const { CONTEXT_WINDOW_SIZE } = require('../src/config/agent-prompt');
  // 构造超出窗口大小的历史消息
  const history = [];
  for (let i = 0; i < CONTEXT_WINDOW_SIZE + 5; i++) {
    history.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `msg-${i}` });
  }
  const result = buildMessages(history, '最新消息');
  // system(1) + truncated history(CONTEXT_WINDOW_SIZE) + user(1)
  assert.equal(result.length, 1 + CONTEXT_WINDOW_SIZE + 1);
  // 最早的消息应被截断
  assert.equal(result[1].content, `msg-5`);
});

// ---- executeTool 单元测试 ----

test('executeTool returns error for unknown tool', async () => {
  const { executeTool } = require('../src/services/agent.service');
  const result = await executeTool('unknownTool', {});
  const parsed = JSON.parse(result);
  assert.ok(parsed.error);
  assert.ok(parsed.error.includes('Unknown tool'));
});

// ---- searchProducts 集成测试 ----

test('searchProducts returns products with correct fields', async () => {
  const { searchProducts } = require('../src/services/agent.service');
  const results = await searchProducts({ keyword: '洗面奶' });
  assert.ok(Array.isArray(results));
  if (results.length > 0) {
    const p = results[0];
    // 验证返回字段完整性
    assert.ok(typeof p.id === 'number');
    assert.ok(typeof p.title === 'string');
    assert.ok(typeof p.price === 'number');      // 分
    assert.ok(typeof p.priceYuan === 'string');   // 元
    assert.ok(typeof p.url === 'string');
    assert.ok(p.url.includes('spuId='));
    // 价格转换正确性：price(分) = priceYuan(元) * 100
    assert.equal(p.price, Math.round(Number(p.priceYuan) * 100));
  }
});

test('searchProducts returns at most 5 results', async () => {
  const { searchProducts } = require('../src/services/agent.service');
  const results = await searchProducts({});
  assert.ok(results.length <= 5);
});

test('searchProducts returns empty array for non-matching keyword', async () => {
  const { searchProducts } = require('../src/services/agent.service');
  const results = await searchProducts({ keyword: '不存在的商品xyz123' });
  assert.deepStrictEqual(results, []);
});

// ---- API 认证测试补充 ----

test('POST /api/agent/chat requires authentication', async () => {
  const res = await api.post('/api/agent/chat', { message: 'test' });
  assert.equal(res.status, 401);
});

test('DELETE /api/agent/sessions/1 requires authentication', async () => {
  const res = await api.delete('/api/agent/sessions/1');
  assert.equal(res.status, 401);
});

test('GET /api/agent/sessions/1/messages requires authentication', async () => {
  const res = await api.get('/api/agent/sessions/1/messages');
  assert.equal(res.status, 401);
});
