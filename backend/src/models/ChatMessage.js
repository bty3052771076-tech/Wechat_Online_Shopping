const { BIGINT, STRING, TEXT, JSON: JSON_TYPE } = require('sequelize');
const sequelize = require('../config/database');

// AI 购物助手消息表
const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  session_id: {
    type: BIGINT,
    allowNull: false,
    comment: '会话ID，关联 chat_sessions.id'
  },
  role: {
    type: STRING(20),
    allowNull: false,
    comment: '消息角色：user 或 assistant'
  },
  content: {
    type: TEXT,
    allowNull: false,
    comment: '消息文本内容'
  },
  metadata: {
    type: JSON_TYPE,
    allowNull: true,
    defaultValue: null,
    comment: '结构化数据，如商品推荐列表 {products: [...]}'
  }
}, {
  tableName: 'chat_messages',
  comment: 'AI购物助手消息表',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['session_id', 'created_at'],
      name: 'idx_session_created'
    }
  ]
});

module.exports = ChatMessage;
