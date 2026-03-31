const { BIGINT, TINYINT, TEXT, STRING, JSON: JSONTYPE } = require('sequelize');
const sequelize = require('../config/database');

// 商品评论模型（对应 product_comments 表）
const ProductComment = sequelize.define('ProductComment', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID',
  },
  spu_id: {
    type: BIGINT,
    allowNull: false,
    comment: '商品SPU ID',
  },
  order_id: {
    type: BIGINT,
    allowNull: true,
    defaultValue: null,
    comment: '订单ID（可选关联）',
  },
  order_no: {
    type: STRING(50),
    allowNull: true,
    defaultValue: null,
    comment: '订单号',
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '评价用户ID',
  },
  sku_spec_info: {
    type: STRING(200),
    allowNull: true,
    defaultValue: null,
    comment: 'SKU规格信息文本',
  },
  comment_score: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 5,
    comment: '评分：1-5',
  },
  comment_content: {
    type: TEXT,
    allowNull: true,
    defaultValue: null,
    comment: '评价内容',
  },
  comment_resources: {
    type: JSONTYPE,
    allowNull: true,
    defaultValue: null,
    comment: '图片/视频资源 JSON数组',
  },
  is_anonymous: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否匿名：0否，1是',
  },
  is_auto_comment: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否自动评价：0否，1是',
  },
  seller_reply: {
    type: TEXT,
    allowNull: true,
    defaultValue: null,
    comment: '商家回复',
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0隐藏，1显示',
  },
}, {
  tableName: 'product_comments',
  timestamps: true,
  underscored: true,
  comment: '商品评论表',
  indexes: [
    { name: 'idx_spu_id', fields: ['spu_id'] },
    { name: 'idx_order_no', fields: ['order_no'] },
    { name: 'idx_user_id', fields: ['user_id'] },
    { name: 'idx_status_spu', fields: ['status', 'spu_id'] },
  ],
});

module.exports = ProductComment;
