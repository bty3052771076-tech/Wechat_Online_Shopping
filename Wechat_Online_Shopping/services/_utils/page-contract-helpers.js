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

function toSafeInteger(value, fallback = 0) {
  const amount = Number.parseInt(value, 10);
  return Number.isFinite(amount) ? amount : fallback;
}

function normalizeCouponDialogStoreId(value) {
  return toSafeString(value).trim();
}

function formatCouponDate(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const date = new Date(Number(value));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function resolveCouponPromotionId(coupon = {}) {
  if (coupon.promotionId !== null && coupon.promotionId !== undefined && coupon.promotionId !== '') {
    return coupon.promotionId;
  }

  if (coupon.promotionCode !== null && coupon.promotionCode !== undefined && coupon.promotionCode !== '') {
    return coupon.promotionCode;
  }

  return '';
}

function buildCouponSelectionPayload(coupon = {}, storeId = '') {
  return {
    couponId: coupon.couponId !== undefined ? coupon.couponId : coupon.key,
    promotionId: resolveCouponPromotionId(coupon),
    storeId: normalizeCouponDialogStoreId(storeId || coupon.storeId),
    status: coupon.status || 'default',
    type: coupon.type,
    value: coupon.value,
    title: toSafeString(coupon.title || coupon.name),
    desc: toSafeString(coupon.desc || coupon.condition),
  };
}

function buildCouponDialogData(data = {}, storeId = '') {
  const { couponResultList = [], reduce = 0 } = data;
  const normalizedStoreId = normalizeCouponDialogStoreId(storeId);
  const couponsList = Array.isArray(couponResultList)
    ? couponResultList
        .map((coupon) => {
          const couponVO = coupon && coupon.couponVO ? coupon.couponVO : {};
          const couponId = couponVO.couponId;
          const type = couponVO.type;
          const value = type === 2 ? toSafeAmount(couponVO.value) / 100 : toSafeAmount(couponVO.value) / 10;

          if (couponId === null || couponId === undefined) {
            return null;
          }

          return {
            key: couponId,
            couponId,
            promotionId: resolveCouponPromotionId(couponVO),
            storeId: normalizedStoreId,
            title: toSafeString(couponVO.name),
            isSelected: coupon && coupon.status === 1,
            timeLimit: `${formatCouponDate(couponVO.startTime)}-${formatCouponDate(couponVO.endTime)}`,
            value,
            status: coupon && coupon.status === -1 ? 'useless' : 'default',
            desc: toSafeString(couponVO.condition),
            type,
            tag: '',
          };
        })
        .filter(Boolean)
    : [];
  const selectedList = couponsList
    .filter((coupon) => coupon.isSelected)
    .map((coupon) => buildCouponSelectionPayload(coupon, normalizedStoreId));

  return {
    couponsList,
    selectedList,
    reduce: toSafeAmount(reduce),
    selectedNum: selectedList.length,
  };
}

function buildOrderConfirmCouponDialogState({ storeId = '', orderCardList = [], submitCouponList = [] } = {}) {
  const fallbackStoreId =
    normalizeCouponDialogStoreId(storeId) ||
    normalizeCouponDialogStoreId(
      (orderCardList[0] && (orderCardList[0].storeId || orderCardList[0].id)) ||
        (submitCouponList[0] && submitCouponList[0].storeId),
    );
  const currentOrderCard = Array.isArray(orderCardList)
    ? orderCardList.find(
        (card) => normalizeCouponDialogStoreId(card && (card.storeId || card.id)) === fallbackStoreId,
      )
    : null;
  const currentStoreCoupon = Array.isArray(submitCouponList)
    ? submitCouponList.find((coupon) => normalizeCouponDialogStoreId(coupon && coupon.storeId) === fallbackStoreId)
    : null;

  return {
    currentStoreId: fallbackStoreId,
    promotionGoodsList:
      currentOrderCard && Array.isArray(currentOrderCard.goodsList) ? currentOrderCard.goodsList : [],
    couponList: currentStoreCoupon && Array.isArray(currentStoreCoupon.couponList) ? currentStoreCoupon.couponList : [],
  };
}

function shouldUseCouponDialogMockData(selectedCoupons = []) {
  return Array.isArray(selectedCoupons) && selectedCoupons.length > 0;
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

function createEmptyAfterServiceDetailViewModel() {
  return {
    id: '',
    serviceNo: '',
    storeName: '',
    type: null,
    typeDesc: '',
    status: null,
    statusIcon: '',
    statusName: '',
    statusDesc: '',
    amount: 0,
    goodsList: [],
    orderNo: '',
    rightsNo: '',
    rightsReasonDesc: '',
    isRefunded: false,
    refundMethodList: [],
    refundRequestAmount: 0,
    payTraceNo: '',
    createTime: '',
    logisticsNo: '',
    logisticsCompanyName: '',
    logisticsCompanyCode: '',
    remark: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    applyRemark: '',
    buttons: [],
    logistics: {},
    proofs: [],
  };
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
    ...createEmptyAfterServiceDetailViewModel(),
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

function buildAfterSaleSubmitPayload({ query = {}, serviceType = null, serviceFrom = {}, goodsInfo = {} } = {}) {
  const applyReason = serviceFrom.applyReason || {};
  const amount = serviceFrom.amount || {};
  const returnNum = toSafeInteger(serviceFrom.returnNum, 1);

  return {
    rights: {
      orderNo: toSafeString(query.orderNo),
      refundRequestAmount: toSafeAmount(amount.current),
      rightsImageUrls: Array.isArray(serviceFrom.rightsImageUrls) ? serviceFrom.rightsImageUrls : [],
      rightsReasonDesc: toSafeString(applyReason.desc),
      rightsReasonType: toSafeInteger(applyReason.type),
      rightsType: serviceType,
    },
    rightsItem: [
      {
        itemTotalAmount: toSafeAmount(goodsInfo.paidAmountEach) * returnNum,
        rightsQuantity: returnNum,
        skuId: toSafeString(query.skuId),
        spuId: toSafeString(query.spuId),
      },
    ],
    refundMemo: toSafeString(serviceFrom.remark),
  };
}

module.exports = {
  normalizeCouponDialogStoreId,
  buildCouponDialogData,
  buildCouponSelectionPayload,
  buildOrderConfirmCouponDialogState,
  shouldUseCouponDialogMockData,
  createEmptyAfterServiceDetailViewModel,
  buildAfterSaleSubmitPayload,
  buildAfterServiceDetailViewModel,
};
