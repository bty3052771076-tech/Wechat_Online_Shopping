import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const {
  adaptCommentSummaryResponse,
  adaptGoodsDetailsCommentListResponse,
} = require('../_utils/comment-adapters');

function mockFetchGoodDetailsCommentsCount(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsDetailsCommentsCount } = require('../../model/detailsComments');

  return delay().then(() => getGoodsDetailsCommentsCount(spuId));
}

export function getGoodsDetailsCommentsCount(spuId = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentsCount(spuId);
  }

  return requestJson({
    url: `${config.apiBaseURL}/products/${spuId}/comments/summary`,
    method: 'GET',
  }).then((response) => adaptCommentSummaryResponse(response));
}

function mockFetchGoodDetailsCommentList(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsDetailsComments } = require('../../model/detailsComments');

  return delay().then(() => getGoodsDetailsComments(spuId));
}

export function getGoodsDetailsCommentList(spuId = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentList(spuId);
  }

  return requestJson({
    url: `${config.apiBaseURL}/products/${spuId}/comments`,
    method: 'GET',
    data: {
      page: 1,
      pageSize: 3,
    },
  }).then((response) => adaptGoodsDetailsCommentListResponse(response));
}
