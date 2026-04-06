-- 11-coupon-categories.sql
-- 优惠券适用分类关联表 (#21)

CREATE TABLE IF NOT EXISTS coupon_categories (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  coupon_id   BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_coupon_cat (coupon_id, category_id),
  KEY idx_coupon_id (coupon_id),
  KEY idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券适用分类关联表';
