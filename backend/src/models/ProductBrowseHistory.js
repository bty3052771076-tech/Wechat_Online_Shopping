const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 用户浏览历史（append-only，无 updatedAt）
const ProductBrowseHistory = sequelize.define(
  'ProductBrowseHistory',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    spu_id: { type: DataTypes.BIGINT, allowNull: false },
  },
  {
    tableName: 'product_browse_history',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  },
);

module.exports = ProductBrowseHistory;
