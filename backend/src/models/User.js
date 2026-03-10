const { BIGINT, STRING, INTEGER, TINYINT, DATE, DECIMAL } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  username: {
    type: STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名，唯一'
  },
  password: {
    type: STRING(255),
    allowNull: false,
    comment: '密码（bcrypt加密）'
  },
  nickname: {
    type: STRING(50),
    defaultValue: null,
    comment: '微信昵称'
  },
  avatar_url: {
    type: STRING(500),
    defaultValue: null,
    comment: '头像URL'
  },
  phone: {
    type: STRING(20),
    unique: true,
    allowNull: true,
    comment: '手机号，唯一'
  },
  email: {
    type: STRING(100),
    unique: true,
    allowNull: true,
    comment: '邮箱，唯一'
  },
  gender: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '性别：0未知，1男，2女'
  },
  openid: {
    type: STRING(100),
    unique: true,
    allowNull: true,
    comment: '微信OpenID，唯一'
  },
  unionid: {
    type: STRING(100),
    allowNull: true,
    comment: '微信UnionID'
  },
  register_time: {
    type: DATE,
    allowNull: false,
    defaultValue: new Date(),
    comment: '注册时间'
  },
  last_login_time: {
    type: DATE,
    defaultValue: null,
    comment: '最后登录时间'
  },
  status: {
    type: TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0禁用，1正常'
  },
  total_orders: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '总订单数'
  },
  total_spent: {
    type: DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '总消费金额（元）'
  }
}, {
  tableName: 'users',
  comment: '普通用户表',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// 实例方法：隐藏密码
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
