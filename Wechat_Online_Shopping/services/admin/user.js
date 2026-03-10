import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';
import { adaptAdminUsersListResponse, adaptAdminUserDetailResponse } from '../_utils/admin-adapters';

const { delay } = require('../_utils/delay');
const { getRequestErrorMessage, requestJson } = require('../_utils/request');
const { getAdminUserList, getAdminUserDetail, updateUserRemark } = require('../../model/admin-user');

function showRequestError(err) {
  wx.showToast({
    title: getRequestErrorMessage(err),
    icon: 'none',
  });
}

export function fetchAdminUsers(keyword) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminUserList(keyword) }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/users`,
    method: 'GET',
    data: { keyword },
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminUsersListResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function fetchAdminUserDetail(userId) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: getAdminUserDetail(userId) }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/users/${userId}`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminUserDetailResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function updateAdminUserRemark(userId, remark) {
  if (config.useMock) {
    return delay().then(() => ({ code: 'Success', data: updateUserRemark(userId, remark), msg: '备注已更新' }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/users/${userId}/remark`,
    method: 'PUT',
    data: { remark },
    header: {
      ...buildAuthHeader('adminToken'),
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}
