-- Seed: 为 Issue #21 优惠券分类筛选功能添加测试数据
-- File: database/seed-coupon-categories.sql
-- Purpose: 创建示例优惠券并绑定到相应分类，用于前端测试
-- Date: 2026-04-07
-- Status: COMPLETED - 所有数据已通过 scripts/seed-coupon-categories.js 初始化

-- 数据配置概览:
-- 优惠券 id=1 (新人满50减10) → 分类: 1(生鲜食品), 4(蔬菜水果), 5(肉禽蛋品), 6(海鲜水产), 18(食品饮料)
-- 优惠券 id=2 (满100减20)  → 分类: 7(厨房用品), 8(家居清洁), 9(纸品湿巾)
-- 优惠券 id=3 (9折优惠券)   → 分类: 10(面部护理), 11(身体护理), 12(香水彩妆)

-- 注意: 这个SQL文件仅供参考和文档。实际的数据初始化通过以下脚本执行:
-- node backend/scripts/seed-coupon-categories.js

-- === 以下是数据初始化的SQL记录（仅供参考，不应再次执行） ===

-- 优惠券 id=1 绑定到分类 1, 4, 5, 6, 18
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (1, 1, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (1, 4, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (1, 5, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (1, 6, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (1, 18, NOW());

-- 优惠券 id=2 绑定到分类 7, 8, 9
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (2, 7, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (2, 8, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (2, 9, NOW());

-- 优惠券 id=3 绑定到分类 10, 11, 12
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (3, 10, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (3, 11, NOW());
-- INSERT INTO coupon_categories (coupon_id, category_id, created_at) VALUES (3, 12, NOW());

-- 验证查询（用于确认数据已初始化）
-- SELECT c.id, c.coupon_name, GROUP_CONCAT(cc.category_id) as category_ids, COUNT(cc.id) as count
-- FROM coupons c
-- LEFT JOIN coupon_categories cc ON c.id = cc.coupon_id
-- WHERE c.id IN (1, 2, 3)
-- GROUP BY c.id;
