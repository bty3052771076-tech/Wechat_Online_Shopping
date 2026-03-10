/**
 * 管理端配送管理 Mock 数据
 */

const deliveryAreaList = [
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
    description: '省内非同城区域',
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
  {
    id: 'area_004',
    areaName: '偏远地区',
    description: '新疆、西藏、内蒙古等偏远地区',
    baseFee: 2000,
    freeThreshold: 49900,
  },
];

// 获取配送区域列表
export function getDeliveryAreaList() {
  return [...deliveryAreaList];
}

// 获取配送区域详情
export function getDeliveryAreaDetail(id) {
  return deliveryAreaList.find((a) => a.id === id) || null;
}

// 更新配送费设置
export function updateDeliveryArea(id, data) {
  const area = deliveryAreaList.find((a) => a.id === id);
  if (area) {
    Object.assign(area, data);
    return true;
  }
  return false;
}

// 新增配送区域
export function addDeliveryArea(data) {
  const newArea = {
    id: `area_${String(deliveryAreaList.length + 1).padStart(3, '0')}`,
    ...data,
  };
  deliveryAreaList.push(newArea);
  return newArea;
}

// 删除配送区域
export function deleteDeliveryArea(id) {
  const index = deliveryAreaList.findIndex((a) => a.id === id);
  if (index > -1) {
    deliveryAreaList.splice(index, 1);
    return true;
  }
  return false;
}
