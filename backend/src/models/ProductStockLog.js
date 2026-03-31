const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 商品库存变更日志（append-only，无 updatedAt）
const ProductStockLog = sequelize.define(
  'ProductStockLog',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    sku_id: { type: DataTypes.BIGINT, allowNull: false },
    // change_type: 1=出库/扣减, 2=入库/增加, 3=手动调整
    change_type: { type: DataTypes.TINYINT, allowNull: false },
    change_quantity: { type: DataTypes.INTEGER, allowNull: false },
    before_stock: { type: DataTypes.INTEGER, allowNull: false },
    after_stock: { type: DataTypes.INTEGER, allowNull: false },
    order_no: { type: DataTypes.STRING(32), allowNull: true, defaultValue: null },
    remark: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
  },
  {
    tableName: 'product_stock_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  },
);

module.exports = ProductStockLog;
