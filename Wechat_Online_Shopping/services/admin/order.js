import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';
import { adaptAdminOrderListResponse, adaptAdminOrderDetailResponse } from '../_utils/admin-adapters';
import { mapLegacyOrderStatus } from '../_utils/shop-adapters';

const { delay } = require('../_utils/delay');
const { getRequestErrorMessage, requestJson } = require('../_utils/request');
const {
  getAdminOrderList,
  getAdminOrderDetail,
  shipOrder,
  getAdminAfterSaleList,
  getAdminAfterSaleDetail,
  auditAfterSale,
} = require('../../model/admin-order');

function showRequestError(err) {
  wx.showToast({
    title: getRequestErrorMessage(err),
    icon: 'none',
  });
}

export function fetchAdminOrders(filters = {}) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminOrderList(filters) }));
  }

  const query = {
    orderNo: filters.orderNo || '',
    userName: filters.userName || '',
    receiverPhone: filters.phone || '',
    startTime: filters.startDate || '',
    endTime: filters.endDate || '',
  };

  if (filters.status && filters.status !== -1) {
    query.status = mapLegacyOrderStatus(filters.status);
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/orders`,
    method: 'GET',
    data: query,
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminOrderListResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function fetchAdminOrderDetail(orderNo) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminOrderDetail(orderNo) }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/orders/${orderNo}`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminOrderDetailResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function shipAdminOrder(orderNo, expressCompany, expressNo) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: shipOrder(orderNo, expressCompany, expressNo),
      msg: '发货成功',
    }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/orders/${orderNo}/ship`,
    method: 'PUT',
    data: {
      deliveryCompany: expressCompany,
      deliveryNo: expressNo,
    },
    header: {
      ...buildAuthHeader('adminToken'),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function fetchAdminAfterSales(status) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminAfterSaleList(status) }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/after-sales`,
    method: 'GET',
    data: status ? { status } : {},
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function fetchAdminAfterSaleDetail(id) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminAfterSaleDetail(id) }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/after-sales/${id}`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function auditAdminAfterSale(id, approved) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: auditAfterSale(id, approved),
      msg: approved ? '审核通过' : '已驳回',
    }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/after-sales/${id}/audit`,
    method: 'PUT',
    data: { approved },
    header: {
      ...buildAuthHeader('adminToken'),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}
