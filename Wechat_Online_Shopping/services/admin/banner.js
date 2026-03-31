import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { requestJson } = require('../_utils/request');

/** 获取Banner列表（管理端，含全部状态） */
export function fetchAdminBannerList() {
  return requestJson({
    url: `${config.apiBaseURL}/admin/banners`,
    method: 'GET',
    header: { ...buildAuthHeader('adminToken') },
  });
}

/** 创建Banner */
export function createAdminBanner(data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/banners`,
    method: 'POST',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 更新Banner */
export function updateAdminBanner(id, data) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/banners/${id}`,
    method: 'PUT',
    data,
    header: { ...buildAuthHeader('adminToken'), 'Content-Type': 'application/json' },
  });
}

/** 删除Banner（软删除） */
export function deleteAdminBanner(id) {
  return requestJson({
    url: `${config.apiBaseURL}/admin/banners/${id}`,
    method: 'DELETE',
    header: { ...buildAuthHeader('adminToken') },
  });
}
