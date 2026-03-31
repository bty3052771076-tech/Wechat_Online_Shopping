-- ========================================
-- 商品评论表迁移
-- 2026-03-30: 修复待修正项 #2 — 评论提交功能
-- ========================================
USE wechat_shop;

CREATE TABLE IF NOT EXISTS product_comments (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spu_id BIGINT NOT NULL COMMENT '商品SPU ID',
  order_id BIGINT DEFAULT NULL COMMENT '订单ID（可选关联）',
  order_no VARCHAR(50) DEFAULT NULL COMMENT '订单号',
  user_id BIGINT NOT NULL COMMENT '评价用户ID',
  sku_spec_info VARCHAR(200) DEFAULT NULL COMMENT 'SKU规格信息文本',
  comment_score TINYINT NOT NULL DEFAULT 5 COMMENT '评分：1-5',
  comment_content TEXT DEFAULT NULL COMMENT '评价内容',
  comment_resources JSON DEFAULT NULL COMMENT '图片/视频资源 JSON数组',
  is_anonymous TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否匿名：0否，1是',
  is_auto_comment TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动评价：0否，1是',
  seller_reply TEXT DEFAULT NULL COMMENT '商家回复',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0隐藏，1显示',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_spu_id (spu_id),
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_status_spu (status, spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评论表';
