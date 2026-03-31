import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { requestJson } = require('../_utils/request');

/** 获取促销活动列表（管理端） */
export function fetchAdminPromotionList() {
  return requestJson({
    url: `${config.apiBaseURL}/admin/promotions`,
    method: 'GET',
    header: { ...buildAuthHeader('adminToken') },
  });
}

/** 创建促销活动 */
export function createAdminPromotion(data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/promotions`,
    method: 'POST',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 更新促销活动 */
export function updateAdminPromotion(id, data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/promotions/${id}`,
    method: 'PUT',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 下架促销活动（软删除） */
export function deleteAdminPromotion(id) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/promotions/${id}`,
    method: 'DELETE',
    header: { ...buildAuthHeader('adminToken') },
  });
}
