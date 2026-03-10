import { config } from '../config/index';
import { buildAuthHeader } from './_utils/auth';

const { getRequestErrorMessage, requestJson } = require('./_utils/request');

export function addToCart(data) {
  return requestJson({
    url: `${config.apiBaseURL}/cart/add`,
    method: 'POST',
    data,
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      wx.showToast({
        title: '已加入购物车',
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

export function getCartList() {
  return requestJson({
    url: `${config.apiBaseURL}/cart/list`,
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

export function updateCartItem(data) {
  return requestJson({
    url: `${config.apiBaseURL}/cart/update`,
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

export function deleteCartItem(id) {
  return requestJson({
    url: `${config.apiBaseURL}/cart/delete/${id}`,
    method: 'DELETE',
    header: {
      ...buildAuthHeader(),
    },
  })
    .then((response) => {
      wx.showToast({
        title: '删除成功',
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
