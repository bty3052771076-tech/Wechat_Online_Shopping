const { Invoice, Order } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

class InvoiceController {
  // PUT /api/orders/:orderNo/invoice — 提交/更新发票信息
  async upsert(req, res, next) {
    try {
      const { orderNo } = req.params;
      const userId = req.user.user_id;
      const { invoiceVO } = req.body.parameter || req.body;

      if (!invoiceVO) {
        return errorResponse(res, 400, 'InvalidParam', 'invoiceVO 不能为空');
      }

      // 校验订单归属
      const order = await Order.findOne({ where: { order_no: orderNo, user_id: userId } });
      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      const fields = {
        user_id: userId,
        invoice_type: Number(invoiceVO.invoiceType || 0),
        title_type: Number(invoiceVO.titleType || 1),
        content_type: Number(invoiceVO.contentType || 1),
        buyer_name: invoiceVO.buyerName || null,
        buyer_tax_no: invoiceVO.buyerTaxNo || null,
        buyer_phone: invoiceVO.buyerPhone || null,
        email: invoiceVO.email || null,
      };

      const [row, created] = await Invoice.findOrCreate({
        where: { order_no: orderNo },
        defaults: fields,
      });
      if (!created) {
        await row.update(fields);
      }

      return successResponse(res, 200, '发票信息保存成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
