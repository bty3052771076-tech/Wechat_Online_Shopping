const DEFAULT_STORE_ID = 'default-store';
const DEFAULT_STORE_NAME = '\u9ed8\u8ba4\u5e97\u94fa';
const { normalizeImageUrl } = require('./image-helpers');
const BACKEND_TO_LEGACY_ORDER_STATUS = {
  1: 5,
  2: 10,
  3: 40,
  4: 60,
  5: 50,
  6: 80,
};
const LEGACY_TO_BACKEND_ORDER_STATUS = {
  5: 1,
  10: 2,
  40: 3,
  60: 4,
  50: 5,
  80: 6,
};

function toSafeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toFenFromYuan(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return Math.round(toNumber(value, 0) * 100);
}

function normalizeFenAmount(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const raw = toSafeString(value).trim();

  if (!raw) {
    return 0;
  }

  if (raw.indexOf('.') >= 0) {
    return toFenFromYuan(raw);
  }

  return Math.round(toNumber(raw, 0));
}

function formatSpecEntry(title, value) {
  return {
    specTitle: toSafeString(title),
    specValue: toSafeString(value),
  };
}

function parseSpecInfo(specs) {
  if (!specs) {
    return [];
  }

  if (Array.isArray(specs)) {
    return specs
      .map((item) => {
        if (!item) {
          return null;
        }

        if (typeof item === 'string') {
          return formatSpecEntry('spec', item);
        }

        return formatSpecEntry(
          item.specTitle || item.title || item.name || item.key || 'spec',
          item.specValue || item.value || item.label || item.text || '',
        );
      })
      .filter(Boolean);
  }

  if (typeof specs === 'string') {
    try {
      return parseSpecInfo(JSON.parse(specs));
    } catch (error) {
      return [formatSpecEntry('spec', specs)];
    }
  }

  if (typeof specs === 'object') {
    return Object.keys(specs).map((key) => formatSpecEntry(key, specs[key]));
  }

  return [];
}

function adaptCartItem(item) {
  const sku = item && item.sku ? item.sku : {};
  const spu = sku && sku.spu ? sku.spu : {};
  const price = toFenFromYuan(sku.price);
  const originPrice = toFenFromYuan(sku.line_price || sku.price);

  return {
    cartId: item.id,
    id: item.id,
    extKey: `cart-${item.id}`,
    storeId: DEFAULT_STORE_ID,
    storeName: DEFAULT_STORE_NAME,
    spuId: toSafeString(item.spu_id || spu.id),
    skuId: toSafeString(item.sku_id || sku.id),
    isSelected: item.is_checked === 1 ? 1 : 0,
    thumb: normalizeImageUrl(spu.primary_image || ''),
    primaryImage: normalizeImageUrl(spu.primary_image || ''),
    title: spu.title || sku.sku_name || '',
    quantity: toNumber(item.quantity, 1),
    stockStatus: toNumber(sku.stock, 0) > 0,
    stockQuantity: toNumber(sku.stock, 0),
    price,
    originPrice,
    tagPrice: null,
    titlePrefixTags: null,
    roomId: null,
    specInfo: parseSpecInfo(sku.specs),
    available: 1,
    putOnSale: 1,
  };
}

function adaptCartListResponse(response) {
  const payload = response && response.data ? response.data : {};
  const items = Array.isArray(payload.items) ? payload.items.map(adaptCartItem) : [];
  const selectedItems = items.filter((item) => item.isSelected === 1 && item.stockQuantity > 0);
  const selectableCount = items.filter((item) => item.stockQuantity > 0).length;
  const totalDiscountAmount = selectedItems.reduce((sum, item) => {
    const discount = Math.max(item.originPrice - item.price, 0);
    return sum + discount * item.quantity;
  }, 0);

  return {
    code: response && response.code ? response.code : 'Success',
    msg: response && response.msg ? response.msg : '',
    data: {
      storeGoods: [
        {
          storeId: DEFAULT_STORE_ID,
          storeName: DEFAULT_STORE_NAME,
          storeStatus: 1,
          totalDiscountSalePrice: totalDiscountAmount,
          promotionGoodsList: [
            {
              title: null,
              promotionCode: 'EMPTY_PROMOTION',
              promotionSubCode: null,
              promotionId: null,
              tagText: null,
              promotionStatus: null,
              tag: null,
              description: null,
              doorSillRemain: null,
              isNeedAddOnShop: 0,
              goodsPromotionList: items,
              lastJoinTime: null,
            },
          ],
          lastJoinTime: null,
          postageFreePromotionVo: null,
          shortageGoodsList: [],
        },
      ],
      invalidGoodItems: [],
      isAllSelected: selectableCount > 0 && selectedItems.length === selectableCount,
      selectedGoodsCount:
        payload.summary && payload.summary.totalQuantity !== undefined
          ? toNumber(payload.summary.totalQuantity, 0)
          : selectedItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount:
        payload.summary && payload.summary.totalAmount !== undefined
          ? toFenFromYuan(payload.summary.totalAmount)
          : selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      totalDiscountAmount,
    },
  };
}

function adaptAddressRecord(address) {
  const id = toSafeString(address && (address.id !== undefined ? address.id : address.addressId));
  const addressTag = address && (address.address_tag || address.addressTag || '');
  const provinceName = address && (address.province_name || address.provinceName || '');
  const cityName = address && (address.city_name || address.cityName || '');
  const districtName = address && (address.district_name || address.districtName || '');
  const detailAddress = address && (address.detail_address || address.detailAddress || '');
  const phone = address && (address.receiver_phone || address.phone || address.phoneNumber || '');
  const name = address && (address.receiver_name || address.name || '');

  return {
    id,
    addressId: id,
    phone,
    phoneNumber: phone,
    name,
    countryName: address && (address.country_name || address.countryName || 'China'),
    countryCode: address && (address.country_code || address.countryCode || 'CHN'),
    provinceName,
    provinceCode: address && (address.province_code || address.provinceCode || ''),
    cityName,
    cityCode: address && (address.city_code || address.cityCode || ''),
    districtName,
    districtCode: address && (address.district_code || address.districtCode || ''),
    detailAddress,
    isDefault: address && (address.is_default === 1 || address.isDefault === 1 || address.isDefault === true) ? 1 : 0,
    addressTag,
    tag: addressTag,
    address: `${provinceName}${cityName}${districtName}${detailAddress}`,
    checked: false,
  };
}

function adaptAddressListResponse(response) {
  const addresses = response && Array.isArray(response.data) ? response.data : [];
  return addresses.map(adaptAddressRecord);
}

function isDefaultAddress(address) {
  return Boolean(
    address &&
      (address.is_default === 1 ||
        address.is_default === true ||
        address.isDefault === 1 ||
        address.isDefault === true),
  );
}

function pickDefaultAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }

  return addresses.find(isDefaultAddress) || addresses[0] || null;
}

function buildAddressPayload(locationState) {
  return {
    receiverName: toSafeString(locationState.name).trim(),
    receiverPhone: toSafeString(locationState.phone).trim(),
    provinceCode: toSafeString(locationState.provinceCode),
    provinceName: toSafeString(locationState.provinceName),
    cityCode: toSafeString(locationState.cityCode),
    cityName: toSafeString(locationState.cityName),
    districtCode: toSafeString(locationState.districtCode),
    districtName: toSafeString(locationState.districtName),
    detailAddress: toSafeString(locationState.detailAddress).trim(),
    isDefault: locationState.isDefault ? 1 : 0,
  };
}

function normalizeOrderGoods(goods) {
  return {
    storeId: toSafeString(goods.storeId || DEFAULT_STORE_ID) || DEFAULT_STORE_ID,
    storeName: toSafeString(goods.storeName || DEFAULT_STORE_NAME) || DEFAULT_STORE_NAME,
    spuId: toSafeString(goods.spuId),
    skuId: toSafeString(goods.skuId),
    goodsName: toSafeString(goods.goodsName || goods.title || goods.productTitle),
    image: normalizeImageUrl(goods.image || goods.primaryImage || goods.thumb || goods.productImage),
    quantity: toNumber(goods.quantity || goods.num || goods.buyQuantity, 0),
    price: normalizeFenAmount(goods.price || goods.settlePrice || goods.payPrice || goods.totalSkuPrice || 0),
    specInfo: parseSpecInfo(goods.specInfo || goods.skuSpecLst || goods.specs),
  };
}

function buildSettleDetailResponse(params) {
  const goodsRequestList = Array.isArray(params && params.goodsRequestList) ? params.goodsRequestList : [];
  const userAddress = params && params.userAddressReq ? adaptAddressRecord(params.userAddressReq) : null;
  const groupedStoreMap = {};
  let totalGoodsCount = 0;
  let totalSalePrice = 0;

  goodsRequestList.map(normalizeOrderGoods).forEach((goods) => {
    totalGoodsCount += goods.quantity;
    totalSalePrice += goods.price * goods.quantity;

    if (!groupedStoreMap[goods.storeId]) {
      groupedStoreMap[goods.storeId] = {
        storeId: goods.storeId,
        storeName: goods.storeName,
        remark: '',
        goodsCount: 0,
        deliveryFee: 0,
        storeTotalAmount: 0,
        storeTotalPayAmount: 0,
        storeTotalDiscountAmount: 0,
        storeTotalCouponAmount: 0,
        skuDetailVos: [],
        couponList: [],
      };
    }

    groupedStoreMap[goods.storeId].goodsCount += goods.quantity;
    groupedStoreMap[goods.storeId].storeTotalAmount += goods.price * goods.quantity;
    groupedStoreMap[goods.storeId].storeTotalPayAmount += goods.price * goods.quantity;
    groupedStoreMap[goods.storeId].skuDetailVos.push({
      storeId: goods.storeId,
      storeName: goods.storeName,
      spuId: goods.spuId,
      skuId: goods.skuId,
      goodsName: goods.goodsName,
      image: goods.image,
      quantity: goods.quantity,
      settlePrice: goods.price,
      tagPrice: null,
      tagText: null,
      skuSpecLst: goods.specInfo,
    });
  });

  return {
    code: 'Success',
    msg: '',
    data: {
      settleType: userAddress ? 1 : 0,
      userAddress,
      totalGoodsCount,
      packageCount: Object.keys(groupedStoreMap).length,
      totalAmount: totalSalePrice,
      totalPayAmount: totalSalePrice,
      totalDiscountAmount: 0,
      totalPromotionAmount: 0,
      totalCouponAmount: 0,
      totalSalePrice,
      totalGoodsAmount: totalSalePrice,
      totalDeliveryFee: 0,
      invoiceRequest: null,
      skuImages: null,
      deliveryFeeList: null,
      storeGoodsList: Object.keys(groupedStoreMap).map((storeId) => groupedStoreMap[storeId]),
      inValidGoodsList: null,
      outOfStockGoodsList: null,
      limitGoodsList: null,
      abnormalDeliveryGoodsList: null,
      invoiceSupport: 0,
    },
  };
}

function buildCreateOrderPayload(params) {
  const userAddress = params && params.userAddressReq ? params.userAddressReq : {};
  const remarks = Array.isArray(params && params.storeInfoList)
    ? params.storeInfoList.map((store) => toSafeString(store.remark).trim()).filter(Boolean)
    : [];

  const payload = {
    addressId: toSafeString(userAddress.addressId || userAddress.id),
    deliveryFee: 0,
    items: (Array.isArray(params && params.goodsRequestList) ? params.goodsRequestList : [])
      .map((goods) => ({
        skuId: toSafeString(goods.skuId),
        quantity: toNumber(goods.quantity || goods.num || goods.buyQuantity, 0),
      }))
      .filter((item) => item.skuId && item.quantity > 0),
  };

  if (remarks.length > 0) {
    payload.remark = remarks.join('; ');
  }

  return payload;
}

function adaptOrderSubmitResponse(response) {
  const order = response && response.data ? response.data : {};

  return {
    code: response && response.code ? response.code : 'Success',
    msg: response && response.msg ? response.msg : '',
    data: {
      isSuccess: true,
      tradeNo: order.order_no || order.orderNo || toSafeString(order.id),
      payInfo: '{}',
      code: null,
      transactionId: order.id ? `ORDER-${order.id}` : '',
      msg: null,
      interactId: toSafeString(order.id || ''),
      channel: 'order_submit',
      limitGoodsList: null,
    },
  };
}

function normalizeTimestamp(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const asNumber = Number(value);

  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber;
  }

  const asDate = new Date(value).getTime();
  return Number.isFinite(asDate) ? asDate : null;
}

function mapBackendOrderStatus(status) {
  return BACKEND_TO_LEGACY_ORDER_STATUS[toNumber(status, 0)] || 80;
}

function mapLegacyOrderStatus(status) {
  return LEGACY_TO_BACKEND_ORDER_STATUS[toNumber(status, 0)];
}

function getOrderStatusName(status) {
  const legacyStatus = mapBackendOrderStatus(status);

  switch (legacyStatus) {
    case 5:
      return '\u5f85\u4ed8\u6b3e';
    case 10:
      return '\u5f85\u53d1\u8d27';
    case 40:
      return '\u5f85\u6536\u8d27';
    case 60:
      return '\u5f85\u8bc4\u4ef7';
    case 50:
      return '\u5df2\u5b8c\u6210';
    case 80:
      return '\u5df2\u53d6\u6d88';
    default:
      return '\u5df2\u53d6\u6d88';
  }
}

function buildOrderButtons(status) {
  const legacyStatus = mapBackendOrderStatus(status);

  switch (legacyStatus) {
    case 5:
      return [
        { primary: false, type: 2, name: '\u53d6\u6d88\u8ba2\u5355' },
        { primary: true, type: 1, name: '\u4ed8\u6b3e' },
      ];
    case 40:
      return [{ primary: true, type: 3, name: '\u786e\u8ba4\u6536\u8d27' }];
    case 60:
      return [{ primary: true, type: 6, name: '\u8bc4\u4ef7' }];
    case 50:
    case 80:
      return [{ primary: true, type: 9, name: '\u518d\u6b21\u8d2d\u4e70' }];
    default:
      return [];
  }
}

function buildLegacyOrderItem(item) {
  return {
    id: toSafeString(item.id),
    orderNo: null,
    spuId: toSafeString(item.spu_id || item.spuId),
    skuId: toSafeString(item.sku_id || item.skuId),
    roomId: null,
    goodsMainType: 0,
    goodsViceType: 0,
    goodsName: toSafeString(item.product_title || item.goodsName),
    goodsPictureUrl: normalizeImageUrl(item.product_image || item.goodsPictureUrl),
    originPrice: normalizeFenAmount(item.line_price || item.originPrice || item.price),
    actualPrice: normalizeFenAmount(item.price || item.actualPrice),
    specifications: parseSpecInfo(item.sku_spec_info || item.specifications),
    buyQuantity: toNumber(item.quantity || item.buyQuantity, 0),
    itemTotalAmount: normalizeFenAmount(item.total_amount || item.itemTotalAmount || item.price),
    itemDiscountAmount: 0,
    itemPaymentAmount: normalizeFenAmount(item.total_amount || item.itemPaymentAmount || item.price),
    goodsPaymentPrice: normalizeFenAmount(item.price || item.goodsPaymentPrice),
    tagPrice: null,
    tagText: null,
    outCode: null,
    labelVOs: null,
    buttonVOs: [],
  };
}

function buildLegacyOrder(order, items) {
  const orderStatus = mapBackendOrderStatus(order.order_status);
  const createdAt = normalizeTimestamp(order.created_at || order.createdAt);
  const paidAt = normalizeTimestamp(order.pay_time || order.updated_at || order.updatedAt);
  const isPaid = toNumber(order.pay_status, 0) === 1;

  return {
    orderId: toSafeString(order.id),
    orderNo: toSafeString(order.order_no || order.orderNo),
    parentOrderNo: toSafeString(order.order_no || order.orderNo),
    storeId: DEFAULT_STORE_ID,
    storeName: DEFAULT_STORE_NAME,
    orderStatus,
    orderSubStatus: null,
    orderStatusName: getOrderStatusName(order.order_status),
    orderStatusRemark: orderStatus === 5 ? '\u8bf7\u5c3d\u5feb\u5b8c\u6210\u652f\u4ed8' : '',
    totalAmount: normalizeFenAmount(order.total_amount),
    goodsAmount: normalizeFenAmount(order.total_amount),
    goodsAmountApp: normalizeFenAmount(order.total_amount),
    paymentAmount: normalizeFenAmount(order.pay_amount),
    freightFee: normalizeFenAmount(order.delivery_fee),
    discountAmount: normalizeFenAmount(order.discount_amount),
    remark: toSafeString(order.order_remark),
    createTime: createdAt,
    orderItemVOs: items,
    logisticsVO: {
      logisticsNo: toSafeString(order.delivery_no),
      logisticsStatus: null,
      logisticsCompanyCode: '',
      logisticsCompanyName: toSafeString(order.delivery_company),
      receiverProvince: '',
      receiverCity: '',
      receiverCountry: '',
      receiverArea: '',
      receiverAddress: toSafeString(order.receiver_address),
      receiverPhone: toSafeString(order.receiver_phone),
      receiverName: toSafeString(order.receiver_name),
    },
    paymentVO: {
      payStatus: isPaid ? 2 : 1,
      amount: normalizeFenAmount(order.pay_amount),
      currency: 'CNY',
      payType: 0,
      payWay: null,
      payWayName: isPaid ? '\u5fae\u4fe1\u652f\u4ed8' : null,
      interactId: null,
      traceNo: null,
      channelTrxNo: null,
      period: null,
      payTime: isPaid ? paidAt : null,
      paySuccessTime: isPaid ? paidAt : null,
    },
    buttonVOs: buildOrderButtons(order.order_status),
    labelVOs: null,
    invoiceVO: null,
    couponAmount: 0,
    autoCancelTime: null,
    logisticsLogVO: null,
    trajectoryVos: [],
    invoiceStatus: 3,
    invoiceDesc: '\u6682\u4e0d\u5f00\u7968',
    invoiceUrl: null,
    groupInfoVo: null,
  };
}

function adaptOrderListResponse(response) {
  const payload = response && response.data ? response.data : {};
  const list = Array.isArray(payload.list) ? payload.list : [];

  return {
    code: response && response.code ? response.code : 'Success',
    msg: response && response.msg ? response.msg : '',
    data: {
      pageNum: payload.pagination ? payload.pagination.page : 1,
      pageSize: payload.pagination ? payload.pagination.pageSize : list.length,
      totalCount: payload.pagination ? payload.pagination.total : list.length,
      orders: list.map((order) =>
        buildLegacyOrder(order, order.previewItem ? [buildLegacyOrderItem(order.previewItem)] : []),
      ),
    },
  };
}

function buildOrderCountsResponse(response) {
  const payload = response && response.data ? response.data : {};
  const list = Array.isArray(payload.list) ? payload.list : [];
  const counterMap = {};

  list.forEach((order) => {
    const legacyStatus = mapBackendOrderStatus(order.order_status);
    counterMap[legacyStatus] = (counterMap[legacyStatus] || 0) + 1;
  });

  return {
    code: response && response.code ? response.code : 'Success',
    msg: response && response.msg ? response.msg : '',
    data: Object.keys(counterMap).map((status) => ({
      tabType: Number(status),
      orderNum: counterMap[status],
    })),
  };
}

function adaptOrderDetailResponse(response) {
  const order = response && response.data ? response.data : {};
  const items = Array.isArray(order.items) ? order.items.map(buildLegacyOrderItem) : [];

  return {
    code: response && response.code ? response.code : 'Success',
    msg: response && response.msg ? response.msg : '',
    data: buildLegacyOrder(order, items),
  };
}

module.exports = {
  DEFAULT_STORE_ID,
  DEFAULT_STORE_NAME,
  parseSpecInfo,
  adaptCartListResponse,
  adaptAddressRecord,
  adaptAddressListResponse,
  pickDefaultAddress,
  buildAddressPayload,
  buildSettleDetailResponse,
  buildCreateOrderPayload,
  adaptOrderSubmitResponse,
  adaptOrderListResponse,
  buildOrderCountsResponse,
  adaptOrderDetailResponse,
  mapLegacyOrderStatus,
  toFenFromYuan,
  normalizeFenAmount,
};
