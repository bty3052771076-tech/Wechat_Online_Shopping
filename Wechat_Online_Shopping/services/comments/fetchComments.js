import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { adaptCommentsListResponse } = require('../_utils/comment-adapters');

function mockFetchComments(params) {
  const { delay } = require('../_utils/delay');
  const { getGoodsAllComments } = require('../../model/comments');

  return delay().then(() => getGoodsAllComments(params));
}

export function fetchComments(params = {}) {
  if (config.useMock) {
    return mockFetchComments(params);
  }

  const queryParameter = params.queryParameter || {};
  const query = {
    page: params.pageNum || 1,
    pageSize: params.pageSize || 10,
  };

  if (queryParameter.commentLevel !== undefined && queryParameter.commentLevel !== '') {
    query.commentLevel = queryParameter.commentLevel;
  }

  if (queryParameter.hasImage) {
    query.hasImage = true;
  }

  return requestJson({
    url: `${config.apiBaseURL}/products/${queryParameter.spuId}/comments`,
    method: 'GET',
    data: query,
  }).then((response) => adaptCommentsListResponse(response));
}
