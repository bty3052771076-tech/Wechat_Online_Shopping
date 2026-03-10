const { BIGINT, STRING, INTEGER, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const ProductImages = sequelize.define('ProductImages', {
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
  image_url: {
    type: STRING(500),
    allowNull: false,
    comment: '图片URL'
  },
  image_type: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '类型：1主图，2轮播，3详情'
  },
  sort_order: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序序号'
  }
}, {
  tableName: 'product_images',
  comment: '商品图片表',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_spu_id',
      fields: ['spu_id']
    },
    {
      name: 'idx_image_type',
      fields: ['image_type']
    }
  ]
});

module.exports = ProductImages;
