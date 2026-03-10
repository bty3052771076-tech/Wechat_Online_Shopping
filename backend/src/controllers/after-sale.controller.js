const { Order, OrderItem, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const {
  buildStates,
  createAfterSale,
  createRightsNo,
  findAfterSale,
  formatDateTime,
  getLogisticsCompanies,
  hydrateRecord,
  listAfterSales,
  updateAfterSale,
} = require('../services/after-sale-store');

function parseSpecInfo(specInfo) {
  if (!specInfo) {
    return [];
  }

  if (Array.isArray(specInfo)) {
    return specInfo;
  }

  if (typeof specInfo === 'object') {
    return Object.entries(specInfo).map(([specTitle, specValue]) => ({ specTitle, specValue }));
  }

  try {
    return parseSpecInfo(JSON.parse(specInfo));
  } catch (error) {
    return [];
  }
}

function priceToFen(value) {
  return Math.round(Number(value || 0) * 100);
}

function getReasonList(receiptStatus) {
  if (Number(receiptStatus) === 1) {
    return [
      { id: 1, desc: '未收到货' },
      { id: 2, desc: '发错货/少件漏发' },
      { id: 3, desc: '快递长时间未更新' },
    ];
  }

  return [
    { id: 1, desc: '商品有瑕疵' },
    { id: 2, desc: '尺寸/规格不合适' },
    { id: 3, desc: '不想要了' },
  ];
}

class AfterSaleController {
  async getPreview(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { orderNo, skuId, numOfSku = 1 } = req.query;
      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          user_id: userId,
        },
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      const item = await OrderItem.findOne({
        where: {
          order_no: orderNo,
          sku_id: skuId,
        },
      });

      if (!item) {
        return errorResponse(res, 404, 'OrderItemNotFound', '售后商品不存在');
      }

      const quantity = Math.min(Number(numOfSku) || 1, Number(item.quantity || 1));
      const paidAmountEach = priceToFen(item.price);

      return successResponse(res, 200, '获取成功', {
        orderNo,
        spuId: item.spu_id,
        skuId: item.sku_id,
        paidAmountEach,
        boughtQuantity: Number(item.quantity || 1),
        refundableAmount: paidAmountEach * quantity,
        shippingFeeIncluded: 0,
        numOfSku: quantity,
        numOfSkuAvailable: Number(item.quantity || 1),
        goodsInfo: {
          goodsName: item.product_title,
          skuImage: item.product_image,
          specInfo: parseSpecInfo(item.sku_spec_info),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  getReasons(req, res) {
    const { rightsReasonType = 1 } = req.query;

    return successResponse(res, 200, '获取成功', {
      rightsReasonList: getReasonList(rightsReasonType),
    });
  }

  getLogisticsCompanies(req, res) {
    return successResponse(res, 200, '获取成功', getLogisticsCompanies());
  }

  async apply(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        orderNo,
        refundRequestAmount = 0,
        rightsImageUrls = [],
        rightsReasonDesc = '',
        rightsReasonType = 1,
        rightsType = 20,
        refundMemo = '',
        items = [],
      } = req.body;

      if (!orderNo || !Array.isArray(items) || items.length === 0) {
        return errorResponse(res, 400, 'InvalidParam', '售后申请参数不完整');
      }

      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          user_id: userId,
        },
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      const firstRequestItem = items[0];
      const orderItem = await OrderItem.findOne({
        where: {
          order_no: orderNo,
          sku_id: firstRequestItem.skuId,
        },
      });

      if (!orderItem) {
        return errorResponse(res, 404, 'OrderItemNotFound', '售后商品不存在');
      }

      const user = await User.findByPk(userId);
      const rightsNo = createRightsNo();
      const refundAmount = Number(refundRequestAmount || priceToFen(orderItem.total_amount));
      const specInfo = parseSpecInfo(orderItem.sku_spec_info).map((spec) => ({
        specTitle: spec.specTitle || spec.key || '',
        specValues: spec.specValue || spec.specValues || '',
      }));

      const created = createAfterSale({
        rightsNo,
        orderNo,
        userId,
        userName: (user && (user.nickname || user.username)) || '',
        storeId: 'default-store',
        storeName: '默认店铺',
        rightsType: Number(rightsType || 20),
        rightsReasonType: Number(rightsReasonType || 1),
        rightsReasonDesc: String(rightsReasonDesc || ''),
        refundAmount,
        refundRequestAmount: refundAmount,
        rightsStatus: 10,
        createTime: formatDateTime(new Date()),
        refundMemo: String(refundMemo || ''),
        rightsImageUrls: Array.isArray(rightsImageUrls) ? rightsImageUrls : [],
        goodsItems: items.map((item) => ({
          skuId: item.skuId,
          spuId: item.spuId,
          goodsName: orderItem.product_title,
          goodsPictureUrl: orderItem.product_image,
          specInfo,
          itemRefundAmount: Number(item.itemTotalAmount || refundAmount),
          rightsQuantity: Number(item.rightsQuantity || 1),
        })),
        logisticsVO: {
          logisticsType: 1,
          logisticsNo: '',
          logisticsStatus: null,
          logisticsCompanyCode: '',
          logisticsCompanyName: '',
          receiverName: order.receiver_name || '',
          receiverPhone: order.receiver_phone || '',
          receiverProvince: '',
          receiverCity: '',
          receiverCountry: '',
          receiverArea: '',
          receiverAddress: order.receiver_address || '',
          remark: '',
          nodes: [],
        },
        rightsRefund: {
          traceNo: `TRACE${rightsNo}`,
          refundDesc: String(refundMemo || rightsReasonDesc || ''),
          refundAmount,
        },
      });

      return successResponse(res, 201, '申请成功', {
        rightsNo: created.rightsNo,
      });
    } catch (error) {
      next(error);
    }
  }

  getList(req, res) {
    const userId = req.user.user_id;
    const { status, page = 1, pageSize = 10 } = req.query;
    const fullList = listAfterSales({ userId });
    const filteredList =
      status !== undefined && status !== ''
        ? fullList.filter((item) => Number(item.rightsStatus) === Number(status))
        : fullList;
    const currentPage = Number(page) || 1;
    const currentPageSize = Number(pageSize) || 10;
    const start = (currentPage - 1) * currentPageSize;
    const pagedList = filteredList.slice(start, start + currentPageSize);

    return successResponse(res, 200, '获取成功', {
      list: pagedList,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        total: filteredList.length,
      },
      states: buildStates(fullList),
    });
  }

  getDetail(req, res) {
    const userId = req.user.user_id;
    const { rightsNo } = req.params;
    const detail = findAfterSale(rightsNo, userId);

    if (!detail) {
      return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
    }

    return successResponse(res, 200, '获取成功', detail);
  }

  cancel(req, res) {
    const userId = req.user.user_id;
    const { rightsNo } = req.params;
    const detail = findAfterSale(rightsNo, userId);

    if (!detail) {
      return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
    }

    const updated = updateAfterSale(rightsNo, {
      rightsStatus: 60,
    });

    return successResponse(res, 200, '撤销成功', updated);
  }

  updateLogistics(req, res) {
    const userId = req.user.user_id;
    const { rightsNo } = req.params;
    const { logisticsCompanyCode = '', logisticsCompanyName = '', logisticsNo = '', remark = '' } = req.body;
    const detail = findAfterSale(rightsNo, userId);

    if (!detail) {
      return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
    }

    const updated = updateAfterSale(rightsNo, (current) =>
      hydrateRecord({
        ...current,
        rightsStatus: current.rightsStatus === 10 ? 20 : current.rightsStatus,
        logisticsVO: {
          ...(current.logisticsVO || {}),
          logisticsCompanyCode,
          logisticsCompanyName,
          logisticsNo,
          remark,
          nodes: logisticsNo
            ? [
                {
                  title: '已寄回',
                  code: '200002',
                  desc: '买家已填写退货物流信息',
                  date: formatDateTime(new Date()),
                },
              ]
            : [],
        },
      }),
    );

    return successResponse(res, 200, '保存成功', updated);
  }

  async confirmReceived(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { orderNo } = req.params;
      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          user_id: userId,
        },
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      order.order_status = 5;
      order.finish_time = new Date();
      await order.save();

      return successResponse(res, 200, '确认收货成功', {
        orderNo,
        orderStatus: order.order_status,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AfterSaleController();
