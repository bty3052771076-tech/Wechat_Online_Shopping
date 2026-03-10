const { BIGINT, INTEGER, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

const ShoppingCart = sequelize.define('ShoppingCart', {
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
  sku_id: {
    type: BIGINT,
    allowNull: false,
    comment: 'SKU ID'
  },
  quantity: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '数量'
  },
  is_checked: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否选中：0否，1是'
  }
}, {
  tableName: 'shopping_cart',
  comment: '购物车表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'sku_id'],
      name: 'uk_user_sku'
    },
    {
      fields: ['user_id'],
      name: 'idx_user_id'
    }
  ]
});

module.exports = ShoppingCart;
