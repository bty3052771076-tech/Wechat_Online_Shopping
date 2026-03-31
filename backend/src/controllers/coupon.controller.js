const { Coupon, UserCoupon, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

// 将 DB 行映射为前端所需格式（对齐 model/coupon.js 的字段名）
function toUserCouponResponse(row) {
  const statusMap = { 1: 'default', 2: 'useless', 3: 'disabled' };
  const typeMap = { 1: 'price', 2: 'discount' };
  const now = new Date();
  // 自动判断是否已过期
  let status = statusMap[row.status] || 'disabled';
  if (status === 'default' && row.end_time && new Date(row.end_time) < now) {
    status = 'disabled';
  }

  const type = typeMap[row.coupon_type] || 'price';
  const minAmountFen = Math.round(parseFloat(row.min_amount || 0) * 100);
  // 满减：value 为分; 折扣：value 为折扣率（如 0.8）
  const value = type === 'price'
    ? Math.round(parseFloat(row.discount_value || 0) * 100)
    : parseFloat(row.discount_value || 0);

  const startStr = row.start_time ? String(row.start_time).slice(0, 10).replace(/-/g, '.') : '';
  const endStr = row.end_time ? String(row.end_time).slice(0, 10).replace(/-/g, '.') : '';

  return {
    key: String(row.id),
    couponId: String(row.id),
    couponTemplateId: String(row.coupon_id || row.id),
    status,
    type,
    value,
    tag: '',
    desc: minAmountFen > 0 ? `满${minAmountFen / 100}元可用` : '无门槛使用',
    base: minAmountFen,
    title: row.coupon_name || '',
    timeLimit: startStr && endStr ? `${startStr}-${endStr}` : '',
    currency: '¥',
  };
}

class CouponController {
  // GET /api/coupons — 获取可领取的优惠券列表
  async getAvailable(req, res, next) {
    try {
      const now = new Date();
      const rows = await Coupon.findAll({
        where: {
          status: 1,
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now },
        },
        order: [['id', 'ASC']],
      });

      return successResponse(res, 200, '获取成功', rows.map((r) => {
        const typeMap = { 1: 'price', 2: 'discount' };
        const type = typeMap[r.coupon_type] || 'price';
        const minAmountFen = Math.round(parseFloat(r.min_amount || 0) * 100);
        const value = type === 'price'
          ? Math.round(parseFloat(r.discount_value || 0) * 100)
          : parseFloat(r.discount_value || 0);
        const startStr = r.start_time ? String(r.start_time).slice(0, 10).replace(/-/g, '.') : '';
        const endStr = r.end_time ? String(r.end_time).slice(0, 10).replace(/-/g, '.') : '';
        return {
          id: String(r.id),
          coupon_name: r.coupon_name,
          coupon_type: r.coupon_type,
          type,
          value,
          discount_value: parseFloat(r.discount_value),
          min_amount: parseFloat(r.min_amount),
          base: minAmountFen,
          desc: minAmountFen > 0 ? `满${minAmountFen / 100}元可用` : '无门槛使用',
          title: r.coupon_name,
          timeLimit: startStr && endStr ? `${startStr}-${endStr}` : '',
          remaining: r.total_quantity === 0 ? null : r.total_quantity - r.received_quantity,
        };
      }));
    } catch (error) {
      next(error);
    }
  }

  // POST /api/coupons/:id/claim — 领取优惠券
  async claim(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const now = new Date();

      const coupon = await Coupon.findByPk(id, { transaction: t });
      if (!coupon || coupon.status !== 1) {
        await t.rollback();
        return errorResponse(res, 404, 'CouponNotFound', '优惠券不存在或已下架');
      }
      if (new Date(coupon.end_time) < now) {
        await t.rollback();
        return errorResponse(res, 400, 'CouponExpired', '优惠券已过期');
      }
      if (coupon.total_quantity > 0 && coupon.received_quantity >= coupon.total_quantity) {
        await t.rollback();
        return errorResponse(res, 400, 'CouponExhausted', '优惠券已领完');
      }

      // 每人只能领一次同一优惠券
      const existing = await UserCoupon.findOne({
        where: { user_id: userId, coupon_id: id },
        transaction: t,
      });
      if (existing) {
        await t.rollback();
        return errorResponse(res, 400, 'AlreadyClaimed', '已领取过该优惠券');
      }

      // 计算有效期
      const startTime = now;
      const endTime = new Date(coupon.end_time);

      await UserCoupon.create({
        user_id: userId,
        coupon_id: coupon.id,
        coupon_name: coupon.coupon_name,
        coupon_type: coupon.coupon_type,
        discount_value: coupon.discount_value,
        min_amount: coupon.min_amount,
        start_time: startTime,
        end_time: endTime,
        status: 1,
      }, { transaction: t });

      await coupon.increment('received_quantity', { by: 1, transaction: t });
      await t.commit();

      return successResponse(res, 201, '领取成功');
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // GET /api/coupons/user — 获取当前用户的优惠券列表
  async getUserCoupons(req, res, next) {
    try {
      const userId = req.user.user_id;
      // status query: 'default'=未使用(1), 'useless'=已使用(2), 'disabled'=已过期(3)
      const statusParam = req.query.status || 'default';
      const statusMap = { default: 1, useless: 2, disabled: 3 };
      const dbStatus = statusMap[statusParam];

      const where = { user_id: userId };
      if (dbStatus !== undefined) {
        where.status = dbStatus;
      }

      const rows = await UserCoupon.findAll({
        where,
        order: [['created_at', 'DESC']],
      });

      return successResponse(res, 200, '获取成功', rows.map(toUserCouponResponse));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponController();
