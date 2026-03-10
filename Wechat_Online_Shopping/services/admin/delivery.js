import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { delay } = require('../_utils/delay');
const { getRequestErrorMessage, requestJson } = require('../_utils/request');
const {
  getDeliveryAreaList,
  updateDeliveryArea,
  addDeliveryArea,
  deleteDeliveryArea,
} = require('../../model/admin-delivery');

function showRequestError(err) {
  wx.showToast({
    title: getRequestErrorMessage(err),
    icon: 'none',
  });
}

export function fetchDeliveryAreas() {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getDeliveryAreaList() }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/delivery-areas`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function updateDeliveryAreaSetting(id, data) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: updateDeliveryArea(id, data), msg: '更新成功' }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/delivery-areas/${id}`,
    method: 'PUT',
    data,
    header: {
      ...buildAuthHeader('adminToken'),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function addDeliveryAreaSetting(data) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: addDeliveryArea(data), msg: '添加成功' }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/delivery-areas`,
    method: 'POST',
    data,
    header: {
      ...buildAuthHeader('adminToken'),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}

export function deleteDeliveryAreaSetting(id) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: deleteDeliveryArea(id), msg: '删除成功' }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/delivery-areas/${id}`,
    method: 'DELETE',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}
