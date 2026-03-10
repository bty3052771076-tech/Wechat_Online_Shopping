const { BIGINT, STRING, INTEGER, TINYINT, DATE, DECIMAL, TEXT } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpus = sequelize.define('ProductSpus', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  spu_code: {
    type: STRING(50),
    allowNull: false,
    unique: true,
    comment: 'SPU编码，唯一'
  },
  title: {
    type: STRING(200),
    allowNull: false,
    comment: '商品标题'
  },
  subtitle: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: '商品副标题'
  },
  category_id: {
    type: BIGINT,
    allowNull: false,
    comment: '分类ID'
  },
  brand: {
    type: STRING(50),
    allowNull: true,
    defaultValue: null,
    comment: '品牌'
  },
  primary_image: {
    type: STRING(500),
    allowNull: false,
    comment: '主图URL'
  },
  detail_images: {
    type: TEXT,
    allowNull: true,
    defaultValue: null,
    comment: '详情图URL，JSON数组'
  },
  product_detail: {
    type: TEXT,
    allowNull: true,
    defaultValue: null,
    comment: '商品详情HTML'
  },
  min_sale_price: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '最低售价（元）'
  },
  max_line_price: {
    type: DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    comment: '最高划线价（元）'
  },
  total_stock: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '总库存'
  },
  sold_num: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '已售数量'
  },
  tags: {
    type: STRING(100),
    allowNull: true,
    defaultValue: null,
    comment: '标签：热销、新品'
  },
  production_date: {
    type: DATE,
    allowNull: true,
    defaultValue: null,
    comment: '生产日期'
  },
  shelf_life: {
    type: INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: '保质期（天）'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0下架，1上架'
  },
  sort_order: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序序号'
  }
}, {
  tableName: 'product_spus',
  comment: '商品SPU表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'uk_spu_code',
      unique: true,
      fields: ['spu_code']
    },
    {
      name: 'idx_category_id',
      fields: ['category_id']
    },
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_sold_num',
      fields: [{
        name: 'sold_num',
        order: 'DESC'
      }]
    }
  ]
});

module.exports = ProductSpus;
