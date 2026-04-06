const { Coupon, CouponCategory, Category, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

// 将 DB 行映射为前端格式，附带 categoryIds (#21)
function toResponse(row, categoryIds = []) {
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
    categoryIds,
  };
}

class AdminCouponController {
  async getList(req, res, next) {
    try {
      // 附带分类关联信息 (#21)
      const rows = await Coupon.findAll({
        order: [['id', 'DESC']],
        include: [{ model: CouponCategory, as: 'couponCategories', attributes: ['category_id'] }],
      });
      return successResponse(res, 200, '获取成功', rows.map((r) => {
        const categoryIds = (r.couponCategories || []).map((c) => Number(c.category_id));
        return toResponse(r, categoryIds);
      }));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { couponName, couponType, discountValue, minAmount = 0, maxDiscount = null,
        totalQuantity = 0, validDays, startTime, endTime, categoryIds = [] } = req.body;

      if (!couponName || !couponType || discountValue === undefined || !validDays || !startTime || !endTime) {
        await t.rollback();
        return errorResponse(res, 400, 'InvalidParam', '必填字段缺失');
      }
      if (![1, 2].includes(Number(couponType))) {
        await t.rollback();
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
      }, { transaction: t });

      // 写入分类关联 (#21)
      const validCatIds = Array.isArray(categoryIds) ? categoryIds.filter(Number.isFinite) : [];
      if (validCatIds.length > 0) {
        await CouponCategory.bulkCreate(
          validCatIds.map((catId) => ({ coupon_id: row.id, category_id: catId })),
          { transaction: t, ignoreDuplicates: true },
        );
      }

      await t.commit();
      return successResponse(res, 201, '创建成功', toResponse(row, validCatIds));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  async update(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const row = await Coupon.findByPk(id, { transaction: t });
      if (!row) {
        await t.rollback();
        return errorResponse(res, 404, 'CouponNotFound', '优惠券不存在');
      }

      const { couponName, couponType, discountValue, minAmount, maxDiscount,
        totalQuantity, validDays, startTime, endTime, status, categoryIds } = req.body;

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
      }, { transaction: t });

      // 更新分类关联：若传了 categoryIds 则替换 (#21)
      let newCatIds = [];
      if (Array.isArray(categoryIds)) {
        newCatIds = categoryIds.filter(Number.isFinite);
        await CouponCategory.destroy({ where: { coupon_id: id }, transaction: t });
        if (newCatIds.length > 0) {
          await CouponCategory.bulkCreate(
            newCatIds.map((catId) => ({ coupon_id: id, category_id: catId })),
            { transaction: t, ignoreDuplicates: true },
          );
        }
      } else {
        // 未传 categoryIds，保留原有关联
        const existing = await CouponCategory.findAll({ where: { coupon_id: id }, transaction: t });
        newCatIds = existing.map((c) => Number(c.category_id));
      }

      await t.commit();
      return successResponse(res, 200, '更新成功', toResponse(row, newCatIds));
    } catch (error) {
      await t.rollback();
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
