const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * JWT认证中间件
 */
exports.authenticate = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized', '未提供认证令牌');
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'TokenExpired', '令牌已过期');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'InvalidToken', '无效的令牌');
    }
    return errorResponse(res, 401, 'Unauthorized', '认证失败');
  }
};

/**
 * 管理员认证中间件
 */
exports.authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized', '未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查是否为管理员
    if (decoded.role !== 'super_admin' && decoded.role !== 'staff') {
      return errorResponse(res, 403, 'Forbidden', '需要管理员权限');
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'TokenExpired', '令牌已过期');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'InvalidToken', '无效的令牌');
    }
    return errorResponse(res, 401, 'Unauthorized', '认证失败');
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // 忽略错误，继续处理请求
    next();
  }
};
