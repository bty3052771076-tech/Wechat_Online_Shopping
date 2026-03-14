const { IMAGE_SCENES, normalizeImageUrl } = require('./image-helpers');

function toSafeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function toSafeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeCouponDialogStoreId(value) {
  return toSafeString(value).trim();
}

function normalizeCreateTime(value, formatTime) {
  if (!value) {
    return '';
  }

  if (/^\d+$/.test(String(value))) {
    return formatTime(parseFloat(`${value}`), 'YYYY-MM-DD HH:mm');
  }

  return toSafeString(value);
}

function composeAddress(logistics = {}) {
  return [
    logistics.receiverProvince,
    logistics.receiverCity,
    logistics.receiverCountry,
    logistics.receiverArea,
    logistics.receiverAddress,
  ]
    .map((item) => toSafeString(item).trim())
    .filter(Boolean)
    .join(' ');
}

function buildAfterServiceDetailViewModel(
  serviceRaw = {},
  { formatTime, getStatusIcon, serviceTypeDesc = {}, refundedStatus } = {},
) {
  const rights = serviceRaw.rights || {};
  const rightsItem = Array.isArray(serviceRaw.rightsItem) ? serviceRaw.rightsItem : [];
  const refundMethodList = Array.isArray(serviceRaw.refundMethodList) ? serviceRaw.refundMethodList : [];
  const rightsRefund = serviceRaw.rightsRefund || {};
  const logisticsVO = serviceRaw.logisticsVO || {};
  const proofs = Array.isArray(rights.rightsImageUrls)
    ? rights.rightsImageUrls
        .map((item) => normalizeImageUrl(item, IMAGE_SCENES.comment))
        .filter(Boolean)
    : [];

  return {
    id: toSafeString(rights.rightsNo),
    serviceNo: toSafeString(rights.rightsNo),
    storeName: toSafeString(rights.storeName),
    type: rights.rightsType,
    typeDesc: serviceTypeDesc[rights.rightsType] || '',
    status: rights.rightsStatus,
    statusIcon: toSafeString((typeof getStatusIcon === 'function' ? getStatusIcon(rights) : '') || ''),
    statusName: toSafeString(rights.userRightsStatusName),
    statusDesc: toSafeString(rights.userRightsStatusDesc),
    amount: toSafeAmount(rights.refundRequestAmount),
    goodsList: rightsItem.map((item, index) => ({
      id: index,
      thumb: normalizeImageUrl(item && item.goodsPictureUrl, IMAGE_SCENES.product),
      title: toSafeString(item && item.goodsName),
      specs: Array.isArray(item && item.specInfo)
        ? item.specInfo.map((spec) => toSafeString(spec && (spec.specValues || spec.specValue)))
        : [],
      itemRefundAmount: toSafeAmount(item && item.itemRefundAmount),
      rightsQuantity: toSafeAmount(item && item.rightsQuantity),
    })),
    orderNo: toSafeString(rights.orderNo),
    rightsNo: toSafeString(rights.rightsNo),
    rightsReasonDesc: toSafeString(rights.rightsReasonDesc),
    isRefunded: rights.userRightsStatus === refundedStatus,
    refundMethodList: refundMethodList.map((item) => ({
      name: toSafeString(item && item.refundMethodName),
      amount: toSafeAmount(item && item.refundMethodAmount),
    })),
    refundRequestAmount: toSafeAmount(rights.refundRequestAmount),
    payTraceNo: toSafeString(rightsRefund.traceNo),
    createTime: normalizeCreateTime(rights.createTime, formatTime || ((input) => toSafeString(input))),
    logisticsNo: toSafeString(logisticsVO.logisticsNo),
    logisticsCompanyName: toSafeString(logisticsVO.logisticsCompanyName),
    logisticsCompanyCode: toSafeString(logisticsVO.logisticsCompanyCode),
    remark: toSafeString(logisticsVO.remark),
    receiverName: toSafeString(logisticsVO.receiverName),
    receiverPhone: toSafeString(logisticsVO.receiverPhone),
    receiverAddress: composeAddress(logisticsVO),
    applyRemark: toSafeString(rightsRefund.refundDesc),
    buttons: Array.isArray(serviceRaw.buttonVOs)
      ? serviceRaw.buttonVOs.map((button) => ({
          ...button,
          openType: button && button.openType ? String(button.openType) : '',
        }))
      : [],
    logistics: logisticsVO,
    proofs,
  };
}

module.exports = {
  normalizeCouponDialogStoreId,
  buildAfterServiceDetailViewModel,
};
