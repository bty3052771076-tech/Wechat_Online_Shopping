const { BIGINT, STRING, TINYINT } = require('sequelize');
const sequelize = require('../config/database');

// AI 购物助手会话表
const ChatSession = sequelize.define('ChatSession', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  user_id: {
    type: BIGINT,
    allowNull: false,
    comment: '用户ID，关联 users.id'
  },
  title: {
    type: STRING(100),
    allowNull: false,
    defaultValue: 'New Chat',
    comment: '会话标题，取首条消息前20字'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：1=active, 0=deleted'
  }
}, {
  tableName: 'chat_sessions',
  comment: 'AI购物助手会话表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'status'],
      name: 'idx_user_status'
    }
  ]
});

module.exports = ChatSession;
