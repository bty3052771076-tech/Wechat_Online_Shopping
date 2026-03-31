const AfterSale = require('../models/AfterSale');
const { IMAGE_SCENES, normalizeImageUrl } = require('../utils/image');

const LOGISTICS_COMPANIES = [
  { name: '中通快递', code: '0001' },
  { name: '申通快递', code: '0002' },
  { name: '圆通快递', code: '0003' },
  { name: '顺丰速运', code: 'SF' },
  { name: '百世快递', code: '0005' },
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

// DB 行 → 原始 record 结构（供 hydrateRecord 使用）
function dbToRecord(row) {
  const data = row.toJSON ? row.toJSON() : row;
  // DB 存储元为单位，store 内部用分
  const refundFen = Math.round(parseNumber(data.refund_amount, 0) * 100);

  return {
    rightsNo: data.after_sale_no,
    orderNo: data.order_no,
    userId: data.user_id,
    userName: data.user_name || '',
    storeId: 'default-store',
    storeName: '默认店铺',
    // DB type: 1=退款, 2=退货 → rightsType: 20=仅退款, 10=退货退款
    rightsType: data.type === 2 ? 10 : 20,
    rightsReasonDesc: data.reason || '',
    refundAmount: refundFen,
    refundRequestAmount: refundFen,
    rightsStatus: data.rights_status || 10,
    createTime: data.created_at ? formatDateTime(new Date(data.created_at)) : '',
    refundMemo: data.description || '',
    rightsImageUrls: Array.isArray(data.proof_images) ? data.proof_images : [],
    goodsItems: Array.isArray(data.goods_items) ? data.goods_items : [],
    logisticsVO: data.logistics_vo || {},
    rightsRefund: {
      traceNo: `TRACE${data.after_sale_no}`,
      refundDesc: data.description || data.reason || '',
      refundAmount: refundFen,
    },
    refundMethodList: [{ refundMethodName: '微信支付', refundMethodAmount: refundFen }],
  };
}

// 原始 record → DB 字段映射
function recordToDbFields(record) {
  const rightsType = parseNumber(record.rightsType, 20);
  // rightsType 10=退货退款→DB type 2, 其余→DB type 1
  const dbType = rightsType === 10 ? 2 : 1;
  const rightsStatus = parseNumber(record.rightsStatus, 10);
  // rights_status: 10→status 1, 60→status 3, 其余→status 2
  const dbStatus = rightsStatus === 10 ? 1 : rightsStatus === 60 ? 3 : 2;
  // 分 → 元
  const refundAmountYuan = parseNumber(record.refundAmount, 0) / 100;

  return {
    after_sale_no: record.rightsNo,
    order_no: record.orderNo,
    user_id: record.userId,
    user_name: record.userName || null,
    type: dbType,
    reason: record.rightsReasonDesc || null,
    description: record.refundMemo || null,
    proof_images: Array.isArray(record.rightsImageUrls) ? record.rightsImageUrls : null,
    refund_amount: refundAmountYuan,
    rights_status: rightsStatus,
    status: dbStatus,
    goods_items: Array.isArray(record.goodsItems) && record.goodsItems.length > 0
      ? record.goodsItems : null,
    logistics_vo: record.logisticsVO && Object.keys(record.logisticsVO).length > 0
      ? record.logisticsVO : null,
  };
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
  const goodsItems = (Array.isArray(record.goodsItems) ? record.goodsItems : []).map((item) => ({
    ...item,
    goodsPictureUrl: normalizeImageUrl(item.goodsPictureUrl || item.goodsImage || '', IMAGE_SCENES.product),
  }));
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
    goodsImage: normalizeImageUrl(record.goodsImage || (goodsItems[0] && goodsItems[0].goodsPictureUrl) || '', IMAGE_SCENES.product),
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
    rightsImageUrls: (Array.isArray(record.rightsImageUrls) ? record.rightsImageUrls : []).map((item) =>
      normalizeImageUrl(item, IMAGE_SCENES.comment),
    ),
    ...statusMeta,
  };
}

async function listAfterSales({ userId, status } = {}) {
  const where = {};

  if (userId !== undefined) {
    where.user_id = userId;
  }

  if (status !== undefined && status !== null && status !== '') {
    where.rights_status = parseNumber(status);
  }

  const rows = await AfterSale.findAll({
    where,
    order: [['created_at', 'DESC']],
  });

  return rows.map((row) => hydrateRecord(dbToRecord(row)));
}

async function findAfterSale(rightsNo, userId) {
  const where = { after_sale_no: rightsNo };

  if (userId !== undefined) {
    where.user_id = userId;
  }

  const row = await AfterSale.findOne({ where });

  if (!row) {
    return null;
  }

  return hydrateRecord(dbToRecord(row));
}

function buildStates(list = []) {
  return {
    audit: list.filter((item) => parseNumber(item.rightsStatus) === 10).length,
    approved: list.filter((item) => parseNumber(item.rightsStatus) === 20).length,
    complete: list.filter((item) => parseNumber(item.rightsStatus) === 50).length,
    closed: list.filter((item) => parseNumber(item.rightsStatus) === 60).length,
  };
}

async function updateAfterSale(rightsNo, updater) {
  const row = await AfterSale.findOne({ where: { after_sale_no: rightsNo } });

  if (!row) {
    return null;
  }

  const currentRecord = hydrateRecord(dbToRecord(row));
  const nextRecord = typeof updater === 'function'
    ? updater(currentRecord)
    : { ...currentRecord, ...updater };

  const dbFields = recordToDbFields(nextRecord);
  await row.update(dbFields);

  return hydrateRecord(dbToRecord(row));
}

async function createAfterSale(record) {
  const dbFields = recordToDbFields(record);

  // 如果调用方传了 orderId，写入 order_id 列
  if (record.orderId) {
    dbFields.order_id = record.orderId;
  }

  const row = await AfterSale.create(dbFields);

  return hydrateRecord(dbToRecord(row));
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
