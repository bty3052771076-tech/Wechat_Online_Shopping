const { BIGINT, STRING, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusLog = sequelize.define('OrderStatusLog', {
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
  from_status: {
    type: TINYINT,
    allowNull: true,
    defaultValue: null,
    comment: '原状态'
  },
  to_status: {
    type: TINYINT,
    allowNull: false,
    comment: '新状态'
  },
  operator_type: {
    type: TINYINT,
    allowNull: false,
    comment: '操作人类型：1用户，2管理员，3系统'
  },
  operator_id: {
    type: BIGINT,
    allowNull: true,
    defaultValue: null,
    comment: '操作人ID'
  },
  remark: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: '备注'
  }
}, {
  tableName: 'order_status_logs',
  comment: '订单状态日志表',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['order_id'],
      name: 'idx_order_id'
    },
    {
      fields: ['created_at'],
      name: 'idx_created_at'
    }
  ]
});

module.exports = OrderStatusLog;
