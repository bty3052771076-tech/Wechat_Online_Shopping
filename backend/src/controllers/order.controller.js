const { Order, OrderItem, UserAddress, ProductSkus, ProductSpus, ShoppingCart, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { normalizeImageUrl } = require('../utils/image');

function formatSkuSpecInfo(specs) {
  if (!specs) {
    return null;
  }

  if (typeof specs === 'string') {
    return specs;
  }

  return JSON.stringify(specs);
}

class OrderController {
  async createOrder(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { items, addressId, deliveryFee = 0, remark } = req.body;
      const userId = req.user.user_id;

      if (!Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '商品列表不能为空');
      }

      if (!addressId) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '收货地址ID不能为空');
      }

      if (deliveryFee < 0) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '配送费不能为负数');
      }

      const address = await UserAddress.findOne({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        await transaction.rollback();
        return errorResponse(res, 400, 'AddressNotFound', '收货地址不存在', { errorCode: 4003 });
      }

      const skuIds = items.map((item) => item.skuId);
      const skus = await ProductSkus.findAll({
        where: { id: skuIds, status: 1 },
        include: [
          {
            model: ProductSpus,
            as: 'spu',
            attributes: ['id', 'title', 'primary_image'],
          },
        ],
      });

      if (skus.length !== items.length) {
        await transaction.rollback();
        return errorResponse(res, 400, 'ProductNotFound', '部分商品不存在或已下架', { errorCode: 2001 });
      }

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const sku = skus.find((record) => String(record.id) === String(item.skuId));

        if (!sku) {
          await transaction.rollback();
          return errorResponse(res, 400, 'ProductNotFound', `商品ID ${item.skuId} 不存在`, { errorCode: 2001 });
        }

        if (sku.stock < item.quantity) {
          await transaction.rollback();
          return errorResponse(res, 400, 'InsufficientStock', `商品 ${sku.spu.title} 库存不足`, { errorCode: 2002 });
        }

        const itemTotal = parseFloat(sku.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          sku_id: sku.id,
          spu_id: sku.spu_id,
          quantity: item.quantity,
          price: sku.price,
          total_amount: itemTotal,
          product_title: sku.spu.title,
          product_image: normalizeImageUrl(sku.spu.primary_image),
          sku_spec_info: formatSkuSpecInfo(sku.specs),
        });
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).slice(2, 8).toUpperCase();
      const orderNo = `ORDER${timestamp}${randomStr}`;
      const payAmount = totalAmount + parseFloat(deliveryFee);
      const fullAddress = `${address.province_name}${address.city_name}${address.district_name}${address.detail_address}`;

      const order = await Order.create(
        {
          order_no: orderNo,
          user_id: userId,
          total_amount: totalAmount,
          discount_amount: 0,
          delivery_fee: deliveryFee,
          pay_amount: payAmount,
          receiver_name: address.receiver_name,
          receiver_phone: address.receiver_phone,
          receiver_address: fullAddress,
          order_remark: remark || null,
          order_status: 1,
          pay_status: 0,
        },
        { transaction },
      );

      const itemsWithOrderId = orderItemsData.map((item) => ({
        ...item,
        order_id: order.id,
        order_no: orderNo,
      }));

      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

      for (const item of items) {
        await ProductSkus.decrement('stock', {
          by: item.quantity,
          where: { id: item.skuId },
          transaction,
        });
      }

      await ShoppingCart.destroy({
        where: {
          user_id: userId,
          sku_id: items.map((item) => item.skuId),
        },
        transaction,
      });

      await transaction.commit();

      return successResponse(res, 201, '创建订单成功', {
        id: order.id,
        order_no: orderNo,
        total_amount: totalAmount,
        pay_amount: payAmount,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getOrderList(req, res, next) {
    try {
      const userId = req.user.user_id;
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      const status = req.query.status ? parseInt(req.query.status, 10) : null;
      const offset = (page - 1) * pageSize;
      const whereClause = { user_id: userId };

      if (status !== null && !Number.isNaN(status)) {
        whereClause.order_status = status;
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'items',
            limit: 1,
            separate: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
      });

      const formattedOrders = orders.map((order) => {
        const orderData = order.toJSON();

        if (orderData.items && orderData.items.length > 0) {
          orderData.previewItem = {
            ...orderData.items[0],
            product_image: normalizeImageUrl(orderData.items[0].product_image),
          };
          delete orderData.items;
        }

        return orderData;
      });

      return successResponse(res, 200, '获取订单列表成功', {
        list: formattedOrders,
        pagination: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil(count / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const order = await Order.findOne({
        where: { id, user_id: userId },
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
        ],
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在', { errorCode: 4001 });
      }

      const orderData = order.toJSON();

      return successResponse(res, 200, '获取订单详情成功', {
        ...orderData,
        items: (Array.isArray(orderData.items) ? orderData.items : []).map((item) => ({
          ...item,
          product_image: normalizeImageUrl(item.product_image),
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async payOrder(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { orderNo } = req.params;
      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          user_id: userId,
        },
      });

      if (!order) {
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      if (Number(order.order_status) !== 1) {
        return errorResponse(res, 400, 'InvalidOrderStatus', '当前订单状态不允许付款');
      }

      order.order_status = 2;
      order.pay_status = 1;
      order.pay_time = new Date();
      await order.save();

      return successResponse(res, 200, '支付成功', {
        orderNo,
        orderStatus: order.order_status,
        payStatus: order.pay_status,
        payAmount: order.pay_amount,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const userId = req.user.user_id;
      const { orderNo } = req.params;
      const { cancelReason = '' } = req.body || {};
      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          user_id: userId,
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
        ],
        transaction,
      });

      if (!order) {
        await transaction.rollback();
        return errorResponse(res, 404, 'OrderNotFound', '订单不存在');
      }

      if (Number(order.order_status) !== 1) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidOrderStatus', '当前订单状态不允许取消');
      }

      order.order_status = 6;
      order.cancel_time = new Date();
      order.cancel_reason = cancelReason || '用户取消订单';
      await order.save({ transaction });

      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        await ProductSkus.increment('stock', {
          by: Number(item.quantity || 0),
          where: { id: item.sku_id },
          transaction,
        });
      }

      await transaction.commit();

      return successResponse(res, 200, '取消订单成功', {
        orderNo,
        orderStatus: order.order_status,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = new OrderController();
