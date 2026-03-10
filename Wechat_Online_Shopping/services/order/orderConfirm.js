import { config } from '../../config/index';
import { mockIp, mockReqId } from '../../utils/mock';
import { createOrder } from '../order-new';
import { getAddressList } from '../address-new';

const {
  buildSettleDetailResponse,
  buildCreateOrderPayload,
  adaptOrderSubmitResponse,
  pickDefaultAddress,
} = require('../_utils/shop-adapters');

/** 获取结算mock数据 */
function mockFetchSettleDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genSettleDetail } = require('../../model/order/orderConfirm');

  return delay().then(() => genSettleDetail(params));
}

/** 提交mock订单 */
function mockDispatchCommitPay() {
  const { delay } = require('../_utils/delay');

  return delay().then(() => ({
    data: {
      isSuccess: true,
      tradeNo: '350930961469409099',
      payInfo: '{}',
      code: null,
      transactionId: 'E-200915180100299000',
      msg: null,
      interactId: '15145',
      channel: 'wechat',
      limitGoodsList: null,
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 891,
    success: true,
  }));
}

/** 获取结算数据 */
export function fetchSettleDetail(params) {
  if (config.useMock) {
    return mockFetchSettleDetail(params);
  }

  if (params.userAddressReq) {
    return Promise.resolve(buildSettleDetailResponse(params));
  }

  return getAddressList()
    .then((response) => {
      const address = pickDefaultAddress(response.data);

      return buildSettleDetailResponse({
        ...params,
        userAddressReq: address,
      });
    })
    .catch(() => buildSettleDetailResponse(params));
}

/* 提交订单 */
export function dispatchCommitPay(params) {
  if (config.useMock) {
    return mockDispatchCommitPay(params);
  }

  return createOrder(buildCreateOrderPayload(params)).then((response) => adaptOrderSubmitResponse(response));
}

/** 开发票 */
export function dispatchSupplementInvoice() {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}
