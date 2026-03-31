const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 用户商品收藏
const Favorite = sequelize.define(
  'Favorite',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    spu_id: { type: DataTypes.BIGINT, allowNull: false },
  },
  {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  },
);

module.exports = Favorite;
