import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { delay } = require('../_utils/delay');
const { getRequestErrorMessage, requestJson } = require('../_utils/request');
const {
  adaptRightsListResponse,
  adaptRightsDetailResponse,
  buildAfterSaleApplyPayload,
  buildAfterSaleLogisticsPayload,
  buildAfterSalePreviewResponse,
  buildAfterSaleReasonResponse,
} = require('../_utils/after-sale-adapters');

const resp = {
  data: {
    pageNum: 1,
    pageSize: 10,
    totalCount: 0,
    states: {
      audit: 0,
      approved: 0,
      complete: 0,
      closed: 0,
    },
    dataList: [],
  },
  code: 'Success',
  msg: '',
};

function showRequestError(err) {
  wx.showToast({
    title: getRequestErrorMessage(err),
    icon: 'none',
  });
}

function requestWithUserAuth(options) {
  return requestJson({
    ...options,
    header: {
      ...(options.header || {}),
      ...buildAuthHeader('token'),
    },
  });
}

export function getRightsList({ parameter: { afterServiceStatus, pageNum = 1, pageSize = 10 } }) {
  if (config.useMock) {
    return delay().then(() => resp);
  }

  const query = {
    page: pageNum,
    pageSize,
  };

  if (afterServiceStatus !== undefined && afterServiceStatus !== null && afterServiceStatus !== -1) {
    query.status = afterServiceStatus;
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales`,
    method: 'GET',
    data: query,
  })
    .then((response) => adaptRightsListResponse(response))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function getRightsDetail({ rightsNo }) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: [],
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/${rightsNo}`,
    method: 'GET',
  })
    .then((response) => adaptRightsDetailResponse(response))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function cancelRights({ rightsNo }) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: {
        rightsNo,
      },
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/${rightsNo}/cancel`,
    method: 'PUT',
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function fetchRightsPreview(params) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: {
        ...params,
        goodsInfo: {
          goodsName: '',
          skuImage: '',
          specInfo: [],
        },
      },
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/preview`,
    method: 'GET',
    data: params,
  })
    .then((response) => buildAfterSalePreviewResponse(response))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function dispatchConfirmReceived({ parameter: { orderNo } = {} }) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: { orderNo },
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/${orderNo}/confirm-received`,
    method: 'PUT',
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function fetchApplyReasonList(params) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: {
        rightsReasonList: [],
      },
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/reasons`,
    method: 'GET',
    data: params,
  })
    .then((response) => buildAfterSaleReasonResponse(response))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function dispatchApplyService(payload) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: {
        rightsNo: payload && payload.rights && payload.rights.orderNo ? `${payload.rights.orderNo}-mock` : 'mock-rights',
      },
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/apply`,
    method: 'POST',
    data: buildAfterSaleApplyPayload(payload),
    header: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function getDeliverCompanyList() {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: [],
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/logistics-companies`,
    method: 'GET',
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

function saveTrackingInfo(payload, fallback) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      msg: '',
      data: payload,
    }));
  }

  return requestWithUserAuth({
    url: `${config.apiBaseURL}/orders/after-sales/${payload.rightsNo}/logistics`,
    method: 'PUT',
    data: buildAfterSaleLogisticsPayload(payload),
    header: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function createTrackingInfo(payload) {
  return saveTrackingInfo(payload);
}

export function updateTrackingInfo(payload) {
  return saveTrackingInfo(payload);
}
