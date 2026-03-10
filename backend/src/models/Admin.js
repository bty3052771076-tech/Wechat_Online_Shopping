const { BIGINT, STRING, TINYINT, DATE } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Admin = sequelize.define('Admin', {
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
  real_name: {
    type: STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  role: {
    type: STRING(20),
    allowNull: false,
    comment: '角色：super_admin, staff'
  },
  phone: {
    type: STRING(20),
    defaultValue: null,
    comment: '手机号'
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
  }
}, {
  tableName: 'admins',
  comment: '管理员表',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        admin.password = await bcrypt.hash(admin.password, 10);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await bcrypt.hash(admin.password, 10);
      }
    }
  }
});

// 实例方法：隐藏密码
Admin.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

// 实例方法：验证密码
Admin.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Admin;
