const { BIGINT, STRING, INTEGER, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  parent_id: {
    type: BIGINT,
    allowNull: true,
    defaultValue: null,
    comment: '父分类ID，NULL为一级'
  },
  category_name: {
    type: STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  category_code: {
    type: STRING(20),
    allowNull: true,
    defaultValue: null,
    comment: '分类编码'
  },
  icon_url: {
    type: STRING(500),
    allowNull: true,
    defaultValue: null,
    comment: '分类图标URL'
  },
  sort_order: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序序号'
  },
  level: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '分类层级：1/2/3'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0禁用，1启用'
  }
}, {
  tableName: 'categories',
  comment: '商品分类表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_parent_id',
      fields: ['parent_id']
    },
    {
      name: 'idx_level',
      fields: ['level']
    }
  ]
});

module.exports = Category;
