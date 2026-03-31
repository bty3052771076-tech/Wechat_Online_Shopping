import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');

/** 获取商品列表 */
function mockFetchPromotion(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getPromotion } = require('../../model/promotion');
  return delay().then(() => getPromotion(ID));
}

/** 获取活动详情（含商品列表） */
export function fetchPromotion(ID = 0) {
  if (config.useMock) {
    return mockFetchPromotion(ID);
  }
  return requestJson({
    url: `${config.apiBaseURL}/promotions/${ID}`,
    method: 'GET',
  }).then((res) => {
    return res && res.data ? res.data : null;
  });
}
