const { normalizeUserInfo } = require('./auth');

const DEFAULT_CUSTOMER_SERVICE_INFO = {
  servicePhone: '400-800-1234',
  serviceTimeDuration: '周一至周日 09:00-18:00',
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getOrderCount(orderCounts = [], tabType) {
  const matched = orderCounts.find((item) => Number(item && item.tabType) === Number(tabType));
  return matched ? toNumber(matched.orderNum, 0) : 0;
}

function buildUserCenterPayload({ profile = {}, orderCounts = [], afterSaleCount = 0 } = {}) {
  return {
    userInfo: normalizeUserInfo(profile),
    countsData: [
      { num: 0, name: '积分', type: 'point' },
      { num: 0, name: '优惠券', type: 'coupon' },
    ],
    orderTagInfos: [
      { orderNum: getOrderCount(orderCounts, 5), tabType: 5 },
      { orderNum: getOrderCount(orderCounts, 10), tabType: 10 },
      { orderNum: getOrderCount(orderCounts, 40), tabType: 40 },
      { orderNum: getOrderCount(orderCounts, 60), tabType: 60 },
      { orderNum: toNumber(afterSaleCount, 0), tabType: 0 },
    ],
    customerServiceInfo: { ...DEFAULT_CUSTOMER_SERVICE_INFO },
  };
}

function buildPersonProfile({ profile = {}, addresses = [] } = {}) {
  const userInfo = normalizeUserInfo(profile);
  const firstAddress = Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : null;

  return {
    avatarUrl: userInfo.avatarUrl || '',
    nickName: userInfo.nickName || '',
    phoneNumber: userInfo.phoneNumber || '',
    gender: toNumber(profile.gender, 0),
    address: firstAddress
      ? {
          provinceName: firstAddress.province_name || firstAddress.provinceName || '',
          provinceCode: firstAddress.province_code || firstAddress.provinceCode || '',
          cityName: firstAddress.city_name || firstAddress.cityName || '',
          cityCode: firstAddress.city_code || firstAddress.cityCode || '',
        }
      : undefined,
  };
}

module.exports = {
  DEFAULT_CUSTOMER_SERVICE_INFO,
  buildUserCenterPayload,
  buildPersonProfile,
};
