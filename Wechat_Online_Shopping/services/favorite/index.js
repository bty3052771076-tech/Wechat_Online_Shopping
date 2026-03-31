import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { requestJson } = require('../_utils/request');

/** 获取当前用户的收藏列表 */
export function fetchFavoriteList(page = 1, pageSize = 20) {
  return requestJson({
    url: `${config.apiBaseURL}/favorites?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    header: { ...buildAuthHeader() },
  }).then((res) => {
    return res && res.data ? res.data : { list: [], pagination: {} };
  });
}

/** 收藏商品 */
export function addFavorite(spuId) {
  return requestJson({
    url: `${config.apiBaseURL}/favorites`,
    method: 'POST',
    data: { spuId: String(spuId) },
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
}

/** 取消收藏 */
export function removeFavorite(spuId) {
  return requestJson({
    url: `${config.apiBaseURL}/favorites/${spuId}`,
    method: 'DELETE',
    header: { ...buildAuthHeader() },
  });
}

/** 检查是否已收藏 */
export function checkFavorite(spuId) {
  return requestJson({
    url: `${config.apiBaseURL}/favorites/check/${spuId}`,
    method: 'GET',
    header: { ...buildAuthHeader() },
  }).then((res) => {
    return res && res.data ? res.data.isFavorite : false;
  });
}
