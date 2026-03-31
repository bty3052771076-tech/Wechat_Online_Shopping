const { BIGINT, STRING, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const AfterSaleLog = sequelize.define('AfterSaleLog', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  after_sale_id: {
    type: BIGINT,
    allowNull: false,
    comment: '售后单ID'
  },
  operator_type: {
    type: TINYINT,
    allowNull: false,
    comment: '操作人类型：1用户，2管理员'
  },
  operator_id: {
    type: BIGINT,
    allowNull: true,
    comment: '操作人ID'
  },
  action: {
    type: STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  content: {
    type: STRING(500),
    allowNull: true,
    comment: '操作内容'
  }
}, {
  tableName: 'after_sale_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  comment: '售后处理记录表'
});

module.exports = AfterSaleLog;
