import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { adaptCommentSummaryResponse } = require('../_utils/comment-adapters');

function mockFetchCommentsCount(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsCommentsCount } = require('../../model/comments');

  return delay().then(() => getGoodsCommentsCount(ID));
}

export function fetchCommentsCount(ID = 0) {
  if (config.useMock) {
    return mockFetchCommentsCount(ID);
  }

  const spuId = typeof ID === 'object' && ID !== null ? ID.spuId : ID;

  return requestJson({
    url: `${config.apiBaseURL}/products/${spuId}/comments/summary`,
    method: 'GET',
  }).then((response) => adaptCommentSummaryResponse(response));
}
