import { config } from '../config/index';
import { buildAuthHeader } from './_utils/auth';

const { getRequestErrorMessage, requestJson } = require('./_utils/request');

export function createOrder(data) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/create`,
    method: 'POST',
    data,
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      wx.showToast({
        title: '订单创建成功',
        icon: 'success',
      });

      return response;
    })
    .catch((err) => {
      wx.showToast({
        title: getRequestErrorMessage(err),
        icon: 'none',
      });

      return Promise.reject(err);
    });
}

export function getOrderList(params) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/list`,
    method: 'GET',
    data: params,
    header: {
      ...buildAuthHeader(),
    },
  }).catch((err) => {
    wx.showToast({
      title: getRequestErrorMessage(err),
      icon: 'none',
    });

    return Promise.reject(err);
  });
}

export function getOrderDetail(id) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/detail/${id}`,
    method: 'GET',
    header: {
      ...buildAuthHeader(),
    },
  }).catch((err) => {
    wx.showToast({
      title: getRequestErrorMessage(err),
      icon: 'none',
    });

    return Promise.reject(err);
  });
}

export function payOrder(orderNo) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/${orderNo}/pay`,
    method: 'PUT',
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    wx.showToast({
      title: getRequestErrorMessage(err),
      icon: 'none',
    });

    return Promise.reject(err);
  });
}

export function cancelOrder(orderNo, data = {}) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/${orderNo}/cancel`,
    method: 'PUT',
    data,
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    wx.showToast({
      title: getRequestErrorMessage(err),
      icon: 'none',
    });

    return Promise.reject(err);
  });
}

export function confirmOrderReceived(orderNo) {
  return requestJson({
    url: `${config.apiBaseURL}/orders/${orderNo}/confirm-received`,
    method: 'PUT',
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    wx.showToast({
      title: getRequestErrorMessage(err),
      icon: 'none',
    });

    return Promise.reject(err);
  });
}
