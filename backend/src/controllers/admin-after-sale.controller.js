const { successResponse, errorResponse } = require('../utils/response');
const { findAfterSale, listAfterSales, updateAfterSale } = require('../services/after-sale-store');

class AdminAfterSaleController {
  async getList(req, res, next) {
    try {
      const { status } = req.query;
      const allItems = await listAfterSales({});
      const list = allItems
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
    } catch (error) {
      next(error);
    }
  }

  async getDetail(req, res, next) {
    try {
      const { id } = req.params;
      const item = await findAfterSale(id);

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
    } catch (error) {
      next(error);
    }
  }

  async audit(req, res, next) {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const detail = await findAfterSale(id);

      if (!detail) {
        return errorResponse(res, 404, 'AfterSaleNotFound', '售后单不存在');
      }

      const nextStatus = approved ? (Number(detail.rightsType) === 10 ? 20 : 50) : 60;
      const updated = await updateAfterSale(id, { rightsStatus: nextStatus });

      return successResponse(res, 200, '处理成功', {
        id: updated.rightsNo,
        status: updated.rightsStatus,
        statusName: updated.rightsStatusName,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminAfterSaleController();
