const { BIGINT, DECIMAL, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryFee = sequelize.define('DeliveryFee', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  area_id: {
    type: BIGINT,
    allowNull: false,
    comment: '区域ID'
  },
  min_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '满额包邮（元）'
  },
  base_fee: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '基础运费（元）'
  },
  free_fee: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否包邮：0否，1是'
  }
}, {
  tableName: 'delivery_fees',
  timestamps: true,
  underscored: true,
  comment: '配送费用表'
});

module.exports = DeliveryFee;
