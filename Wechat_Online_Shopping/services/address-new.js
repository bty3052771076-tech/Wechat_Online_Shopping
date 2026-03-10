import { config } from '../config/index';
import { buildAuthHeader } from './_utils/auth';

const { getRequestErrorMessage, requestJson } = require('./_utils/request');

export function addAddress(data) {
  return requestJson({
    url: `${config.apiBaseURL}/addresses`,
    method: 'POST',
    data,
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      wx.showToast({
        title: '添加地址成功',
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

export function getAddressList() {
  return requestJson({
    url: `${config.apiBaseURL}/addresses`,
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

export function updateAddress(id, data) {
  return requestJson({
    url: `${config.apiBaseURL}/addresses/${id}`,
    method: 'PUT',
    data,
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      wx.showToast({
        title: '更新地址成功',
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

export function deleteAddress(id) {
  return requestJson({
    url: `${config.apiBaseURL}/addresses/${id}`,
    method: 'DELETE',
    header: {
      ...buildAuthHeader(),
    },
  })
    .then((response) => {
      wx.showToast({
        title: '删除地址成功',
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

export function setDefaultAddress(id) {
  return requestJson({
    url: `${config.apiBaseURL}/addresses/${id}/default`,
    method: 'PUT',
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      wx.showToast({
        title: '默认地址已更新',
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
