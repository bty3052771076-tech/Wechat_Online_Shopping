const { BIGINT, STRING } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpuTags = sequelize.define('ProductSpuTags', {
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
  tag_name: {
    type: STRING(20),
    allowNull: false,
    comment: '标签名称'
  }
}, {
  tableName: 'product_spu_tags',
  comment: '商品SPU标签关联表',
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

module.exports = ProductSpuTags;
