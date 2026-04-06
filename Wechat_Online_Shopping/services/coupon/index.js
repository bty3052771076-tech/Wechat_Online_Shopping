import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';

const { requestJson } = require('../_utils/request');

/** 获取优惠券列表 */
function mockFetchCoupon(status) {
  const { delay } = require('../_utils/delay');
  const { getCouponList } = require('../../model/coupon');
  return delay().then(() => getCouponList(status));
}

/** 获取当前用户的优惠券列表（status: 'default'|'useless'|'disabled'） */
export function fetchCouponList(status = 'default') {
  if (config.useMock) {
    return mockFetchCoupon(status);
  }
  return requestJson({
    url: `${config.apiBaseURL}/coupons/user?status=${status}`,
    method: 'GET',
    header: { ...buildAuthHeader() },
  }).then((res) => {
    return Array.isArray(res && res.data) ? res.data : [];
  });
}

/** 获取优惠券详情 — 从可领取列表中找（兼容原有 mock 数据结构） */
function mockFetchCouponDetail(id, status) {
  const { delay } = require('../_utils/delay');
  const { getCoupon } = require('../../model/coupon');
  const { genAddressList } = require('../../model/address');

  return delay().then(() => {
    const result = {
      detail: getCoupon(id, status),
      storeInfoList: genAddressList(),
    };

    result.detail.useNotes = `1个订单限用1张，除运费券外，不能与其它类型的优惠券叠加使用（运费券除外）\n2.仅适用于各区域正常售卖商品，不支持团购、抢购、预售类商品`;
    result.detail.storeAdapt = `商城通用`;

    if (result.detail.type === 'price') {
      result.detail.desc = `减免 ${result.detail.value / 100} 元`;

      if (result.detail.base) {
        result.detail.desc += `，满${result.detail.base / 100}元可用`;
      }

      result.detail.desc += '。';
    } else if (result.detail.type === 'discount') {
      result.detail.desc = `${result.detail.value}折`;

      if (result.detail.base) {
        result.detail.desc += `，满${result.detail.base / 100}元可用`;
      }

      result.detail.desc += '。';
    }

    return result;
  });
}

/** 获取优惠券详情 */
export function fetchCouponDetail(id, status = 'default') {
  if (config.useMock) {
    return mockFetchCouponDetail(id, status);
  }
  // 从可领取列表查找目标优惠券
  return requestJson({
    url: `${config.apiBaseURL}/coupons`,
    method: 'GET',
  }).then((res) => {
    const list = Array.isArray(res && res.data) ? res.data : [];
    const item = list.find((c) => String(c.id) === String(id)) || list[0] || null;
    return { detail: item, storeInfoList: [] };
  });
}

/** 领取优惠券 */
export function claimCoupon(couponId) {
  return requestJson({
    url: `${config.apiBaseURL}/coupons/${couponId}/claim`,
    method: 'POST',
    header: {
      ...buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
}

/** 获取优惠券适用商品列表 (#21) */
export function fetchCouponGoods(couponId, page = 1, pageSize = 20) {
  return requestJson({
    url: `${config.apiBaseURL}/coupons/${couponId}/goods?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
  }).then((res) => {
    const data = (res && res.data) || {};
    return {
      isGlobal: !!data.isGlobal,
      categoryNames: Array.isArray(data.categoryNames) ? data.categoryNames : [],
      list: Array.isArray(data.list) ? data.list.map((item) => ({
        spuId: item.id,
        thumb: item.primary_image || '',
        title: item.title || '',
        price: item.min_sale_price || 0,
        originPrice: item.max_line_price || 0,
        tags: Array.isArray(item.tags) ? item.tags : [],
      })) : [],
      total: data.total || 0,
    };
  });
}
