import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { adaptCategoryTreeResponse } = require('../_utils/catalog-adapters');

function mockFetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getCategoryList } = require('../../model/category');

  return delay().then(() => getCategoryList());
}

function realFetchCategoryList() {
  return requestJson({
    url: `${config.apiBaseURL}/products/categories/tree`,
    method: 'GET',
  }).then((response) => adaptCategoryTreeResponse(response));
}

export function getCategoryList() {
  if (config.useMock) {
    return mockFetchGoodCategory();
  }

  return realFetchCategoryList();
}
