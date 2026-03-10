import { mockLogin, mockWechatLogin, mockRegister } from '../../model/user';
import { config } from '../../config/index';
import { normalizeUserAuthResponse } from '../_utils/auth';

const { delay } = require('../_utils/delay');
const { requestJson } = require('../_utils/request');

function mockUserLogin(username, password) {
  return delay().then(() => mockLogin(username, password));
}

function mockUserWechatLogin() {
  return delay().then(() => mockWechatLogin());
}

function mockUserRegister(userInfo) {
  return delay().then(() => mockRegister(userInfo));
}

function requestAuth(url, data) {
  return requestJson({
    url: `${config.apiBaseURL}${url}`,
    method: 'POST',
    data,
    header: {
      'Content-Type': 'application/json',
    },
  }).then((response) => normalizeUserAuthResponse(response));
}

export function userLogin(username, password) {
  if (config.useMock) {
    return mockUserLogin(username, password);
  }

  return requestAuth('/users/login', {
    username,
    password,
  });
}

export function userWechatLogin() {
  if (config.useMock) {
    return mockUserWechatLogin();
  }

  return Promise.resolve({
    code: 'NotSupported',
    data: null,
    msg: '暂未接入微信快捷登录，请使用账号密码登录',
  });
}

export function userRegister(userInfo) {
  if (config.useMock) {
    return mockUserRegister(userInfo);
  }

  return requestAuth('/users/register', {
    username: userInfo.username,
    password: userInfo.password,
    phone: userInfo.phoneNumber || '',
    email: userInfo.email || '',
  });
}
