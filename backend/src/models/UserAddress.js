const { BIGINT, STRING, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = sequelize.define('UserAddress', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  receiver_name: {
    type: STRING(50),
    allowNull: false,
    comment: '收货人姓名'
  },
  receiver_phone: {
    type: STRING(20),
    allowNull: false,
    comment: '收货人手机号'
  },
  province_code: {
    type: STRING(20),
    allowNull: false,
    comment: '省份编码'
  },
  province_name: {
    type: STRING(50),
    allowNull: false,
    comment: '省份名称'
  },
  city_code: {
    type: STRING(20),
    allowNull: false,
    comment: '城市编码'
  },
  city_name: {
    type: STRING(50),
    allowNull: false,
    comment: '城市名称'
  },
  district_code: {
    type: STRING(20),
    allowNull: false,
    comment: '区县编码'
  },
  district_name: {
    type: STRING(50),
    allowNull: false,
    comment: '区县名称'
  },
  detail_address: {
    type: STRING(200),
    allowNull: false,
    comment: '详细地址'
  },
  postal_code: {
    type: STRING(10),
    allowNull: true,
    defaultValue: null,
    comment: '邮政编码'
  },
  is_default: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否默认：0否，1是'
  }
}, {
  tableName: 'user_addresses',
  comment: '用户收货地址表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
      name: 'idx_user_id'
    }
  ]
});

module.exports = UserAddress;
