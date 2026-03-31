const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 促销活动模型 — promotion_sub_code: MYJ=满减, MYG=满折
const Promotion = sequelize.define(
  'Promotion',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(100), allowNull: false },
    // MYJ=满减 MYG=满折
    promotion_sub_code: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'MYJ' },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    banner_image: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    ladder_desc: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    // 1=启用 0=禁用
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  },
  {
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Promotion;
