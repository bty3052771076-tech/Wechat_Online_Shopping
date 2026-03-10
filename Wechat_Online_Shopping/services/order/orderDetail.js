import { config } from '../../config/index';
import { getOrderList, getOrderDetail } from '../order-new';

const { adaptOrderDetailResponse } = require('../_utils/shop-adapters');

/** 获取订单详情mock数据 */
function mockFetchOrderDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genOrderDetail } = require('../../model/order/orderDetail');

  return delay().then(() => genOrderDetail(params));
}

/** 获取订单详情数据 */
export function fetchOrderDetail(params) {
  if (config.useMock) {
    return mockFetchOrderDetail(params);
  }

  const orderNo = params && params.parameter ? params.parameter : '';

  return getOrderList({ page: 1, pageSize: 100 }).then((response) => {
    const list = response && response.data && Array.isArray(response.data.list) ? response.data.list : [];
    const matchedOrder = list.find((order) => order.order_no === orderNo);

    if (!matchedOrder) {
      return Promise.reject(new Error('order not found'));
    }

    return getOrderDetail(matchedOrder.id).then((detailResponse) => adaptOrderDetailResponse(detailResponse));
  });
}

/** 获取客服mock数据 */
function mockFetchBusinessTime(params) {
  const { delay } = require('../_utils/delay');
  const { genBusinessTime } = require('../../model/order/orderDetail');

  return delay().then(() => genBusinessTime(params));
}

/** 获取客服数据 */
export function fetchBusinessTime(params) {
  if (config.useMock) {
    return mockFetchBusinessTime(params);
  }

  return Promise.resolve({
    code: 'Success',
    data: {
      businessTime: ['Mon-Sun 09:00-18:00'],
      telphone: '400-800-1234',
      saasId: 'local-backend',
    },
    msg: '',
  });
}
