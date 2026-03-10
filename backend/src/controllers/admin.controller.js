const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  /**
   * 管理员登录
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // 验证输入
      if (!username || !password) {
        return errorResponse(res, 400, 'InvalidParam', '用户名和密码不能为空');
      }

      // 查找管理员
      const admin = await Admin.findOne({
        where: { username, status: 1 }
      });

      if (!admin) {
        return errorResponse(res, 401, 'LoginFailed', '账号或密码错误');
      }

      // 验证密码
      const isValid = await admin.validatePassword(password);
      if (!isValid) {
        return errorResponse(res, 401, 'LoginFailed', '账号或密码错误');
      }

      // 更新最后登录时间
      admin.last_login_time = new Date();
      await admin.save();

      // 生成Token
      const token = jwt.sign(
        {
          admin_id: admin.id,
          username: admin.username,
          role: admin.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return successResponse(res, 200, '登录成功', {
        adminInfo: admin.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取管理员信息
   */
  async getProfile(req, res, next) {
    try {
      const admin = await Admin.findByPk(req.admin.admin_id, {
        attributes: { exclude: ['password'] }
      });

      if (!admin) {
        return errorResponse(res, 404, 'NotFound', '管理员不存在');
      }

      return successResponse(res, 200, '获取成功', admin);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const adminId = req.admin.admin_id;

      if (!oldPassword || !newPassword) {
        return errorResponse(res, 400, 'InvalidParam', '旧密码和新密码不能为空');
      }

      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        return errorResponse(res, 404, 'NotFound', '管理员不存在');
      }

      // 验证旧密码
      const isValid = await admin.validatePassword(oldPassword);
      if (!isValid) {
        return errorResponse(res, 401, 'InvalidPassword', '旧密码错误');
      }

      // 更新密码
      admin.password = newPassword;
      await admin.save();

      return successResponse(res, 200, '密码修改成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
