-- ============================================
-- Fix #7: delivery_areas 表扩展列
-- 添加配送区域名称、描述及费用（分）列，支持简单区域管理
-- ============================================

USE wechat_shop;

ALTER TABLE delivery_areas
  ADD COLUMN area_name VARCHAR(100) NOT NULL DEFAULT ''
    COMMENT '配送区域名称'
    AFTER id;

ALTER TABLE delivery_areas
  ADD COLUMN description TEXT DEFAULT NULL
    COMMENT '区域描述'
    AFTER area_name;

ALTER TABLE delivery_areas
  ADD COLUMN base_fee_fen INT NOT NULL DEFAULT 0
    COMMENT '基础运费（分）'
    AFTER description;

ALTER TABLE delivery_areas
  ADD COLUMN free_threshold_fen INT NOT NULL DEFAULT 0
    COMMENT '满额包邮门槛（分），0表示不包邮'
    AFTER base_fee_fen;

-- 初始化三个默认配送区域
INSERT INTO delivery_areas (area_name, description, base_fee_fen, free_threshold_fen, province_code, province_name, city_code, city_name, district_code, district_name)
VALUES
  ('同城配送', '市区范围内配送', 500, 9900, 'local', '同城', 'local', '同城', 'local', '同城'),
  ('省内配送', '省内非同城区配送', 800, 19900, 'prov', '省内', 'prov', '省内', 'prov', '省内'),
  ('全国配送', '跨省配送', 1200, 29900, 'nat', '全国', 'nat', '全国', 'nat', '全国');
