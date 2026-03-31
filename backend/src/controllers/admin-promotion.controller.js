const { Promotion } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

function toResponse(row) {
  return {
    id: String(row.id),
    title: row.title,
    promotionSubCode: row.promotion_sub_code,
    description: row.description || '',
    bannerImage: row.banner_image || '',
    ladderDesc: row.ladder_desc || '',
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
  };
}

class AdminPromotionController {
  async getList(req, res, next) {
    try {
      const rows = await Promotion.findAll({ order: [['id', 'DESC']] });
      return successResponse(res, 200, '获取成功', rows.map(toResponse));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { title, promotionSubCode = 'MYJ', description, bannerImage, ladderDesc, startTime, endTime } = req.body;
      if (!title || !startTime || !endTime) {
        return errorResponse(res, 400, 'InvalidParam', '必填字段缺失');
      }
      const row = await Promotion.create({
        title: String(title).trim(),
        promotion_sub_code: promotionSubCode,
        description: description || null,
        banner_image: bannerImage || null,
        ladder_desc: ladderDesc || null,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        status: 1,
      });
      return successResponse(res, 201, '创建成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const row = await Promotion.findByPk(id);
      if (!row) return errorResponse(res, 404, 'NotFound', '促销活动不存在');

      const { title, promotionSubCode, description, bannerImage, ladderDesc, startTime, endTime, status } = req.body;
      await row.update({
        title: title !== undefined ? String(title).trim() : row.title,
        promotion_sub_code: promotionSubCode !== undefined ? promotionSubCode : row.promotion_sub_code,
        description: description !== undefined ? description : row.description,
        banner_image: bannerImage !== undefined ? bannerImage : row.banner_image,
        ladder_desc: ladderDesc !== undefined ? ladderDesc : row.ladder_desc,
        start_time: startTime !== undefined ? new Date(startTime) : row.start_time,
        end_time: endTime !== undefined ? new Date(endTime) : row.end_time,
        status: status !== undefined ? Number(status) : row.status,
      });
      return successResponse(res, 200, '更新成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const row = await Promotion.findByPk(id);
      if (!row) return errorResponse(res, 404, 'NotFound', '促销活动不存在');
      await row.update({ status: 0 });
      return successResponse(res, 200, '删除成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminPromotionController();
