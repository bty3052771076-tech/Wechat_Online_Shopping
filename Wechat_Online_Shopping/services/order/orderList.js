import { config } from '../../config/index';
import { getOrderList } from '../order-new';

const {
  adaptOrderListResponse,
  buildOrderCountsResponse,
  mapLegacyOrderStatus,
} = require('../_utils/shop-adapters');

/** 获取订单列表mock数据 */
function mockFetchOrders(params) {
  const { delay } = require('../_utils/delay');
  const { genOrders } = require('../../model/order/orderList');

  return delay(200).then(() => genOrders(params));
}

/** 获取订单列表数据 */
export function fetchOrders(params) {
  if (config.useMock) {
    return mockFetchOrders(params);
  }

  const parameter = params && params.parameter ? params.parameter : {};
  const query = {
    page: parameter.pageNum || 1,
    pageSize: parameter.pageSize || 5,
  };

  if (parameter.orderStatus !== undefined && parameter.orderStatus !== -1) {
    query.status = mapLegacyOrderStatus(parameter.orderStatus);
  }

  return getOrderList(query).then((response) => adaptOrderListResponse(response));
}

/** 获取订单列表mock数据 */
function mockFetchOrdersCount(params) {
  const { delay } = require('../_utils/delay');
  const { genOrdersCount } = require('../../model/order/orderList');

  return delay().then(() => genOrdersCount(params));
}

/** 获取订单列表统计 */
export function fetchOrdersCount(params) {
  if (config.useMock) {
    return mockFetchOrdersCount(params);
  }

  return getOrderList({ page: 1, pageSize: 100 }).then((response) => buildOrderCountsResponse(response));
}
