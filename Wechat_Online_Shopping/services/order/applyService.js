import { config } from '../../config/index';
import {
  dispatchApplyService as requestApplyService,
  dispatchConfirmReceived as requestConfirmReceived,
  fetchApplyReasonList as requestApplyReasonList,
  fetchRightsPreview as requestRightsPreview,
} from './afterSale';

/** 获取售后单mock数据 */
function mockFetchRightsPreview(params) {
  const { delay } = require('../_utils/delay');
  const { genRightsPreview } = require('../../model/order/applyService');

  return delay().then(() => genRightsPreview(params));
}

/** 获取售后单数据 */
export function fetchRightsPreview(params) {
  if (config.useMock) {
    return mockFetchRightsPreview(params);
  }

  return requestRightsPreview(params);
}

/** 确认收货 */
export function dispatchConfirmReceived(params) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }

  return requestConfirmReceived(params);
}

/** 获取可选的mock售后原因列表 */
function mockFetchApplyReasonList(params) {
  const { delay } = require('../_utils/delay');
  const { genApplyReasonList } = require('../../model/order/applyService');

  return delay().then(() => genApplyReasonList(params));
}

/** 获取可选的售后原因列表 */
export function fetchApplyReasonList(params) {
  if (config.useMock) {
    return mockFetchApplyReasonList(params);
  }

  return requestApplyReasonList(params);
}

/** 发起mock售后申请 */
function mockDispatchApplyService(params) {
  const { delay } = require('../_utils/delay');
  const { applyService } = require('../../model/order/applyService');

  return delay().then(() => applyService(params));
}

/** 发起售后申请 */
export function dispatchApplyService(params) {
  if (config.useMock) {
    return mockDispatchApplyService(params);
  }

  return requestApplyService(params);
}
