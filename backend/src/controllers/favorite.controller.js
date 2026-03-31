const { Favorite, ProductSpus, ProductSkus } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { IMAGE_SCENES, normalizeImageUrl } = require('../utils/image');

function toFavoriteResponse(row) {
  const spu = row.spu || {};
  // min_sale_price 以元存储，转为分供前端使用
  const minSalePriceFen = Math.round(parseFloat(spu.min_sale_price || 0) * 100);
  return {
    id: String(row.id),
    spuId: String(row.spu_id),
    title: spu.title || '',
    primaryImage: normalizeImageUrl(spu.primary_image || '', IMAGE_SCENES.product),
    minSalePrice: minSalePriceFen,
    createdAt: row.created_at,
  };
}

class FavoriteController {
  // GET /api/favorites — 获取当前用户收藏列表
  async getList(req, res, next) {
    try {
      const userId = req.user.user_id;
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 20;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Favorite.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: ProductSpus,
            as: 'spu',
            attributes: ['id', 'title', 'primary_image', 'min_sale_price'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
      });

      return successResponse(res, 200, '获取成功', {
        list: rows.map(toFavoriteResponse),
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

  // POST /api/favorites — 收藏商品
  async add(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { spuId } = req.body;

      if (!spuId) {
        return errorResponse(res, 400, 'InvalidParam', 'spuId 不能为空');
      }

      const spu = await ProductSpus.findByPk(spuId);
      if (!spu) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      const [row, created] = await Favorite.findOrCreate({
        where: { user_id: userId, spu_id: spuId },
      });

      return successResponse(res, created ? 201 : 200, created ? '收藏成功' : '已收藏', {
        id: String(row.id),
        spuId: String(row.spu_id),
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/favorites/:spuId — 取消收藏
  async remove(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { spuId } = req.params;

      const deleted = await Favorite.destroy({
        where: { user_id: userId, spu_id: spuId },
      });

      if (!deleted) {
        return errorResponse(res, 404, 'NotFound', '收藏记录不存在');
      }

      return successResponse(res, 200, '取消收藏成功');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/favorites/check/:spuId — 检查是否已收藏
  async check(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { spuId } = req.params;

      const row = await Favorite.findOne({
        where: { user_id: userId, spu_id: spuId },
      });

      return successResponse(res, 200, '获取成功', { isFavorite: Boolean(row) });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
