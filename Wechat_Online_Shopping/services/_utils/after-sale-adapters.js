const { normalizeFenAmount, parseSpecInfo } = require('./shop-adapters');

function toLegacyTimestamp(value) {
  if (!value) {
    return '';
  }

  if (/^\d+$/.test(String(value))) {
    return String(value);
  }

  const timestamp = new Date(String(value).replace(/-/g, '/')).getTime();
  return Number.isFinite(timestamp) ? String(timestamp) : '';
}

function buildLegacyGoodsItem(item = {}) {
  const rawSpecs = Array.isArray(item.specInfo)
    ? item.specInfo.map((spec) => ({
        specTitle: spec.specTitle || spec.key || 'spec',
        specValues: spec.specValues || spec.specValue || spec.value || '',
      }))
    : parseSpecInfo(item.specInfo).map((spec) => ({
        specTitle: spec.specTitle,
        specValues: spec.specValue,
      }));

  return {
    actualPrice: normalizeFenAmount(item.itemRefundAmount || item.actualPrice || 0),
    goodsName: item.goodsName || '',
    goodsPictureUrl: item.goodsPictureUrl || item.goodsImage || '',
    itemRefundAmount: normalizeFenAmount(item.itemRefundAmount || 0),
    rightsQuantity: Number(item.rightsQuantity || 1),
    skuId: item.skuId,
    spuId: item.spuId,
    specInfo: rawSpecs,
  };
}

function buildLegacyRightsRecord(record = {}) {
  const goodsItems = Array.isArray(record.goodsItems) ? record.goodsItems : [];
  const logisticsVO = record.logisticsVO || {};

  return {
    buttonVOs: Array.isArray(record.buttonVOs) ? record.buttonVOs : [],
    saasId: 'local-backend',
    storeId: record.storeId || 'default-store',
    uid: String(record.userId || ''),
    createTime: toLegacyTimestamp(record.createTime),
    refundMethodList: Array.isArray(record.refundMethodList) ? record.refundMethodList : [],
    rights: {
      bizRightsStatus: 1,
      bizRightsStatusName: '售后服务',
      createTime: toLegacyTimestamp(record.createTime),
      orderNo: record.orderNo || '',
      refundAmount: normalizeFenAmount(record.refundAmount || 0),
      refundRequestAmount: normalizeFenAmount(record.refundRequestAmount || record.refundAmount || 0),
      rightsMethod: 1,
      rightsNo: record.rightsNo || record.id || '',
      rightsParentNo: record.orderNo || '',
      rightsReasonDesc: record.rightsReasonDesc || '',
      rightsReasonType: Number(record.rightsReasonType || 0),
      rightsStatus: Number(record.rightsStatus || 0),
      rightsStatusName: record.rightsStatusName || '',
      rightsType: Number(record.rightsType || 20),
      saasId: 0,
      shippingFee: 0,
      shippingFeeBear: 1,
      storeId: record.storeId || 'default-store',
      storeName: record.storeName || '默认店铺',
      uid: String(record.userId || ''),
      updateTime: toLegacyTimestamp(record.createTime),
      userRightsStatus: Number(record.userRightsStatus || 0),
      userRightsStatusDesc: record.userRightsStatusDesc || '',
      userRightsStatusName: record.userRightsStatusName || '',
      afterSaleRequireType: record.afterSaleRequireType || 'REFUND_MONEY',
      rightsImageUrls: Array.isArray(record.rightsImageUrls) ? record.rightsImageUrls : [],
    },
    rightsItem: goodsItems.map(buildLegacyGoodsItem),
    rightsRefund: {
      callbackTime: record.createTime || '',
      channel: '微信支付',
      channelTrxNo: (record.rightsRefund && record.rightsRefund.traceNo) || '',
      createTime: toLegacyTimestamp(record.createTime),
      memo: record.refundMemo || '',
      refundAmount: normalizeFenAmount(record.refundAmount || 0),
      refundStatus: 1,
      requestTime: toLegacyTimestamp(record.createTime),
      successTime: toLegacyTimestamp(record.createTime),
      traceNo: (record.rightsRefund && record.rightsRefund.traceNo) || '',
      updateTime: toLegacyTimestamp(record.createTime),
      refundDesc:
        (record.rightsRefund && record.rightsRefund.refundDesc) || record.refundMemo || record.rightsReasonDesc || '',
    },
    logisticsVO: {
      logisticsType: 1,
      logisticsNo: logisticsVO.logisticsNo || '',
      logisticsStatus: logisticsVO.logisticsStatus || null,
      logisticsCompanyCode: logisticsVO.logisticsCompanyCode || '',
      logisticsCompanyName: logisticsVO.logisticsCompanyName || '',
      receiverAddressId: '',
      provinceCode: '',
      cityCode: '',
      countryCode: '',
      receiverProvince: logisticsVO.receiverProvince || '',
      receiverCity: logisticsVO.receiverCity || '',
      receiverCountry: logisticsVO.receiverCountry || '',
      receiverArea: logisticsVO.receiverArea || '',
      receiverAddress: logisticsVO.receiverAddress || '',
      receiverPostCode: '',
      receiverLongitude: '',
      receiverLatitude: '',
      receiverIdentity: '',
      receiverPhone: logisticsVO.receiverPhone || '',
      receiverName: logisticsVO.receiverName || '',
      expectArrivalTime: null,
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      sendTime: null,
      arrivalTime: null,
      remark: logisticsVO.remark || '',
      nodes: Array.isArray(logisticsVO.nodes) ? logisticsVO.nodes : [],
    },
  };
}

function adaptRightsListResponse(response = {}) {
  const payload = response && response.data ? response.data : {};
  const list = Array.isArray(payload.list) ? payload.list : [];
  const pagination = payload.pagination || {};

  return {
    code: response.code || 'Success',
    msg: response.msg || '',
    data: {
      pageNum: Number(pagination.page || 1),
      pageSize: Number(pagination.pageSize || list.length || 10),
      totalCount: Number(pagination.total || list.length),
      states: payload.states || {
        audit: 0,
        approved: 0,
        complete: 0,
        closed: 0,
      },
      dataList: list.map(buildLegacyRightsRecord),
    },
  };
}

function adaptRightsDetailResponse(response = {}) {
  const payload = response && response.data ? response.data : {};

  return {
    code: response.code || 'Success',
    msg: response.msg || '',
    data: payload && Object.keys(payload).length > 0 ? [buildLegacyRightsRecord(payload)] : [],
  };
}

function buildAfterSalePreviewResponse(response = {}) {
  const payload = response && response.data ? response.data : {};
  const goodsInfo = payload.goodsInfo || {};

  return {
    code: response.code || 'Success',
    msg: response.msg || '',
    data: {
      ...payload,
      goodsInfo: {
        goodsName: goodsInfo.goodsName || '',
        skuImage: goodsInfo.skuImage || '',
        specInfo: parseSpecInfo(goodsInfo.specInfo),
      },
    },
  };
}

function buildAfterSaleApplyPayload(payload = {}) {
  const rights = payload.rights || {};
  const items = Array.isArray(payload.rightsItem) ? payload.rightsItem : [];

  return {
    orderNo: rights.orderNo || '',
    refundRequestAmount: normalizeFenAmount(rights.refundRequestAmount || 0),
    rightsImageUrls: Array.isArray(rights.rightsImageUrls) ? rights.rightsImageUrls : [],
    rightsReasonDesc: rights.rightsReasonDesc || '',
    rightsReasonType: Number(rights.rightsReasonType || 0),
    rightsType: Number(rights.rightsType || 20),
    refundMemo: payload.refundMemo || '',
    items: items.map((item) => ({
      itemTotalAmount: normalizeFenAmount(item.itemTotalAmount || 0),
      rightsQuantity: Number(item.rightsQuantity || 1),
      skuId: item.skuId,
      spuId: item.spuId,
    })),
  };
}

function buildAfterSaleLogisticsPayload(payload = {}) {
  return {
    logisticsCompanyCode: payload.logisticsCompanyCode || '',
    logisticsCompanyName: payload.logisticsCompanyName || '',
    logisticsNo: payload.logisticsNo || '',
    remark: payload.remark || '',
  };
}

function buildAfterSaleReasonResponse(response = {}) {
  const payload = response && response.data ? response.data : {};

  return {
    code: response.code || 'Success',
    msg: response.msg || '',
    data: {
      rightsReasonList: Array.isArray(payload.rightsReasonList) ? payload.rightsReasonList : [],
    },
  };
}

module.exports = {
  adaptRightsListResponse,
  adaptRightsDetailResponse,
  buildAfterSaleApplyPayload,
  buildAfterSaleLogisticsPayload,
  buildAfterSalePreviewResponse,
  buildAfterSaleReasonResponse,
  toLegacyTimestamp,
};
