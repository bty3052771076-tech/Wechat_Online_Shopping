const Banner = require('../models/Banner');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

class BannerController {
  // GET /api/banners — 获取当前有效的轮播图列表
  async getList(req, res, next) {
    try {
      const now = new Date();
      const where = {
        status: 1,
        // start_time 为 NULL 或 <= now
        [Op.and]: [
          {
            [Op.or]: [
              { start_time: null },
              { start_time: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { end_time: null },
              { end_time: { [Op.gte]: now } },
            ],
          },
        ],
      };

      const rows = await Banner.findAll({
        where,
        order: [['sort_order', 'ASC'], ['id', 'ASC']],
        attributes: ['id', 'title', 'image_url', 'link_type', 'link_value'],
      });

      return successResponse(res, 200, '获取成功', rows.map((r) => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BannerController();
