import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { buildAuthHeader } = require('../_utils/auth');
const { fetchOrdersCount } = require('../order/orderList');
const { buildUserCenterPayload } = require('../_utils/usercenter-adapters');

function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

export function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter();
  }

  return Promise.all([
    requestJson({
      url: `${config.apiBaseURL}/users/profile`,
      method: 'GET',
      header: {
        ...buildAuthHeader(),
      },
    }),
    fetchOrdersCount(),
    requestJson({
      url: `${config.apiBaseURL}/orders/after-sales`,
      method: 'GET',
      header: {
        ...buildAuthHeader(),
      },
      data: {
        page: 1,
        pageSize: 1,
      },
    }),
  ]).then(([profileResponse, orderCountsResponse, afterSaleResponse]) =>
    buildUserCenterPayload({
      profile: profileResponse && profileResponse.data ? profileResponse.data : {},
      orderCounts: orderCountsResponse && orderCountsResponse.data ? orderCountsResponse.data : [],
      afterSaleCount:
        afterSaleResponse && afterSaleResponse.data && afterSaleResponse.data.pagination
          ? afterSaleResponse.data.pagination.total
          : 0,
    }),
  );
}
