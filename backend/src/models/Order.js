const { BIGINT, STRING, INTEGER, TINYINT, DATE, DECIMAL } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  order_no: {
    type: STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号，唯一'
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  total_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '订单总金额'
  },
  discount_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '优惠金额'
  },
  delivery_fee: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '配送费'
  },
  pay_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '实付金额'
  },
  receiver_name: {
    type: STRING(50),
    allowNull: false,
    comment: '收货人'
  },
  receiver_phone: {
    type: STRING(20),
    allowNull: false,
    comment: '收货电话'
  },
  receiver_address: {
    type: STRING(500),
    allowNull: false,
    comment: '收货地址'
  },
  order_remark: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: '订单备注'
  },
  order_status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '订单状态：1待付款，2待发货，3待收货，4待评价，5已完成，6已取消，7退款中，8已退款'
  },
  pay_status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '支付状态：0未支付，1已支付，2已退款'
  },
  pay_time: {
    type: DATE,
    allowNull: true,
    defaultValue: null,
    comment: '支付时间'
  },
  delivery_status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '发货状态：0未发货，1已发货'
  },
  delivery_company: {
    type: STRING(50),
    allowNull: true,
    defaultValue: null,
    comment: '快递公司'
  },
  delivery_no: {
    type: STRING(50),
    allowNull: true,
    defaultValue: null,
    comment: '快递单号'
  },
  delivery_time: {
    type: DATE,
    allowNull: true,
    defaultValue: null,
    comment: '发货时间'
  },
  finish_time: {
    type: DATE,
    allowNull: true,
    defaultValue: null,
    comment: '完成时间'
  },
  cancel_time: {
    type: DATE,
    allowNull: true,
    defaultValue: null,
    comment: '取消时间'
  },
  cancel_reason: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: '取消原因'
  }
}, {
  tableName: 'orders',
  comment: '订单主表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['order_no'],
      name: 'uk_order_no'
    },
    {
      fields: ['user_id'],
      name: 'idx_user_id'
    },
    {
      fields: ['order_status'],
      name: 'idx_order_status'
    },
    {
      fields: ['created_at'],
      name: 'idx_created_at'
    }
  ]
});

module.exports = Order;
