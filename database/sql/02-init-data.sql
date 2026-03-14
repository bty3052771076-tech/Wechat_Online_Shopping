-- ========================================
-- 微信小程序在线购物系统初始化数据
-- 数据库: wechat_shop
-- 版本: v2.0
-- 说明: 初始化管理员、测试用户、商品分类、商品、轮播图与系统配置
-- ========================================

USE wechat_shop;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ========================================
-- 1. 管理员
-- ========================================
-- admin / admin123
-- staff01 / 123456
INSERT INTO admins (username, password, real_name, role, phone, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', 'Admin', 'super_admin', '13800000001', 1),
('staff01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', 'Staff', 'staff', '13800000002', 1);

-- ========================================
-- 2. 测试用户
-- ========================================
-- testuser / 123456
-- zhangsan / 123456
INSERT INTO users (username, password, nickname, avatar_url, phone, gender, status) VALUES
('testuser', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', '测试用户', '/assets/images/avatar/default.png', '13800138000', 1, 1),
('zhangsan', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', '张三', '/assets/images/avatar/default.png', '13900139000', 1, 1);

-- ========================================
-- 3. 商品分类
-- ========================================
INSERT INTO categories (parent_id, category_name, category_code, icon_url, sort_order, level, status) VALUES
(NULL, '生鲜食品', 'CATEGORY_FRESH', '/assets/images/categories/fresh.png', 1, 1, 1),
(NULL, '日用百货', 'CATEGORY_DAILY', '/assets/images/categories/daily.png', 2, 1, 1),
(NULL, '美妆个护', 'CATEGORY_BEAUTY', '/assets/images/categories/beauty.png', 3, 1, 1),
(1, '蔬菜水果', 'FRESH_FRUIT', '/assets/images/categories/fruit.png', 1, 2, 1),
(1, '肉禽蛋品', 'FRESH_MEAT', '/assets/images/categories/meat.png', 2, 2, 1),
(1, '海鲜水产', 'FRESH_SEAFOOD', '/assets/images/categories/seafood.png', 3, 2, 1),
(2, '厨房用品', 'DAILY_KITCHEN', '/assets/images/categories/kitchen.png', 1, 2, 1),
(2, '家居清洁', 'DAILY_CLEAN', '/assets/images/categories/clean.png', 2, 2, 1),
(2, '纸品湿巾', 'DAILY_PAPER', '/assets/images/categories/paper.png', 3, 2, 1),
(3, '面部护理', 'BEAUTY_FACE', '/assets/images/categories/face.png', 1, 2, 1),
(3, '身体护理', 'BEAUTY_BODY', '/assets/images/categories/body.png', 2, 2, 1),
(3, '香水彩妆', 'BEAUTY_MAKEUP', '/assets/images/categories/makeup.png', 3, 2, 1);

-- ========================================
-- 4. 商品 SPU
-- ========================================
INSERT INTO product_spus (
  spu_code,
  title,
  subtitle,
  category_id,
  brand,
  primary_image,
  detail_images,
  product_detail,
  min_sale_price,
  max_line_price,
  total_stock,
  sold_num,
  tags,
  status
) VALUES
(
  'SPU001',
  '新疆阿克苏苹果',
  '新鲜脆甜 果园直发',
  4,
  '阿克苏果园',
  '/assets/images/products/apple.png',
  '["/assets/images/products/apple.png"]',
  '<p>阿克苏苹果，口感清甜，适合家庭日常食用。</p>',
  29.90,
  59.00,
  500,
  128,
  '热销,果园直发',
  1
),
(
  'SPU002',
  '有机胡萝卜',
  '无农药残留 健康营养',
  4,
  '有机农场',
  '/assets/images/products/carrot.png',
  '["/assets/images/products/carrot.png"]',
  '<p>有机胡萝卜，适合轻食、炖煮和家庭备菜。</p>',
  19.90,
  35.00,
  300,
  86,
  '新品,有机',
  1
),
(
  'SPU003',
  '农家散养土鸡蛋',
  '散养土鸡 营养丰富',
  5,
  '农家牧场',
  '/assets/images/products/egg.png',
  '["/assets/images/products/egg.png"]',
  '<p>散养土鸡蛋，适合早餐与家庭烹饪。</p>',
  35.00,
  58.00,
  200,
  215,
  '热销,家庭装',
  1
),
(
  'SPU004',
  '立白洗衣液',
  '深层洁净 去味除菌',
  8,
  '立白',
  '/assets/images/products/detergent.png',
  '["/assets/images/products/detergent.png"]',
  '<p>多规格洗衣液，适合家庭日常洗护。</p>',
  39.90,
  89.00,
  400,
  342,
  '热销,家居清洁',
  1
),
(
  'SPU005',
  '维达抽纸',
  '柔软亲肤 家庭常备',
  9,
  '维达',
  '/assets/images/products/tissue.png',
  '["/assets/images/products/tissue.png"]',
  '<p>3层柔韧抽纸，适合家用和办公场景。</p>',
  29.90,
  49.00,
  600,
  528,
  '热销,囤货推荐',
  1
),
(
  'SPU006',
  '补水保湿面膜',
  '深层补水 温和护理',
  10,
  '美即',
  '/assets/images/products/mask.png',
  '["/assets/images/products/mask.png"]',
  '<p>补水保湿面膜，适合换季与日常修护。</p>',
  79.00,
  159.00,
  150,
  186,
  '新品,补水修护',
  1
),
(
  'SPU007',
  '氨基酸洗面奶',
  '温和清洁 深层保湿',
  10,
  '芙丽芳丝',
  '/assets/images/products/cleanser.png',
  '["/assets/images/products/cleanser.png"]',
  '<p>温和洁面，适合日常清洁与敏感肌护理。</p>',
  99.00,
  149.00,
  200,
  267,
  '热销,敏感肌适用',
  1
);

-- ========================================
-- 5. 商品 SKU
-- ========================================
INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU001-1', 1, '小果 2.5kg', 29.90, 39.00, 200, 50, '{"size":"小果","weight":"2.5kg"}', 1),
('SKU001-2', 1, '中果 3kg', 39.90, 49.00, 200, 50, '{"size":"中果","weight":"3kg"}', 1),
('SKU001-3', 1, '大果 4kg', 49.90, 59.00, 100, 28, '{"size":"大果","weight":"4kg"}', 1),
('SKU002-1', 2, '500g装', 19.90, 25.00, 150, 40, '{"weight":"500g"}', 1),
('SKU002-2', 2, '1kg装', 29.90, 35.00, 150, 46, '{"weight":"1kg"}', 1),
('SKU003-1', 3, '30枚装', 35.00, 45.00, 100, 120, '{"quantity":"30枚"}', 1),
('SKU003-2', 3, '60枚装', 58.00, 68.00, 100, 95, '{"quantity":"60枚"}', 1),
('SKU004-1', 4, '3kg装', 39.90, 49.00, 200, 180, '{"weight":"3kg"}', 1),
('SKU004-2', 4, '6kg装', 69.90, 89.00, 200, 162, '{"weight":"6kg"}', 1),
('SKU005-1', 5, '6包×120抽', 29.90, 39.00, 300, 280, '{"spec":"6包×120抽"}', 1),
('SKU005-2', 5, '12包×120抽', 45.90, 59.00, 300, 248, '{"spec":"12包×120抽"}', 1),
('SKU006-1', 6, '10片装', 79.00, 99.00, 80, 100, '{"quantity":"10片"}', 1),
('SKU006-2', 6, '20片装', 139.00, 159.00, 70, 86, '{"quantity":"20片"}', 1),
('SKU007-1', 7, '60g', 99.00, 119.00, 100, 140, '{"weight":"60g"}', 1),
('SKU007-2', 7, '100g', 129.00, 149.00, 100, 127, '{"weight":"100g"}', 1);

-- ========================================
-- 6. 首页轮播图
-- ========================================
INSERT INTO banners (title, image_url, link_type, link_value, sort_order, status) VALUES
('春季生鲜大促', '/assets/images/banners/spring-sale.png', 2, '4', 1, 1),
('新用户专享优惠', '/assets/images/banners/new-user.png', 3, '/pages/coupons/index', 2, 1),
('精选商品推荐', '/assets/images/banners/featured.png', 1, '1', 3, 1);

-- ========================================
-- 7. 系统配置
-- ========================================
INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
('shop_name', '在线购物商城', 'string', '商城名称'),
('shop_logo', '/assets/images/system/shop-logo.png', 'string', '商城 Logo'),
('contact_phone', '400-123-4567', 'string', '客服电话'),
('free_delivery_amount', '99.00', 'number', '满额包邮金额'),
('default_delivery_fee', '10.00', 'number', '默认配送费'),
('order_auto_cancel_minutes', '30', 'number', '订单自动取消时间（分钟）'),
('order_auto_finish_days', '7', 'number', '订单自动完成时间（天）'),
('after_sale_apply_days', '7', 'number', '售后申请时效（天）');

-- ========================================
-- 8. 配送区域与配送费
-- ========================================
INSERT INTO delivery_areas (province_code, province_name, city_code, city_name, district_code, district_name, is_available) VALUES
('110000', '北京市', '110100', '北京市', '110101', '东城区', 1),
('110000', '北京市', '110100', '北京市', '110102', '西城区', 1),
('110000', '北京市', '110100', '北京市', '110105', '朝阳区', 1),
('110000', '北京市', '110100', '北京市', '110106', '丰台区', 1),
('110000', '北京市', '110100', '北京市', '110108', '海淀区', 1);

INSERT INTO delivery_fees (area_id, min_amount, base_fee, free_fee) VALUES
(1, 99.00, 10.00, 1),
(2, 99.00, 10.00, 1),
(3, 99.00, 10.00, 1),
(4, 99.00, 10.00, 1),
(5, 99.00, 10.00, 1);

SELECT '初始化数据插入完成' AS message;
