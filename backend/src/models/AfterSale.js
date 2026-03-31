const { BIGINT, STRING, TINYINT, DATE, DECIMAL, TEXT, JSON: JSONTYPE } = require('sequelize');
const sequelize = require('../config/database');

const AfterSale = sequelize.define('AfterSale', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  after_sale_no: {
    type: STRING(32),
    allowNull: false,
    unique: true,
    comment: '售后单号，唯一'
  },
  order_id: {
    type: BIGINT,
    allowNull: true,
    comment: '订单ID'
  },
  order_no: {
    type: STRING(32),
    allowNull: false,
    comment: '订单号'
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  user_name: {
    type: STRING(100),
    allowNull: true,
    defaultValue: null,
    comment: '用户名称（冗余）'
  },
  type: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '售后类型：1退款，2退货'
  },
  reason: {
    type: STRING(500),
    allowNull: true,
    comment: '申请原因'
  },
  description: {
    type: TEXT,
    allowNull: true,
    comment: '详细描述'
  },
  proof_images: {
    type: JSONTYPE,
    allowNull: true,
    comment: '凭证图片JSON数组'
  },
  refund_amount: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '退款金额（元）'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '简要状态：1待审核，2通过，3驳回'
  },
  rights_status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 10,
    comment: '细粒度状态：10待审核,20已审核,30已收货,50已完成,60已关闭'
  },
  audit_remark: {
    type: TEXT,
    allowNull: true,
    comment: '审核备注'
  },
  audit_time: {
    type: DATE,
    allowNull: true,
    comment: '审核时间'
  },
  refund_time: {
    type: DATE,
    allowNull: true,
    comment: '退款完成时间'
  },
  goods_items: {
    type: JSONTYPE,
    allowNull: true,
    comment: '售后商品列表JSON'
  },
  logistics_vo: {
    type: JSONTYPE,
    allowNull: true,
    comment: '物流信息JSON'
  }
}, {
  tableName: 'after_sales',
  timestamps: true,
  underscored: true,
  comment: '售后申请表'
});

module.exports = AfterSale;
