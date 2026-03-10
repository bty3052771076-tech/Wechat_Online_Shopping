import { config } from '../../config/index';
import { getCartList } from '../cart-new';

const { adaptCartListResponse } = require('../_utils/shop-adapters');

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const { delay } = require('../_utils/delay');
  const { genCartGroupData } = require('../../model/cart');

  return delay().then(() => genCartGroupData(params));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return getCartList().then((response) => adaptCartListResponse(response));
}
