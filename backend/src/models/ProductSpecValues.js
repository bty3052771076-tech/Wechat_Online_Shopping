const { BIGINT, STRING, INTEGER } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpecValues = sequelize.define('ProductSpecValues', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  spec_id: {
    type: BIGINT,
    allowNull: false,
    comment: '规格ID'
  },
  spec_value: {
    type: STRING(50),
    allowNull: false,
    comment: '规格值：红色、XL'
  },
  sort_order: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序序号'
  }
}, {
  tableName: 'product_spec_values',
  comment: '商品规格值表',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_spec_id',
      fields: ['spec_id']
    }
  ]
});

module.exports = ProductSpecValues;
