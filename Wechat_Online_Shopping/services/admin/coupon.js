import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { requestJson } = require('../_utils/request');

/** 获取优惠券列表 */
export function fetchAdminCouponList() {
  return requestJson({
    url: `${config.apiBaseURL}/admin/coupons`,
    method: 'GET',
    header: { ...buildAuthHeader('adminToken') },
  });
}

/** 创建优惠券 */
export function createAdminCoupon(data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/coupons`,
    method: 'POST',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 更新优惠券 */
export function updateAdminCoupon(id, data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/coupons/${id}`,
    method: 'PUT',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 下架/删除优惠券（软删除） */
export function deleteAdminCoupon(id) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/coupons/${id}`,
    method: 'DELETE',
    header: { ...buildAuthHeader('adminToken') },
  });
}
