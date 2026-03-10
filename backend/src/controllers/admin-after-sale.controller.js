const { successResponse, errorResponse } = require('../utils/response');
const { findAfterSale, listAfterSales, updateAfterSale } = require('../services/after-sale-store');

class AdminAfterSaleController {
  getList(req, res) {
    const { status } = req.query;
    const list = listAfterSales({})
      .filter((item) => (status !== undefined && status !== '' ? Number(item.rightsStatus) === Number(status) : true))
      .map((item) => ({
        id: item.rightsNo,
        orderNo: item.orderNo,
        userId: item.userId,
        userName: item.userName,
        type: item.rightsType,
        typeName: item.typeName,
        status: item.rightsStatus,
        statusName: item.rightsStatusName,
        reason: item.rightsReasonDesc,
        evidence: item.rightsImageUrls || [],
        refundAmount: item.refundAmount,
        createTime: item.createTime,
        goodsName: item.goodsName,
        goodsImage: item.goodsImage,
      }));

    return successResponse(res, 200, '获取成功', list);
  }

  getDetail(req, res) {
    const { id } = req.params;
    const item = findAfterSale(id);

    if (!item) {
      return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
    }

    return successResponse(res, 200, '获取成功', {
      id: item.rightsNo,
      orderNo: item.orderNo,
      userId: item.userId,
      userName: item.userName,
      type: item.rightsType,
      typeName: item.typeName,
      status: item.rightsStatus,
      statusName: item.rightsStatusName,
      reason: item.rightsReasonDesc,
      evidence: item.rightsImageUrls || [],
      refundAmount: item.refundAmount,
      createTime: item.createTime,
      goodsName: item.goodsName,
      goodsImage: item.goodsImage,
    });
  }

  audit(req, res) {
    const { id } = req.params;
    const { approved } = req.body;
    const detail = findAfterSale(id);

    if (!detail) {
      return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
    }

    const updated = updateAfterSale(id, {
      rightsStatus: approved ? 50 : 60,
    });

    return successResponse(res, 200, '处理成功', {
      id: updated.rightsNo,
      status: updated.rightsStatus,
      statusName: updated.rightsStatusName,
    });
  }
}

module.exports = new AdminAfterSaleController();
