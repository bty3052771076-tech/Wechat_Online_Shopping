const { Op } = require('sequelize');
const { Order, OrderItem, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

async function findOrderByIdentifier(identifier, options = {}) {
  const where = Number.isFinite(Number(identifier))
    ? {
        [Op.or]: [{ id: Number(identifier) }, { order_no: String(identifier) }],
      }
    : { order_no: String(identifier) };

  return Order.findOne({
    where,
    ...options,
  });
}

class AdminOrderController {
  async getOrders(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 10,
        orderNo,
        receiverPhone,
        status,
        startTime,
        endTime,
        userName,
      } = req.query;
      const where = {};

      if (orderNo) {
        where.order_no = {
          [Op.like]: `%${orderNo}%`,
        };
      }

      if (receiverPhone) {
        where.receiver_phone = {
          [Op.like]: `%${receiverPhone}%`,
        };
      }

      if (status !== undefined && status !== '') {
        where.order_status = Number(status);
      }

      if (startTime || endTime) {
        where.created_at = {};
        if (startTime) {
          where.created_at[Op.gte] = new Date(startTime);
        }
        if (endTime) {
          where.created_at[Op.lte] = new Date(endTime);
        }
      }

      const userInclude = {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'phone', 'email'],
        required: false,
      };

      if (userName) {
        userInclude.required = true;
        userInclude.where = {
          [Op.or]: [
            { username: { [Op.like]: `%${userName}%` } },
            { nickname: { [Op.like]: `%${userName}%` } },
          ],
        };
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [userInclude],
        order: [['created_at', 'DESC']],
        limit: Number(pageSize),
        offset,
        distinct: true,
      });

      const orderIds = rows.map((order) => order.id);
      const previewItems = orderIds.length
        ? await OrderItem.findAll({
            where: { order_id: orderIds },
            order: [
              ['order_id', 'ASC'],
              ['id', 'ASC'],
            ],
          })
        : [];
      const previewMap = {};

      previewItems.forEach((item) => {
        if (!previewMap[item.order_id]) {
          previewMap[item.order_id] = item.toJSON();
        }
      });

      return paginatedResponse(
        res,
        200,
        '获取订单列表成功',
        rows.map((order) => ({
          ...order.toJSON(),
          previewItem: previewMap[order.id] || null,
        })),
        {
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize)),
        },
      );
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const order = await findOrderByIdentifier(req.params.idOrOrderNo, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'phone', 'email'],
          },
          {
            model: OrderItem,
            as: 'items',
          },
        ],
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      return successResponse(res, 200, '获取成功', order.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async shipOrder(req, res, next) {
    try {
      const { deliveryCompany, deliveryNo } = req.body;

      if (!deliveryCompany || !deliveryNo) {
        return errorResponse(res, 400, 'InvalidParam', '快递公司和快递单号不能为空');
      }

      const order = await findOrderByIdentifier(req.params.idOrOrderNo);

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      if (Number(order.order_status) !== 2) {
        return errorResponse(res, 400, 'InvalidStatus', '订单状态不允许此操作');
      }

      await order.update({
        order_status: 3,
        delivery_status: 1,
        delivery_company: deliveryCompany,
        delivery_no: deliveryNo,
        delivery_time: new Date(),
      });

      return successResponse(res, 200, '发货成功', {
        id: order.id,
        order_no: order.order_no,
        delivery_company: deliveryCompany,
        delivery_no: deliveryNo,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminOrderController();
