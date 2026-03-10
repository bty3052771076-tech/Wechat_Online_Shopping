const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');

class UserController {
  async register(req, res, next) {
    try {
      const { username, password, phone, email } = req.body;

      if (!username || !password) {
        return errorResponse(res, 400, 'InvalidParam', '用户名和密码不能为空');
      }

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return errorResponse(res, 400, 'UserExists', '用户名已存在');
      }

      const user = await User.create({
        username,
        password,
        phone,
        email,
      });

      const token = jwt.sign(
        {
          user_id: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );

      return successResponse(res, 201, '注册成功', {
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return errorResponse(res, 400, 'InvalidParam', '用户名和密码不能为空');
      }

      const user = await User.findOne({
        where: { username, status: 1 },
      });

      if (!user) {
        return errorResponse(res, 401, 'LoginFailed', '用户名或密码错误');
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return errorResponse(res, 401, 'LoginFailed', '用户名或密码错误');
      }

      user.last_login_time = new Date();
      await user.save();

      const token = jwt.sign(
        {
          user_id: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );

      return successResponse(res, 200, '登录成功', {
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return errorResponse(res, 404, 'NotFound', '用户不存在');
      }

      return successResponse(res, 200, '获取成功', user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { nickname, avatar_url, phone, gender } = req.body;
      const userId = req.user.user_id;
      const user = await User.findByPk(userId);

      if (!user) {
        return errorResponse(res, 404, 'NotFound', '用户不存在');
      }

      if (nickname !== undefined) user.nickname = nickname;
      if (avatar_url !== undefined) user.avatar_url = avatar_url;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;

      await user.save();

      return successResponse(res, 200, '更新成功', user.toJSON());
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
