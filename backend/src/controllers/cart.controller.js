const { ShoppingCart, ProductSkus, ProductSpus } = require('../models');
const { IMAGE_SCENES, normalizeImageUrl } = require('../utils/image');
const { successResponse, errorResponse } = require('../utils/response');

function normalizeCartResult(item) {
  const normalized = item && typeof item.toJSON === 'function' ? item.toJSON() : { ...(item || {}) };

  if (normalized.sku && normalized.sku.spu) {
    normalized.sku.spu.primary_image = normalizeImageUrl(normalized.sku.spu.primary_image, IMAGE_SCENES.product);
  }

  return normalized;
}

class CartController {
  async addToCart(req, res, next) {
    try {
      const { skuId, quantity } = req.body;
      const userId = req.user.user_id;

      if (!skuId || !quantity || quantity < 1) {
        return errorResponse(res, 400, 'InvalidParam', 'SKU ID和数量不能为空，且数量必须大于0');
      }

      const sku = await ProductSkus.findOne({
        where: { id: skuId, status: 1 },
      });

      if (!sku) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      if (sku.stock < quantity) {
        return errorResponse(res, 400, 'InsufficientStock', '商品库存不足');
      }

      let cartItem = await ShoppingCart.findOne({
        where: { user_id: userId, sku_id: skuId },
      });

      if (cartItem) {
        const newQuantity = cartItem.quantity + quantity;

        if (sku.stock < newQuantity) {
          return errorResponse(res, 400, 'InsufficientStock', '商品库存不足');
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();
      } else {
        cartItem = await ShoppingCart.create({
          user_id: userId,
          sku_id: skuId,
          quantity,
        });
      }

      const result = await ShoppingCart.findByPk(cartItem.id, {
        include: [
          {
            model: ProductSkus,
            as: 'sku',
            attributes: ['id', 'sku_name', 'price', 'stock', 'specs'],
            include: [
              {
                model: ProductSpus,
                as: 'spu',
                attributes: ['id', 'title', 'primary_image'],
              },
            ],
          },
        ],
      });

      return successResponse(res, 201, '加入购物车成功', normalizeCartResult(result));
    } catch (error) {
      next(error);
    }
  }

  async getCartList(req, res, next) {
    try {
      const userId = req.user.user_id;
      const cartItems = await ShoppingCart.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ProductSkus,
            as: 'sku',
            attributes: ['id', 'sku_name', 'price', 'line_price', 'stock', 'specs'],
            where: { status: 1 },
            include: [
              {
                model: ProductSpus,
                as: 'spu',
                attributes: ['id', 'title', 'primary_image'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      let totalAmount = 0;
      let totalQuantity = 0;

      cartItems.forEach((item) => {
        if (item.is_checked === 1 && item.sku) {
          totalAmount += parseFloat(item.sku.price) * item.quantity;
          totalQuantity += item.quantity;
        }
      });

      return successResponse(res, 200, '获取购物车列表成功', {
        items: cartItems.map((item) => normalizeCartResult(item)),
        summary: {
          totalAmount: totalAmount.toFixed(2),
          totalQuantity,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const { cartId, quantity, isChecked } = req.body;
      const userId = req.user.user_id;

      if (!cartId) {
        return errorResponse(res, 400, 'InvalidParam', '购物车ID不能为空');
      }

      if (quantity === undefined && isChecked === undefined) {
        return errorResponse(res, 400, 'InvalidParam', '至少提供quantity或isChecked参数');
      }

      const cartItem = await ShoppingCart.findOne({
        where: { id: cartId, user_id: userId },
        include: [
          {
            model: ProductSkus,
            as: 'sku',
            attributes: ['id', 'stock'],
          },
        ],
      });

      if (!cartItem) {
        return errorResponse(res, 404, 'CartItemNotFound', '购物车商品不存在');
      }

      if (quantity !== undefined) {
        if (quantity < 1) {
          return errorResponse(res, 400, 'InvalidParam', '数量必须大于0');
        }

        if (cartItem.sku && cartItem.sku.stock < quantity) {
          return errorResponse(res, 400, 'InsufficientStock', '商品库存不足');
        }

        cartItem.quantity = quantity;
      }

      if (isChecked !== undefined) {
        if (isChecked !== 0 && isChecked !== 1) {
          return errorResponse(res, 400, 'InvalidParam', '选中状态只能为0或1');
        }

        cartItem.is_checked = isChecked;
      }

      await cartItem.save();

      return successResponse(res, 200, '更新购物车成功', cartItem);
    } catch (error) {
      next(error);
    }
  }

  async deleteCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const cartItem = await ShoppingCart.findOne({
        where: { id, user_id: userId },
      });

      if (!cartItem) {
        return errorResponse(res, 404, 'CartItemNotFound', '购物车商品不存在');
      }

      await cartItem.destroy();

      return successResponse(res, 200, '删除购物车商品成功', { cartId: parseInt(id, 10) });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
