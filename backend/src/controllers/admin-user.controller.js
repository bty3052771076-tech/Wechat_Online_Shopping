const { Op } = require('sequelize');
const { User, Order } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { readJson, writeJson } = require('../services/json-store');

const USER_REMARKS_FILE = 'admin-user-remarks.json';

class AdminUserController {
  async getUsers(req, res, next) {
    try {
      const { keyword = '' } = req.query;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { username: { [Op.like]: `%${keyword}%` } },
          { nickname: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
        ];
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['register_time', 'DESC']],
      });
      const remarkMap = readJson(USER_REMARKS_FILE, {});

      return successResponse(
        res,
        200,
        '获取成功',
        users.map((user) => ({
          ...user.toJSON(),
          remark: remarkMap[String(user.id)] || '',
        })),
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return errorResponse(res, 404, 'UserNotFound', '用户不存在');
      }

      const orders = await Order.findAll({
        where: { user_id: id },
        attributes: ['id', 'order_no', 'order_status', 'total_amount', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 20,
      });
      const remarkMap = readJson(USER_REMARKS_FILE, {});

      return successResponse(res, 200, '获取成功', {
        ...user.toJSON(),
        remark: remarkMap[String(user.id)] || '',
        orderHistory: orders.map((order) => order.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRemark(req, res, next) {
    try {
      const { id } = req.params;
      const { remark = '' } = req.body;
      const user = await User.findByPk(id);

      if (!user) {
        return errorResponse(res, 404, 'UserNotFound', '用户不存在');
      }

      const remarkMap = readJson(USER_REMARKS_FILE, {});
      remarkMap[String(id)] = String(remark).trim();
      writeJson(USER_REMARKS_FILE, remarkMap);

      return successResponse(res, 200, '备注已更新', {
        id: user.id,
        remark: remarkMap[String(id)],
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
