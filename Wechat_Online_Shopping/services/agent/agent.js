const config = require('../../config/index');
const { requestJson } = require('../_utils/request');

/**
 * 获取 API 基础 URL
 */
function getBaseUrl() {
  return config.baseUrl || 'http://localhost:3000';
}

/**
 * 获取认证 token
 */
function getToken() {
  return wx.getStorageSync('token') || '';
}

/**
 * 发送聊天消息（SSE 流式）
 * @param {object} options
 * @param {number|null} options.sessionId - 会话ID，null 则新建
 * @param {string} options.message - 用户消息
 * @param {function} options.onDelta - 文本增量回调
 * @param {function} options.onProducts - 商品推荐回调
 * @param {function} options.onDone - 完成回调
 * @param {function} options.onError - 错误回调
 * @returns {object} requestTask — 可调用 .abort() 取消请求
 */
function sendChatMessage({ sessionId, message, onDelta, onProducts, onDone, onError }) {
  const token = getToken();
  if (!token) {
    if (onError) onError('未登录');
    return null;
  }

  let buffer = ''; // SSE 解析缓冲区

  const requestTask = wx.request({
    url: `${getBaseUrl()}/api/agent/chat`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    data: { sessionId, message },
    enableChunked: true,
    responseType: 'text',
    success() {},
    fail(err) {
      if (onError) onError(err.errMsg || '网络错误');
    },
  });

  // 监听分块数据
  if (requestTask && typeof requestTask.onChunkReceived === 'function') {
    requestTask.onChunkReceived((response) => {
      const text = arrayBufferToString(response.data);
      buffer += text;

      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        if (!part.trim()) continue;
        const parsed = parseSSEEvent(part);
        if (!parsed) continue;

        if (parsed.event === 'delta' && onDelta) {
          try {
            const data = JSON.parse(parsed.data);
            onDelta(data.content || '');
          } catch (e) { /* ignore */ }
        } else if (parsed.event === 'products' && onProducts) {
          try {
            const data = JSON.parse(parsed.data);
            onProducts(data.products || []);
          } catch (e) { /* ignore */ }
        } else if (parsed.event === 'done' && onDone) {
          try {
            const data = JSON.parse(parsed.data);
            onDone(data);
          } catch (e) { /* ignore */ }
        } else if (parsed.event === 'error' && onError) {
          try {
            const data = JSON.parse(parsed.data);
            onError(data.message || '未知错误');
          } catch (e) {
            onError('未知错误');
          }
        }
      }
    });
  }

  return requestTask;
}

/**
 * ArrayBuffer 转字符串
 */
function arrayBufferToString(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
}

/**
 * 解析单个 SSE 事件块
 */
function parseSSEEvent(chunk) {
  let event = 'message';
  let data = '';

  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('event: ')) {
      event = line.slice(7).trim();
    } else if (line.startsWith('data: ')) {
      data = line.slice(6);
    }
  }

  if (!data) return null;
  return { event, data };
}

/**
 * 获取会话列表
 */
function getSessions(page = 1, pageSize = 20) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

/**
 * 获取会话历史消息
 */
function getSessionMessages(sessionId, page = 1, pageSize = 50) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions/${sessionId}/messages?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

/**
 * 删除会话
 */
function deleteSession(sessionId) {
  return requestJson({
    url: `${getBaseUrl()}/api/agent/sessions/${sessionId}`,
    method: 'DELETE',
    header: { Authorization: `Bearer ${getToken()}` },
  });
}

module.exports = {
  sendChatMessage,
  getSessions,
  getSessionMessages,
  deleteSession,
  parseSSEEvent,
  arrayBufferToString,
};
