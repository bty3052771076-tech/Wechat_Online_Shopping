const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 优惠券适用分类关联模型 (#21)
const CouponCategory = sequelize.define(
  'CouponCategory',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    coupon_id: { type: DataTypes.BIGINT, allowNull: false },
    category_id: { type: DataTypes.BIGINT, allowNull: false },
  },
  {
    tableName: 'coupon_categories',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

module.exports = CouponCategory;
