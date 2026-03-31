const { Coupon } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

function toResponse(row) {
  return {
    id: String(row.id),
    couponName: row.coupon_name,
    couponType: row.coupon_type,
    discountValue: parseFloat(row.discount_value),
    minAmount: parseFloat(row.min_amount),
    maxDiscount: row.max_discount !== null ? parseFloat(row.max_discount) : null,
    totalQuantity: row.total_quantity,
    receivedQuantity: row.received_quantity,
    usedQuantity: row.used_quantity,
    validDays: row.valid_days,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
  };
}

class AdminCouponController {
  async getList(req, res, next) {
    try {
      const rows = await Coupon.findAll({ order: [['id', 'DESC']] });
      return successResponse(res, 200, '获取成功', rows.map(toResponse));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { couponName, couponType, discountValue, minAmount = 0, maxDiscount = null,
        totalQuantity = 0, validDays, startTime, endTime } = req.body;

      if (!couponName || !couponType || discountValue === undefined || !validDays || !startTime || !endTime) {
        return errorResponse(res, 400, 'InvalidParam', '必填字段缺失');
      }
      if (![1, 2].includes(Number(couponType))) {
        return errorResponse(res, 400, 'InvalidParam', 'couponType 必须为 1(满减) 或 2(折扣)');
      }

      const row = await Coupon.create({
        coupon_name: String(couponName).trim(),
        coupon_type: Number(couponType),
        discount_value: parseFloat(discountValue),
        min_amount: parseFloat(minAmount || 0),
        max_discount: maxDiscount !== null ? parseFloat(maxDiscount) : null,
        total_quantity: Number(totalQuantity || 0),
        valid_days: Number(validDays),
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        status: 1,
      });

      return successResponse(res, 201, '创建成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const row = await Coupon.findByPk(id);
      if (!row) {
        return errorResponse(res, 404, 'CouponNotFound', '优惠券不存在');
      }

      const { couponName, couponType, discountValue, minAmount, maxDiscount,
        totalQuantity, validDays, startTime, endTime, status } = req.body;

      await row.update({
        coupon_name: couponName !== undefined ? String(couponName).trim() : row.coupon_name,
        coupon_type: couponType !== undefined ? Number(couponType) : row.coupon_type,
        discount_value: discountValue !== undefined ? parseFloat(discountValue) : row.discount_value,
        min_amount: minAmount !== undefined ? parseFloat(minAmount) : row.min_amount,
        max_discount: maxDiscount !== undefined ? (maxDiscount !== null ? parseFloat(maxDiscount) : null) : row.max_discount,
        total_quantity: totalQuantity !== undefined ? Number(totalQuantity) : row.total_quantity,
        valid_days: validDays !== undefined ? Number(validDays) : row.valid_days,
        start_time: startTime !== undefined ? new Date(startTime) : row.start_time,
        end_time: endTime !== undefined ? new Date(endTime) : row.end_time,
        status: status !== undefined ? Number(status) : row.status,
      });

      return successResponse(res, 200, '更新成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const row = await Coupon.findByPk(id);
      if (!row) {
        return errorResponse(res, 404, 'CouponNotFound', '优惠券不存在');
      }
      // 软删除：设 status=0
      await row.update({ status: 0 });
      return successResponse(res, 200, '删除成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminCouponController();
