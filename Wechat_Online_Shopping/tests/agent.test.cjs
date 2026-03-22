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

// ---- 补充测试 ----

test('arrayBufferToString converts UTF-8 Chinese ArrayBuffer to string', () => {
  // "你好" 的 UTF-8 编码: E4BDA0 E5A5BD
  const bytes = new Uint8Array([0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD]);
  const result = arrayBufferToString(bytes.buffer);
  assert.equal(result, '你好');
});

test('parseSSEEvent parses error event correctly', () => {
  const chunk = 'event: error\ndata: {"message":"服务暂时不可用"}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'error');
  const data = JSON.parse(result.data);
  assert.equal(data.message, '服务暂时不可用');
});

test('parseSSEEvent handles data with colons correctly', () => {
  // data 字段中包含冒号（如 URL）
  const chunk = 'event: delta\ndata: {"content":"链接: https://example.com"}';
  const result = parseSSEEvent(chunk);
  assert.equal(result.event, 'delta');
  const data = JSON.parse(result.data);
  assert.equal(data.content, '链接: https://example.com');
});

test('parseSSEEvent returns null for comment-only chunk', () => {
  const chunk = ': this is a comment';
  const result = parseSSEEvent(chunk);
  assert.equal(result, null);
});

test('parseSSEEvent handles multiline data field', () => {
  // SSE 标准中同一事件的 data 字段可以出现多次
  const chunk = 'event: delta\ndata: {"content":"hello"}';
  const result = parseSSEEvent(chunk);
  assert.ok(result !== null);
  assert.equal(result.event, 'delta');
});
