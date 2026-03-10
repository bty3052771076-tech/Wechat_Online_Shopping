const { BIGINT, STRING, INTEGER, TINYINT, DECIMAL } = require('sequelize');
const sequelize = require('../config/database');

const ProductSkus = sequelize.define('ProductSkus', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  sku_code: {
    type: STRING(50),
    allowNull: false,
    unique: true,
    comment: 'SKU编码，唯一'
  },
  spu_id: {
    type: BIGINT,
    allowNull: false,
    comment: 'SPU ID'
  },
  sku_name: {
    type: STRING(100),
    allowNull: false,
    comment: 'SKU名称'
  },
  price: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '售价（元）'
  },
  line_price: {
    type: DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    comment: '划线价（元）'
  },
  stock: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '库存'
  },
  sales: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '销量'
  },
  specs: {
    type: 'JSON',
    allowNull: true,
    defaultValue: null,
    comment: '规格组合JSON'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0禁用，1启用'
  }
}, {
  tableName: 'product_skus',
  comment: '商品SKU表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'uk_sku_code',
      unique: true,
      fields: ['sku_code']
    },
    {
      name: 'idx_spu_id',
      fields: ['spu_id']
    }
  ]
});

module.exports = ProductSkus;
