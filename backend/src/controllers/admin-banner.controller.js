const { Banner } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

function toResponse(row) {
  return {
    id: String(row.id),
    title: row.title,
    imageUrl: row.image_url,
    linkType: row.link_type,
    linkValue: row.link_value || '',
    sortOrder: row.sort_order,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
  };
}

class AdminBannerController {
  async getList(req, res, next) {
    try {
      const rows = await Banner.findAll({ order: [['sort_order', 'ASC'], ['id', 'DESC']] });
      return successResponse(res, 200, '获取成功', rows.map(toResponse));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { title, imageUrl, linkType = 0, linkValue, sortOrder = 0, startTime, endTime } = req.body;
      if (!title || !imageUrl) {
        return errorResponse(res, 400, 'InvalidParam', '标题和图片URL为必填');
      }
      const row = await Banner.create({
        title: String(title).trim(),
        image_url: String(imageUrl).trim(),
        link_type: Number(linkType),
        link_value: linkValue || null,
        sort_order: Number(sortOrder),
        start_time: startTime ? new Date(startTime) : null,
        end_time: endTime ? new Date(endTime) : null,
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
      const row = await Banner.findByPk(id);
      if (!row) return errorResponse(res, 404, 'NotFound', 'Banner不存在');

      const { title, imageUrl, linkType, linkValue, sortOrder, startTime, endTime, status } = req.body;
      await row.update({
        title: title !== undefined ? String(title).trim() : row.title,
        image_url: imageUrl !== undefined ? String(imageUrl).trim() : row.image_url,
        link_type: linkType !== undefined ? Number(linkType) : row.link_type,
        link_value: linkValue !== undefined ? linkValue : row.link_value,
        sort_order: sortOrder !== undefined ? Number(sortOrder) : row.sort_order,
        start_time: startTime !== undefined ? (startTime ? new Date(startTime) : null) : row.start_time,
        end_time: endTime !== undefined ? (endTime ? new Date(endTime) : null) : row.end_time,
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
      const row = await Banner.findByPk(id);
      if (!row) return errorResponse(res, 404, 'NotFound', 'Banner不存在');
      await row.update({ status: 0 });
      return successResponse(res, 200, '删除成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminBannerController();
