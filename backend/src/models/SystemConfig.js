const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 系统配置键值表
const SystemConfig = sequelize.define(
  'SystemConfig',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    config_key: { type: DataTypes.STRING(50), allowNull: false },
    config_value: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    config_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'string' },
    description: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
  },
  {
    tableName: 'system_configs',
    timestamps: true,
    underscored: true,
  },
);

module.exports = SystemConfig;
