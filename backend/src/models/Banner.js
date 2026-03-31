const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Banner 轮播图模型
const Banner = sequelize.define(
  'Banner',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '' },
    image_url: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
    link_type: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    link_value: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // 1=启用 0=禁用
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    start_time: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    end_time: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    tableName: 'banners',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Banner;
