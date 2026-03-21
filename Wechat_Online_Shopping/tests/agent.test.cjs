const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

// Mock global wx before requiring agent module
global.wx = {
  getStorageSync() { return ''; },
  request() { return { onChunkReceived() {} }; },
};

// Mock config/index (uses ES export syntax, cannot be required directly)
const configPath = path.resolve(__dirname, '..', 'config', 'index.js');
require.cache[configPath] = {
  id: configPath,
  filename: configPath,
  loaded: true,
  exports: { baseUrl: 'http://localhost:3000' },
};

// 导入被测模块的纯函数
const { parseSSEEvent, arrayBufferToString } = require('../services/agent/agent');

// ---- parseSSEEvent 测试 ----

test('parseSSEEvent parses delta event correctly', () => {
  const chunk = 'event: delta\ndata: {"content":"hello"}';
  const result = parseSSEEvent(chunk);
  assert.deepStrictEqual(result, {
    event: 'delta',
    data: '{"content":"hello"}',
  });
});

test('parseSSEEvent parses products event correctly', () => {
  const chunk = 'event: products\ndata: {"products":[{"id":1,"title":"Test"}]}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'products');
  const data = JSON.parse(result.data);
  assert.equal(data.products.length, 1);
  assert.equal(data.products[0].id, 1);
});

test('parseSSEEvent parses done event correctly', () => {
  const chunk = 'event: done\ndata: {"sessionId":123,"messageId":456}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'done');
  const data = JSON.parse(result.data);
  assert.equal(data.sessionId, 123);
  assert.equal(data.messageId, 456);
});

test('parseSSEEvent returns null for empty data', () => {
  const chunk = 'event: delta';
  const result = parseSSEEvent(chunk);
  assert.equal(result, null);
});

test('parseSSEEvent defaults to message event when no event field', () => {
  const chunk = 'data: {"content":"fallback"}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'message');
});

// ---- arrayBufferToString 测试 ----

test('arrayBufferToString converts ASCII ArrayBuffer to string', () => {
  const str = 'hello world';
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i);
  }
  const result = arrayBufferToString(buf.buffer);
  assert.equal(result, 'hello world');
});
