const { successResponse, errorResponse } = require('../utils/response');
const DeliveryArea = require('../models/DeliveryArea');

// 将 DB 行转换为前端格式
function toResponse(row) {
  return {
    id: row.id,
    areaName: row.area_name,
    description: row.description || '',
    baseFee: row.base_fee_fen,
    freeThreshold: row.free_threshold_fen,
  };
}

class AdminDeliveryController {
  async getList(req, res, next) {
    try {
      const rows = await DeliveryArea.findAll({
        where: { is_available: 1 },
        order: [['id', 'ASC']],
      });

      return successResponse(res, 200, '获取成功', rows.map(toResponse));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { areaName, description = '', baseFee = 0, freeThreshold = 0 } = req.body;

      if (!areaName || !String(areaName).trim()) {
        return errorResponse(res, 400, 'InvalidParam', '区域名称不能为空');
      }

      const row = await DeliveryArea.create({
        area_name: String(areaName).trim(),
        description: String(description || '').trim() || null,
        base_fee_fen: Number(baseFee || 0),
        free_threshold_fen: Number(freeThreshold || 0),
        is_available: 1,
      });

      return successResponse(res, 201, '添加成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { areaName, description = '', baseFee = 0, freeThreshold = 0 } = req.body;

      const row = await DeliveryArea.findByPk(id);

      if (!row || row.is_available === 0) {
        return errorResponse(res, 404, 'DeliveryAreaNotFound', '配送区域不存在');
      }

      await row.update({
        area_name: String(areaName || row.area_name).trim(),
        description: String(description).trim() || null,
        base_fee_fen: Number(baseFee || 0),
        free_threshold_fen: Number(freeThreshold || 0),
      });

      return successResponse(res, 200, '更新成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const row = await DeliveryArea.findByPk(id);

      if (!row || row.is_available === 0) {
        return errorResponse(res, 404, 'DeliveryAreaNotFound', '配送区域不存在');
      }

      // 软删除
      await row.update({ is_available: 0 });

      return successResponse(res, 200, '删除成功', toResponse(row));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminDeliveryController();
