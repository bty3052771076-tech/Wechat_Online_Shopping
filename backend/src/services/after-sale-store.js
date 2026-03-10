const { readJson, writeJson } = require('./json-store');

const AFTER_SALE_FILE = 'after-sales.json';

const LOGISTICS_COMPANIES = [
  { name: '中通快递', code: '0001' },
  { name: '申通快递', code: '0002' },
  { name: '圆通快递', code: '0003' },
  { name: '顺丰速运', code: 'SF' },
  { name: '百世快递', code: '0005' },
];

const DEFAULT_AFTER_SALES = [
  {
    rightsNo: 'AS20260303001',
    orderNo: 'ORDER20260303001',
    userId: 1,
    userName: '测试用户',
    storeId: 'default-store',
    storeName: '默认店铺',
    rightsType: 10,
    rightsReasonType: 2,
    rightsReasonDesc: '商品有划痕',
    refundAmount: 29900,
    refundRequestAmount: 29900,
    rightsStatus: 10,
    createTime: '2026-03-03 11:00:00',
    refundMemo: '收到商品后发现有划痕',
    rightsImageUrls: ['https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png'],
    goodsItems: [
      {
        skuId: 1,
        spuId: 1,
        goodsName: '不锈钢刀叉勺套装',
        goodsPictureUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
        specInfo: [{ specTitle: '规格', specValues: '四件套' }],
        itemRefundAmount: 29900,
        rightsQuantity: 1,
      },
    ],
    logisticsVO: {
      logisticsType: 1,
      logisticsNo: '',
      logisticsStatus: null,
      logisticsCompanyCode: '',
      logisticsCompanyName: '',
      receiverName: '测试用户',
      receiverPhone: '13800138000',
      receiverProvince: '',
      receiverCity: '',
      receiverCountry: '',
      receiverArea: '',
      receiverAddress: '深圳市南山区科技园',
      remark: '',
      nodes: [],
    },
    rightsRefund: {
      traceNo: 'TRACE20260303001',
      refundDesc: '商品有划痕',
      refundAmount: 29900,
    },
    refundMethodList: [{ refundMethodName: '微信支付', refundMethodAmount: 29900 }],
  },
  {
    rightsNo: 'AS20260302002',
    orderNo: 'ORDER20260302002',
    userId: 2,
    userName: '张三',
    storeId: 'default-store',
    storeName: '默认店铺',
    rightsType: 20,
    rightsReasonType: 2,
    rightsReasonDesc: '不想要了',
    refundAmount: 19800,
    refundRequestAmount: 19800,
    rightsStatus: 50,
    createTime: '2026-03-02 18:00:00',
    refundMemo: '申请仅退款',
    rightsImageUrls: [],
    goodsItems: [
      {
        skuId: 2,
        spuId: 2,
        goodsName: '白色短袖连衣裙',
        goodsPictureUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png',
        specInfo: [{ specTitle: '颜色', specValues: '白色' }],
        itemRefundAmount: 19800,
        rightsQuantity: 1,
      },
    ],
    logisticsVO: {
      logisticsType: 1,
      logisticsNo: '',
      logisticsStatus: null,
      logisticsCompanyCode: '',
      logisticsCompanyName: '',
      receiverName: '张三',
      receiverPhone: '13900139000',
      receiverProvince: '',
      receiverCity: '',
      receiverCountry: '',
      receiverArea: '',
      receiverAddress: '北京市朝阳区测试路 1 号',
      remark: '',
      nodes: [],
    },
    rightsRefund: {
      traceNo: 'TRACE20260302002',
      refundDesc: '退款成功',
      refundAmount: 19800,
    },
    refundMethodList: [{ refundMethodName: '微信支付', refundMethodAmount: 19800 }],
  },
];

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function buildStatusMeta(record = {}) {
  const hasLogistics = Boolean(record.logisticsVO && record.logisticsVO.logisticsNo);

  switch (parseNumber(record.rightsStatus)) {
    case 10:
      return {
        rightsStatusName: '待审核',
        userRightsStatus: 100,
        userRightsStatusName: '待商家审核',
        userRightsStatusDesc: '商家将在 24 小时内审核，请耐心等待',
      };
    case 20:
      return hasLogistics
        ? {
            rightsStatusName: '已审核',
            userRightsStatus: 130,
            userRightsStatusName: '待商家收货',
            userRightsStatusDesc: '退货商品已寄回，商家确认收货后将为您退款',
          }
        : {
            rightsStatusName: '已审核',
            userRightsStatus: 120,
            userRightsStatusName: '等待买家寄回商品',
            userRightsStatusDesc: '商家已审核通过，请尽快填写退货物流信息',
          };
    case 30:
      return {
        rightsStatusName: '已收货',
        userRightsStatus: 140,
        userRightsStatusName: '商家已收货',
        userRightsStatusDesc: '商家已收到退货商品，正在处理退款',
      };
    case 50:
      return {
        rightsStatusName: '已完成',
        userRightsStatus: 160,
        userRightsStatusName: '已退款',
        userRightsStatusDesc: '退款已原路返回，请注意查收',
      };
    case 60:
    default:
      return {
        rightsStatusName: '已关闭',
        userRightsStatus: 170,
        userRightsStatusName: '已关闭',
        userRightsStatusDesc: '售后申请已关闭',
      };
  }
}

function buildButtonVOs(record = {}) {
  const hasLogistics = Boolean(record.logisticsVO && record.logisticsVO.logisticsNo);
  const status = parseNumber(record.rightsStatus);

  if (status === 10) {
    return [{ name: '撤销申请', primary: false, type: 2 }];
  }

  if (status === 20 && hasLogistics) {
    return [
      { name: '修改运单号', primary: false, type: 4 },
      { name: '查看物流', primary: false, type: 5 },
    ];
  }

  if (status === 20) {
    return [{ name: '填写运单号', primary: false, type: 3 }];
  }

  if ((status === 30 || status === 50) && hasLogistics) {
    return [{ name: '查看物流', primary: false, type: 5 }];
  }

  return [];
}

function hydrateRecord(record = {}) {
  const rightsType = parseNumber(record.rightsType, 20);
  const typeName =
    rightsType === 10 ? '退货退款' : rightsType === 30 ? '支付后取消' : '仅退款';
  const afterSaleRequireType = rightsType === 10 ? 'REFUND_GOODS_MONEY' : 'REFUND_MONEY';
  const logisticsVO = {
    logisticsType: 1,
    logisticsNo: '',
    logisticsStatus: null,
    logisticsCompanyCode: '',
    logisticsCompanyName: '',
    receiverName: '',
    receiverPhone: '',
    receiverProvince: '',
    receiverCity: '',
    receiverCountry: '',
    receiverArea: '',
    receiverAddress: '',
    remark: '',
    nodes: [],
    ...(record.logisticsVO || {}),
  };
  const goodsItems = Array.isArray(record.goodsItems) ? record.goodsItems : [];
  const refundAmount = parseNumber(record.refundAmount, parseNumber(record.refundRequestAmount));
  const refundRequestAmount = parseNumber(record.refundRequestAmount, refundAmount);
  const rightsNo = record.rightsNo || record.id || '';
  const statusMeta = buildStatusMeta({ ...record, logisticsVO });

  return {
    ...record,
    id: rightsNo,
    rightsNo,
    typeName,
    afterSaleRequireType,
    refundAmount,
    refundRequestAmount,
    goodsName: record.goodsName || (goodsItems[0] && goodsItems[0].goodsName) || '',
    goodsImage: record.goodsImage || (goodsItems[0] && goodsItems[0].goodsPictureUrl) || '',
    logisticsVO,
    goodsItems,
    buttonVOs: buildButtonVOs({ ...record, logisticsVO }),
    refundMethodList: Array.isArray(record.refundMethodList)
      ? record.refundMethodList
      : [{ refundMethodName: '微信支付', refundMethodAmount: refundAmount }],
    rightsRefund: {
      traceNo: '',
      refundDesc: record.refundMemo || record.rightsReasonDesc || '',
      refundAmount,
      ...(record.rightsRefund || {}),
    },
    ...statusMeta,
  };
}

function getAfterSales() {
  const list = readJson(AFTER_SALE_FILE, DEFAULT_AFTER_SALES);
  return Array.isArray(list) ? list.map((item) => hydrateRecord(item)) : [];
}

function saveAfterSales(list) {
  return writeJson(AFTER_SALE_FILE, list.map((item) => hydrateRecord(item)));
}

function listAfterSales({ userId, status } = {}) {
  let list = getAfterSales();

  if (userId !== undefined) {
    list = list.filter((item) => String(item.userId) === String(userId));
  }

  if (status !== undefined && status !== null && status !== '') {
    list = list.filter((item) => parseNumber(item.rightsStatus) === parseNumber(status));
  }

  return list.sort((left, right) => String(right.createTime).localeCompare(String(left.createTime)));
}

function findAfterSale(rightsNo, userId) {
  const record = getAfterSales().find((item) => item.rightsNo === rightsNo);

  if (!record) {
    return null;
  }

  if (userId !== undefined && String(record.userId) !== String(userId)) {
    return null;
  }

  return record;
}

function buildStates(list = []) {
  return {
    audit: list.filter((item) => parseNumber(item.rightsStatus) === 10).length,
    approved: list.filter((item) => parseNumber(item.rightsStatus) === 20).length,
    complete: list.filter((item) => parseNumber(item.rightsStatus) === 50).length,
    closed: list.filter((item) => parseNumber(item.rightsStatus) === 60).length,
  };
}

function updateAfterSale(rightsNo, updater) {
  const list = getAfterSales();
  const index = list.findIndex((item) => item.rightsNo === rightsNo);

  if (index < 0) {
    return null;
  }

  const nextRecord =
    typeof updater === 'function'
      ? updater(hydrateRecord(list[index]))
      : { ...hydrateRecord(list[index]), ...updater };

  list[index] = hydrateRecord(nextRecord);
  saveAfterSales(list);
  return list[index];
}

function createAfterSale(record) {
  const list = getAfterSales();
  const nextRecord = hydrateRecord(record);
  list.unshift(nextRecord);
  saveAfterSales(list);
  return nextRecord;
}

function createRightsNo() {
  return `AS${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getLogisticsCompanies() {
  return LOGISTICS_COMPANIES.slice();
}

module.exports = {
  buildStates,
  createAfterSale,
  createRightsNo,
  findAfterSale,
  formatDateTime,
  getLogisticsCompanies,
  hydrateRecord,
  listAfterSales,
  updateAfterSale,
};
