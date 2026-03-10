const { BIGINT, STRING, INTEGER, DECIMAL } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  order_id: {
    type: BIGINT,
    allowNull: false,
    comment: '订单ID'
  },
  order_no: {
    type: STRING(32),
    allowNull: false,
    comment: '订单号'
  },
  spu_id: {
    type: BIGINT,
    allowNull: false,
    comment: 'SPU ID'
  },
  sku_id: {
    type: BIGINT,
    allowNull: false,
    comment: 'SKU ID'
  },
  product_title: {
    type: STRING(200),
    allowNull: false,
    comment: '商品标题（快照）'
  },
  product_image: {
    type: STRING(500),
    allowNull: false,
    comment: '商品图片（快照）'
  },
  sku_spec_info: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: 'SKU规格（快照）'
  },
  price: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '商品单价'
  },
  quantity: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '购买数量'
  },
  total_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '小计金额'
  }
}, {
  tableName: 'order_items',
  comment: '订单商品明细表',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['order_id'],
      name: 'idx_order_id'
    },
    {
      fields: ['order_no'],
      name: 'idx_order_no'
    }
  ]
});

module.exports = OrderItem;
