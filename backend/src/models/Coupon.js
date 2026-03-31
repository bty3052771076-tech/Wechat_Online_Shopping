const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 优惠券模板模型 — coupon_type: 1=满减 2=折扣
const Coupon = sequelize.define(
  'Coupon',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    coupon_name: { type: DataTypes.STRING(100), allowNull: false },
    // 1=满减券 2=折扣券
    coupon_type: { type: DataTypes.TINYINT, allowNull: false },
    // 满减: 减免金额(元); 折扣: 折扣率(如 0.8=8折)
    discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // 满减门槛(元)，0表示无门槛
    min_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    // 最大优惠金额(元)，折扣券用，NULL表示无上限
    max_discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
    total_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    received_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    used_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // 领取后有效天数
    valid_days: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    // 1=启用 0=禁用
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  },
  {
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Coupon;
