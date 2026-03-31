const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 用户优惠券 — status: 1=未使用 2=已使用 3=已过期
const UserCoupon = sequelize.define(
  'UserCoupon',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    coupon_id: { type: DataTypes.BIGINT, allowNull: false },
    // 冗余字段，方便展示
    coupon_name: { type: DataTypes.STRING(100), allowNull: false },
    // 1=满减 2=折扣
    coupon_type: { type: DataTypes.TINYINT, allowNull: false },
    discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    // 1=未使用 2=已使用 3=已过期
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    use_time: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    order_id: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
  },
  {
    tableName: 'user_coupons',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  },
);

module.exports = UserCoupon;
