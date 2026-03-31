-- ============================================
-- Fix #6: after_sales 表扩展列
-- 为存储原 JSON 文件中的额外字段
-- ============================================

USE wechat_shop;

-- 添加 rights_status 列：存储 10/20/30/50/60 五态流转
ALTER TABLE after_sales
  ADD COLUMN rights_status TINYINT NOT NULL DEFAULT 10
    COMMENT '售后状态: 10待审核,20已审核,30已收货,50已完成,60已关闭'
    AFTER status;

-- 添加 goods_items 列：售后商品明细 JSON
ALTER TABLE after_sales
  ADD COLUMN goods_items JSON DEFAULT NULL
    COMMENT '售后商品列表JSON'
    AFTER rights_status;

-- 添加 logistics_vo 列：物流信息 JSON
ALTER TABLE after_sales
  ADD COLUMN logistics_vo JSON DEFAULT NULL
    COMMENT '物流信息JSON'
    AFTER goods_items;

-- 添加 user_name 列：冗余用户名（避免跨表 JOIN）
ALTER TABLE after_sales
  ADD COLUMN user_name VARCHAR(100) DEFAULT NULL
    COMMENT '用户名称(冗余)'
    AFTER user_id;
