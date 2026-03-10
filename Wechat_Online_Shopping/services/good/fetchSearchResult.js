/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import { adaptProductCollectionResponse } from '../_utils/catalog-adapters';

const { requestJson } = require('../_utils/request');

/** 获取搜索历史 */
function mockSearchResult(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      item.spuId = item.spuId;
      item.thumb = item.primaryImage;
      item.title = item.title;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => ({ title: tag.title }));
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取搜索历史 */
export function getSearchResult(params) {
  if (config.useMock) {
    return mockSearchResult(params);
  }

  const query = {
    page: params.pageNum || 1,
    pageSize: params.pageSize || 30,
    keyword: params.keyword || '',
  };

  if (params.sort === 1) {
    query.sortBy = 'min_sale_price';
    query.sortOrder = params.sortType === 1 ? 'DESC' : 'ASC';
  }

  if (params.minPrice !== undefined) {
    query.minPrice = params.minPrice;
  }

  if (params.maxPrice !== undefined) {
    query.maxPrice = params.maxPrice;
  }

  return requestJson({
    url: `${config.apiBaseURL}/products/list`,
    method: 'GET',
    data: query,
  }).then((response) => adaptProductCollectionResponse(response));
}
