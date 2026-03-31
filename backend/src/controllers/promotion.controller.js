const { Promotion, ProductSpus } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { IMAGE_SCENES, normalizeImageUrl } = require('../utils/image');
const { Op } = require('sequelize');

function toActivityItem(promo) {
  return {
    promotionId: String(promo.id),
    promotionName: promo.title,
    title: promo.title,
    description: promo.description || null,
    promotionCode: 'MERCHANT',
    promotionSubCode: promo.promotion_sub_code,
    tag: promo.promotion_sub_code === 'MYJ' ? '满减' : '满折',
    timeType: 1,
    startTime: String(new Date(promo.start_time).getTime()),
    endTime: String(new Date(promo.end_time).getTime()),
    teasingStartTime: null,
    activityLadder: promo.ladder_desc ? [{ label: promo.ladder_desc }] : [],
  };
}

class PromotionController {
  // GET /api/promotions — 获取当前有效活动列表
  async getList(req, res, next) {
    try {
      const now = new Date();
      const rows = await Promotion.findAll({
        where: {
          status: 1,
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now },
        },
        order: [['id', 'ASC']],
      });

      return successResponse(res, 200, '获取成功', rows.map(toActivityItem));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/promotions/:id — 获取活动详情（含商品列表）
  async getDetail(req, res, next) {
    try {
      const { id } = req.params;
      const promo = await Promotion.findByPk(id);

      if (!promo || promo.status === 0) {
        return errorResponse(res, 404, 'PromotionNotFound', '活动不存在');
      }

      // 取前20个在售商品作为活动商品列表（简化：实际应有关联表）
      const goods = await ProductSpus.findAll({
        where: { status: 1 },
        limit: 20,
        attributes: ['id', 'title', 'primary_image', 'min_sale_price', 'max_line_price', 'sold_num'],
      });

      const list = goods.map((spu) => ({
        spuId: String(spu.id),
        goodsName: spu.title,
        image: normalizeImageUrl(spu.primary_image || '', IMAGE_SCENES.product),
        price: Math.round(parseFloat(spu.min_sale_price || 0) * 100),
        originPrice: Math.round(parseFloat(spu.max_line_price || 0) * 100),
        soldNum: spu.sold_num || 0,
        tags: [{ title: promo.promotion_sub_code === 'MYJ' ? '满减' : '满折' }],
      }));

      const now = new Date();
      const endTs = new Date(promo.end_time).getTime();

      return successResponse(res, 200, '获取成功', {
        promotionId: String(promo.id),
        title: promo.title,
        banner: normalizeImageUrl(promo.banner_image || '', IMAGE_SCENES.banner),
        time: Math.max(0, endTs - now.getTime()),
        showBannerDesc: Boolean(promo.description),
        statusTag: now.getTime() < endTs ? '进行中' : '已结束',
        list,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
