const { BIGINT, STRING, INTEGER, TEXT, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryArea = sequelize.define('DeliveryArea', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  area_name: {
    type: STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: '配送区域名称'
  },
  description: {
    type: TEXT,
    allowNull: true,
    comment: '区域描述'
  },
  base_fee_fen: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '基础运费（分）'
  },
  free_threshold_fen: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '满额包邮门槛（分），0表示不包邮'
  },
  province_code: {
    type: STRING(20),
    allowNull: false,
    defaultValue: '',
    comment: '省份编码（可选，用于地理映射）'
  },
  province_name: {
    type: STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '省份名称'
  },
  city_code: {
    type: STRING(20),
    allowNull: false,
    defaultValue: '',
    comment: '城市编码'
  },
  city_name: {
    type: STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '城市名称'
  },
  district_code: {
    type: STRING(20),
    allowNull: false,
    defaultValue: '',
    comment: '区县编码'
  },
  district_name: {
    type: STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '区县名称'
  },
  is_available: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否可配送：0否，1是'
  }
}, {
  tableName: 'delivery_areas',
  timestamps: true,
  underscored: true,
  comment: '配送区域表'
});

module.exports = DeliveryArea;
