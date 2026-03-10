import { mockAdminLogin } from '../../model/admin';
import { config } from '../../config/index';
import { normalizeAdminAuthResponse } from '../_utils/auth';

const { delay } = require('../_utils/delay');
const { requestJson } = require('../_utils/request');

function mockLogin(username, password) {
  return delay().then(() => mockAdminLogin(username, password));
}

export function adminLogin(username, password) {
  if (config.useMock) {
    return mockLogin(username, password);
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/login`,
    method: 'POST',
    data: {
      username,
      password,
    },
    header: {
      'Content-Type': 'application/json',
    },
  }).then((response) => normalizeAdminAuthResponse(response));
}
