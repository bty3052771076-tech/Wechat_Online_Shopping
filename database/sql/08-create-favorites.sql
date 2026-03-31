-- ============================================
-- Fix #12: 收藏功能表
-- ============================================

USE wechat_shop;

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  spu_id BIGINT NOT NULL COMMENT '商品SPU ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_spu (user_id, spu_id),
  KEY idx_user_id (user_id),
  KEY idx_spu_id (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户商品收藏表';
