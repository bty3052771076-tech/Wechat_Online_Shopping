const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 发票信息模型
const Invoice = sequelize.define(
  'Invoice',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_no: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    // 0=不开发票 5=电子发票
    invoice_type: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    // 1=个人 2=公司
    title_type: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    // 1=商品明细 2=商品类别
    content_type: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    buyer_name: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
    buyer_tax_no: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    buyer_phone: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
    email: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
  },
  {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Invoice;
