-- ============================================
-- Fix #11: 首页轮播图种子数据
-- 对应 home-adapters.js 原有的 3 张硬编码图片
-- ============================================

USE wechat_shop;

INSERT INTO banners (title, image_url, link_type, link_value, sort_order, status)
VALUES
  ('春季大促', '/assets/images/banners/spring-sale.png', NULL, NULL, 1, 1),
  ('新人专享', '/assets/images/banners/new-user.png', NULL, NULL, 2, 1),
  ('精选好物', '/assets/images/banners/featured.png', NULL, NULL, 3, 1);
