/**
 * 统一响应格式工具
 */

// 成功响应
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    code: 'Success',
    data,
    msg: message
  });
};

// 失败响应
exports.errorResponse = (res, statusCode = 400, businessCode = 'Fail', message = 'Error', data = null) => {
  return res.status(statusCode).json({
    code: businessCode,
    data,
    msg: message
  });
};

// 分页响应
exports.paginatedResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  return res.status(statusCode).json({
    code: 'Success',
    data,
    pagination,
    msg: message
  });
};
