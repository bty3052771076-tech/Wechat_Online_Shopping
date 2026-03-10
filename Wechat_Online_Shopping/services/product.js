import { config } from '../config/index';
import { buildAuthHeader } from './_utils/auth';

const { getRequestErrorMessage, requestJson } = require('./_utils/request');

export function getProductList(params) {
  return requestJson({
    url: `${config.apiBaseURL}/products/list`,
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

export function getProductDetail(id) {
  return requestJson({
    url: `${config.apiBaseURL}/products/detail/${id}`,
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

export function getCategoryTree() {
  return requestJson({
    url: `${config.apiBaseURL}/products/categories/tree`,
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
