const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { errorResponse } = require('../utils/response');

/**
 * 管理员权限验证中间件
 * 验证JWT token和管理员角色
 */
exports.requireAdminAuth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, '1003', 'Token无效');
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 验证是否为管理员角色
    if (decoded.role !== 'super_admin' && decoded.role !== 'staff') {
      return errorResponse(res, 403, '5001', '权限不足');
    }

    // 从数据库获取管理员信息
    const admin = await Admin.findOne({
      where: { id: decoded.admin_id, status: 1 }
    });

    if (!admin) {
      return errorResponse(res, 403, '5002', '管理员已被禁用');
    }

    // 将管理员信息附加到请求对象
    req.admin_id = decoded.admin_id;
    req.admin = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, '1003', 'Token已过期');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, '1003', 'Token无效');
    }
    return errorResponse(res, 401, '1003', 'Token无效');
  }
};
