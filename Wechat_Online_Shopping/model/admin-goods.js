/**
 * 管理端商品 Mock 数据（含品牌/生产日期/保质期等字段）
 */

let adminGoodsList = [
  {
    id: 'goods_001',
    name: '智能手机 Pro Max 5G旗舰',
    category: '电子产品',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png',
    spec: '128GB / 黑色',
    brand: '华为',
    productionDate: '2026-01-10',
    shelfLife: '无',
    price: 599900, // 单位：分
    stock: 100,
    status: 1, // 1:上架 0:下架
  },
  {
    id: 'goods_002',
    name: '有机纯牛奶 200ml*24盒',
    category: '食品饮料',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/sp-1a.png',
    spec: '200ml*24',
    brand: '伊利',
    productionDate: '2026-02-15',
    shelfLife: '6个月',
    price: 5900,
    stock: 500,
    status: 1,
  },
  {
    id: 'goods_003',
    name: '白色短袖连衣裙荷叶边裙摆',
    category: '服装鞋包',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png',
    spec: 'S/M/L / 白色',
    brand: 'ZARA',
    productionDate: '2026-01-20',
    shelfLife: '无',
    price: 29800,
    stock: 200,
    status: 1,
  },
  {
    id: 'goods_004',
    name: '不锈钢刀叉勺套装家用西餐餐具',
    category: '家居生活',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
    spec: '六件套 / 金色',
    brand: '双立人',
    productionDate: '2025-12-01',
    shelfLife: '无',
    price: 29900,
    stock: 80,
    status: 1,
  },
  {
    id: 'goods_005',
    name: '腾讯极光盒子4智能网络电视机顶盒',
    category: '电子产品',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3a.png',
    spec: '经典白 / 经典套装',
    brand: '腾讯',
    productionDate: '2026-02-01',
    shelfLife: '无',
    price: 9900,
    stock: 150,
    status: 1,
  },
];

// 获取商品列表
export function getAdminGoodsList(keyword) {
  let list = [...adminGoodsList];
  if (keyword) {
    list = list.filter(
      (g) =>
        g.name.includes(keyword) ||
        g.brand.includes(keyword) ||
        g.category.includes(keyword),
    );
  }
  return list;
}

// 获取单个商品详情
export function getAdminGoodsDetail(id) {
  return adminGoodsList.find((g) => g.id === id) || null;
}

// 新增商品
export function addAdminGoods(goods) {
  const newGoods = {
    ...goods,
    id: `goods_${Date.now()}`,
    status: 1,
  };
  adminGoodsList.unshift(newGoods);
  return newGoods;
}

// 更新商品
export function updateAdminGoods(id, goods) {
  const index = adminGoodsList.findIndex((g) => g.id === id);
  if (index > -1) {
    adminGoodsList[index] = { ...adminGoodsList[index], ...goods };
    return adminGoodsList[index];
  }
  return null;
}

// 删除商品
export function deleteAdminGoods(id) {
  adminGoodsList = adminGoodsList.filter((g) => g.id !== id);
  return true;
}
