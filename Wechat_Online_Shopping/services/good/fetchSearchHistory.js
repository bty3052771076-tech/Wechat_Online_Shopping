import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');

const SEARCH_HISTORY_KEY = 'searchHistoryWords';

/** 获取搜索历史 */
function mockSearchHistory() {
  const { delay } = require('../_utils/delay');
  const { getSearchHistory } = require('../../model/search');
  return delay().then(() => getSearchHistory());
}

function readSearchHistory() {
  if (typeof wx === 'undefined' || typeof wx.getStorageSync !== 'function') {
    return [];
  }

  const history = wx.getStorageSync(SEARCH_HISTORY_KEY);
  return Array.isArray(history) ? history.filter(Boolean) : [];
}

/** 将给定的历史词数组写回本地存储（供删除操作调用） */
export function saveSearchHistory(words) {
  if (typeof wx === 'undefined' || typeof wx.setStorageSync !== 'function') {
    return;
  }
  wx.setStorageSync(SEARCH_HISTORY_KEY, Array.isArray(words) ? words : []);
}

export function recordSearchKeyword(keyword) {
  const normalized = String(keyword || '').trim();

  if (!normalized || typeof wx === 'undefined' || typeof wx.setStorageSync !== 'function') {
    return [];
  }

  const nextHistory = [normalized, ...readSearchHistory().filter((item) => item !== normalized)].slice(0, 12);
  wx.setStorageSync(SEARCH_HISTORY_KEY, nextHistory);
  return nextHistory;
}

/** 获取搜索历史 */
export function getSearchHistory() {
  if (config.useMock) {
    return mockSearchHistory();
  }

  return Promise.resolve({
    historyWords: readSearchHistory(),
  });
}

/** 获取热门搜索 */
function mockSearchPopular() {
  const { delay } = require('../_utils/delay');
  const { getSearchPopular } = require('../../model/search');
  return delay().then(() => getSearchPopular());
}

/** 获取热门搜索 */
export function getSearchPopular() {
  if (config.useMock) {
    return mockSearchPopular();
  }

  return requestJson({
    url: `${config.apiBaseURL}/products/list`,
    method: 'GET',
    data: {
      page: 1,
      pageSize: 12,
      sortBy: 'sold_num',
      sortOrder: 'DESC',
    },
  })
    .then((response) => ({
      popularWords: (Array.isArray(response.data) ? response.data : [])
        .map((item) => item.title)
        .filter(Boolean)
        .slice(0, 12),
    }))
    .catch(() => mockSearchPopular());
}
