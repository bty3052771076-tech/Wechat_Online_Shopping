const { Op } = require('sequelize');
const { User, Order } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

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

      return successResponse(
        res,
        200,
        '获取成功',
        users.map((user) => ({
          ...user.toJSON(),
          remark: user.admin_notes || '',
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

      return successResponse(res, 200, '获取成功', {
        ...user.toJSON(),
        remark: user.admin_notes || '',
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

      // 备注直接存入 users.admin_notes 列，不再使用 JSON 文件
      await user.update({ admin_notes: String(remark).trim() || null });

      return successResponse(res, 200, '备注已更新', {
        id: user.id,
        remark: user.admin_notes || '',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
