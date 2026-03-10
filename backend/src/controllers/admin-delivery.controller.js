const { successResponse, errorResponse } = require('../utils/response');
const { readJson, writeJson } = require('../services/json-store');

const DELIVERY_FILE = 'admin-delivery-areas.json';
const DEFAULT_DELIVERY_AREAS = [
  {
    id: 'area_001',
    areaName: '同城配送',
    description: '市区范围内配送',
    baseFee: 500,
    freeThreshold: 9900,
  },
  {
    id: 'area_002',
    areaName: '省内配送',
    description: '省内非同城区配送',
    baseFee: 800,
    freeThreshold: 19900,
  },
  {
    id: 'area_003',
    areaName: '全国配送',
    description: '跨省配送',
    baseFee: 1200,
    freeThreshold: 29900,
  },
];

function getAreas() {
  return readJson(DELIVERY_FILE, DEFAULT_DELIVERY_AREAS);
}

function saveAreas(data) {
  return writeJson(DELIVERY_FILE, data);
}

class AdminDeliveryController {
  getList(req, res) {
    return successResponse(res, 200, '获取成功', getAreas());
  }

  create(req, res) {
    const { areaName, description = '', baseFee = 0, freeThreshold = 0 } = req.body;

    if (!areaName || !String(areaName).trim()) {
      return errorResponse(res, 400, 'InvalidParam', '区域名称不能为空');
    }

    const areas = getAreas();
    const newArea = {
      id: `area_${Date.now()}`,
      areaName: String(areaName).trim(),
      description: String(description || '').trim(),
      baseFee: Number(baseFee || 0),
      freeThreshold: Number(freeThreshold || 0),
    };

    areas.push(newArea);
    saveAreas(areas);

    return successResponse(res, 201, '添加成功', newArea);
  }

  update(req, res) {
    const { id } = req.params;
    const { areaName, description = '', baseFee = 0, freeThreshold = 0 } = req.body;
    const areas = getAreas();
    const index = areas.findIndex((item) => item.id === id);

    if (index < 0) {
      return errorResponse(res, 404, 'DeliveryAreaNotFound', '配送区域不存在');
    }

    areas[index] = {
      ...areas[index],
      areaName: String(areaName || areas[index].areaName).trim(),
      description: String(description).trim(),
      baseFee: Number(baseFee || 0),
      freeThreshold: Number(freeThreshold || 0),
    };
    saveAreas(areas);

    return successResponse(res, 200, '更新成功', areas[index]);
  }

  remove(req, res) {
    const { id } = req.params;
    const areas = getAreas();
    const index = areas.findIndex((item) => item.id === id);

    if (index < 0) {
      return errorResponse(res, 404, 'DeliveryAreaNotFound', '配送区域不存在');
    }

    const [removed] = areas.splice(index, 1);
    saveAreas(areas);

    return successResponse(res, 200, '删除成功', removed);
  }
}

module.exports = new AdminDeliveryController();
