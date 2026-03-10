const { BIGINT, STRING, INTEGER } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpecs = sequelize.define('ProductSpecs', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  spu_id: {
    type: BIGINT,
    allowNull: false,
    comment: 'SPU ID'
  },
  spec_name: {
    type: STRING(50),
    allowNull: false,
    comment: '规格名称：颜色、尺寸'
  },
  sort_order: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序序号'
  }
}, {
  tableName: 'product_specs',
  comment: '商品规格定义表',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_spu_id',
      fields: ['spu_id']
    }
  ]
});

module.exports = ProductSpecs;
