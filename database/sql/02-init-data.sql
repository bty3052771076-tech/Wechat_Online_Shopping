-- ========================================
-- 微信小程序"在线购物"初始数据脚本
-- ========================================
-- 数据库: wechat_shop
-- 版本: v1.0
-- 创建日期: 2026-03-04
-- 说明: 插入系统初始化必需的数据
-- ========================================

USE wechat_shop;

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ========================================
-- 1. 管理员数据（密码已使用bcrypt加密）
-- ========================================
-- admin / admin123
-- staff01 / 123456

INSERT INTO admins (username, password, real_name, role, phone, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', 'Admin', 'super_admin', '13800000001', 1),
('staff01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', 'Staff', 'staff', '13800000002', 1);

-- ========================================
-- 2. 测试用户数据
-- ========================================
-- testuser / 123456
-- zhangsan / 123456

INSERT INTO users (username, password, nickname, phone, gender, status) VALUES
('testuser', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', '测试用户', '13800138000', 1, 1),
('zhangsan', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIk.FzJI3FIJp8dVX8L1VfT7NFN6nK3W', '张三', '13900139000', 1, 1);

-- ========================================
-- 3. 商品分类数据（三级分类）
-- ========================================

-- 一级分类
INSERT INTO categories (parent_id, category_name, category_code, icon_url, sort_order, level, status) VALUES
(NULL, '生鲜食品', 'CATEGORY_FRESH', 'https://example.com/icon/fresh.png', 1, 1, 1),
(NULL, '日用百货', 'CATEGORY_DAILY', 'https://example.com/icon/daily.png', 2, 1, 1),
(NULL, '美妆个护', 'CATEGORY_BEAUTY', 'https://example.com/icon/beauty.png', 3, 1, 1);

-- 获取一级分类ID（需要在实际执行后查询）
SET @cat_fresh = LAST_INSERT_ID();
SET @cat_daily = LAST_INSERT_ID() + 1;
SET @cat_beauty = LAST_INSERT_ID() + 2;

-- 二级分类（生鲜食品下）
INSERT INTO categories (parent_id, category_name, category_code, sort_order, level, status) VALUES
(1, '蔬菜水果', 'FRESH_FRUIT', 1, 2, 1),
(1, '肉禽蛋品', 'FRESH_MEAT', 2, 2, 1),
(1, '海鲜水产', 'FRESH_SEAFOOD', 3, 2, 1);

-- 二级分类（日用百货下）
INSERT INTO categories (parent_id, category_name, category_code, sort_order, level, status) VALUES
(2, '厨房用品', 'DAILY_KITCHEN', 1, 2, 1),
(2, '家居清洁', 'DAILY_CLEAN', 2, 2, 1),
(2, '纸品湿巾', 'DAILY_PAPER', 3, 2, 1);

-- 二级分类（美妆个护下）
INSERT INTO categories (parent_id, category_name, category_code, sort_order, level, status) VALUES
(3, '面部护理', 'BEAUTY_FACE', 1, 2, 1),
(3, '身体护理', 'BEAUTY_BODY', 2, 2, 1),
(3, '香水彩妆', 'BEAUTY_MAKEUP', 3, 2, 1);

-- ========================================
-- 4. 商品SPU和SKU示例数据
-- ========================================

-- 商品SPU 1: 新鲜苹果
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU001', '新疆阿克苏苹果', '新鲜脆甜 果园直发', 4, '阿克苏', 'https://example.com/products/apple.jpg', 29.90, 59.00, 500, 128, '热销', 1);

SET @spu_apple = LAST_INSERT_ID();

-- 商品SKU 1-1: 小果
INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU001-1', @spu_apple, '小果 2.5kg', 29.90, 39.00, 200, 50, '{"size": "小果", "weight": "2.5kg"}', 1);

-- 商品SKU 1-2: 中果
INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU001-2', @spu_apple, '中果 3kg', 39.90, 49.00, 200, 50, '{"size": "中果", "weight": "3kg"}', 1);

-- 商品SKU 1-3: 大果
INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU001-3', @spu_apple, '大果 4kg', 49.90, 59.00, 100, 28, '{"size": "大果", "weight": "4kg"}', 1);

-- 商品SPU 2: 有机胡萝卜
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU002', '有机胡萝卜', '无农药残留 健康营养', 4, '有机农场', 'https://example.com/products/carrot.jpg', 19.90, 35.00, 300, 86, '新品', 1);

SET @spu_carrot = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU002-1', @spu_carrot, '500g装', 19.90, 25.00, 150, 40, '{"weight": "500g"}', 1),
('SKU002-2', @spu_carrot, '1kg装', 29.90, 35.00, 150, 46, '{"weight": "1kg"}', 1);

-- 商品SPU 3: 土鸡蛋
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU003', '农家散养土鸡蛋', '散养土蛋 营养丰富', 5, '农家', 'https://example.com/products/egg.jpg', 35.00, 58.00, 200, 215, '热销', 1);

SET @spu_egg = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU003-1', @spu_egg, '30枚装', 35.00, 45.00, 100, 120, '{"quantity": "30枚"}', 1),
('SKU003-2', @spu_egg, '60枚装', 58.00, 68.00, 100, 95, '{"quantity": "60枚"}', 1);

-- 商品SPU 4: 洗衣液
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU004', '立白洗衣液', '深层除菌 除螨去渍', 8, '立白', 'https://example.com/products/detergent.jpg', 39.90, 89.00, 400, 342, '热销', 1);

SET @spu_detergent = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU004-1', @spu_detergent, '3kg装', 39.90, 49.00, 200, 180, '{"weight": "3kg"}', 1),
('SKU004-2', @spu_detergent, '6kg装', 69.90, 89.00, 200, 162, '{"weight": "6kg"}', 1);

-- 商品SPU 5: 抽纸
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU005', '维达抽纸', '3层加厚 亲肤柔软', 9, '维达', 'https://example.com/products/tissue.jpg', 29.90, 49.00, 600, 528, '热销', 1);

SET @spu_tissue = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU005-1', @spu_tissue, '6包x120抽', 29.90, 39.00, 300, 280, '{"spec": "6包x120抽"}', 1),
('SKU005-2', @spu_tissue, '12包x120抽', 45.90, 59.00, 300, 248, '{"spec": "12包x120抽"}', 1);

-- 商品SPU 6: 面膜
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU006', '补水保湿面膜', '深层补水 温和不刺激', 10, '美即', 'https://example.com/products/mask.jpg', 79.00, 159.00, 150, 186, '新品', 1);

SET @spu_mask = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU006-1', @spu_mask, '10片装', 79.00, 99.00, 80, 100, '{"quantity": "10片"}', 1),
('SKU006-2', @spu_mask, '20片装', 139.00, 159.00, 70, 86, '{"quantity": "20片"}', 1);

-- 商品SPU 7: 洗面奶
INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, min_sale_price, max_line_price, total_stock, sold_num, tags, status) VALUES
('SPU007', '氨基酸洗面奶', '温和清洁 深层保湿', 10, '芙丽芳丝', 'https://example.com/products/cleanser.jpg', 99.00, 149.00, 200, 267, '热销', 1);

SET @spu_cleanser = LAST_INSERT_ID();

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status) VALUES
('SKU007-1', @spu_cleanser, '60g', 99.00, 119.00, 100, 140, '{"weight": "60g"}', 1),
('SKU007-2', @spu_cleanser, '100g', 129.00, 149.00, 100, 127, '{"weight": "100g"}', 1);

-- ========================================
-- 5. 轮播图数据
-- ========================================

INSERT INTO banners (title, image_url, link_type, link_value, sort_order, status) VALUES
('春季生鲜大促', 'https://example.com/banners/spring-sale.jpg', 2, '4', 1, 1),
('新人专享优惠', 'https://example.com/banners/new-user.jpg', 3, '/pages/coupons/index', 2, 1),
('精选商品推荐', 'https://example.com/banners/featured.jpg', 1, 'SPU001', 3, 1);

-- ========================================
-- 6. 系统配置数据
-- ========================================

INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
('shop_name', '在线购物商城', 'string', '商城名称'),
('shop_logo', 'https://example.com/logo.png', 'string', '商城Logo'),
('contact_phone', '400-123-4567', 'string', '客服电话'),
('free_delivery_amount', '99.00', 'number', '满额包邮金额'),
('default_delivery_fee', '10.00', 'number', '默认运费'),
('order_auto_cancel_minutes', '30', 'number', '订单自动取消时间（分钟）'),
('order_auto_finish_days', '7', 'number', '订单自动完成时间（天）'),
('after_sale_apply_days', '7', 'number', '售后申请期限（天）');

-- ========================================
-- 7. 配送区域示例数据
-- ========================================

-- 北京市
INSERT INTO delivery_areas (province_code, province_name, city_code, city_name, district_code, district_name, is_available) VALUES
('110000', '北京市', '110100', '北京市', '110101', '东城区', 1),
('110000', '北京市', '110100', '北京市', '110102', '西城区', 1),
('110000', '北京市', '110100', '北京市', '110105', '朝阳区', 1),
('110000', '北京市', '110100', '北京市', '110106', '丰台区', 1),
('110000', '北京市', '110100', '北京市', '110108', '海淀区', 1);

-- 配送费用配置
INSERT INTO delivery_fees (area_id, min_amount, base_fee, free_fee) VALUES
(1, 99.00, 10.00, 1),
(2, 99.00, 10.00, 1),
(3, 99.00, 10.00, 1),
(4, 99.00, 10.00, 1),
(5, 99.00, 10.00, 1);

-- ========================================
-- 初始数据插入完成
-- ========================================
SELECT '✅ 初始数据插入完成！' AS message;
SELECT COUNT(*) AS admin_count FROM admins;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS category_count FROM categories;
SELECT COUNT(*) AS product_count FROM product_spus;
SELECT COUNT(*) AS sku_count FROM product_skus;
SELECT COUNT(*) AS banner_count FROM banners;
SELECT COUNT(*) AS config_count FROM system_configs;
