import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');

/** 获取活动列表 */
function mockFetchActivityList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getActivityList } = require('../../model/activities');

  return delay().then(() => getActivityList(pageIndex, pageSize));
}

/** 获取当前有效的活动列表 */
export function fetchActivityList(pageIndex = 1, pageSize = 20) {
  if (config.useMock) {
    return mockFetchActivityList(pageIndex, pageSize);
  }

  return requestJson({
    url: `${config.apiBaseURL}/promotions`,
    method: 'GET',
  }).then((res) => {
    return Array.isArray(res && res.data) ? res.data : [];
  }).catch(() => []);
}
