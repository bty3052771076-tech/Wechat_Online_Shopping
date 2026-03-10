-- ========================================
-- 微信小程序"在线购物"数据库建表脚本
-- ========================================
-- 数据库: wechat_shop
-- 版本: v1.0
-- 创建日期: 2026-03-04
-- 表数量: 24张
-- ========================================

-- 如果数据库不存在则创建
CREATE DATABASE IF NOT EXISTS wechat_shop
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE wechat_shop;

-- ========================================
-- 用户模块（3张表）
-- ========================================

-- 1. 普通用户表
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名，唯一',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  nickname VARCHAR(50) DEFAULT NULL COMMENT '微信昵称',
  avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号，唯一',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱，唯一',
  gender TINYINT NOT NULL DEFAULT 0 COMMENT '性别：0未知，1男，2女',
  openid VARCHAR(100) DEFAULT NULL COMMENT '微信OpenID，唯一',
  unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
  register_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1正常',
  total_orders INT NOT NULL DEFAULT 0 COMMENT '总订单数',
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '总消费金额（元）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_phone (phone),
  UNIQUE KEY uk_email (email),
  UNIQUE KEY uk_openid (openid),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='普通用户表';

-- 2. 管理员表
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名，唯一',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
  role VARCHAR(20) NOT NULL COMMENT '角色：super_admin, staff',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1正常',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 3. 用户收货地址表
DROP TABLE IF EXISTS user_addresses;
CREATE TABLE user_addresses (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人手机号',
  province_code VARCHAR(20) NOT NULL COMMENT '省份编码',
  province_name VARCHAR(50) NOT NULL COMMENT '省份名称',
  city_code VARCHAR(20) NOT NULL COMMENT '城市编码',
  city_name VARCHAR(50) NOT NULL COMMENT '城市名称',
  district_code VARCHAR(20) NOT NULL COMMENT '区县编码',
  district_name VARCHAR(50) NOT NULL COMMENT '区县名称',
  detail_address VARCHAR(200) NOT NULL COMMENT '详细地址',
  postal_code VARCHAR(10) DEFAULT NULL COMMENT '邮政编码',
  is_default TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认：0否，1是',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收货地址表';

-- ========================================
-- 商品模块（9张表）
-- ========================================

-- 4. 商品分类表
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  parent_id BIGINT DEFAULT NULL COMMENT '父分类ID，NULL为一级',
  category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
  category_code VARCHAR(20) DEFAULT NULL COMMENT '分类编码',
  icon_url VARCHAR(500) DEFAULT NULL COMMENT '分类图标URL',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  level TINYINT NOT NULL DEFAULT 1 COMMENT '分类层级：1/2/3',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 5. 商品SPU表
DROP TABLE IF EXISTS product_spus;
CREATE TABLE product_spus (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spu_code VARCHAR(50) NOT NULL COMMENT 'SPU编码，唯一',
  title VARCHAR(200) NOT NULL COMMENT '商品标题',
  subtitle VARCHAR(200) DEFAULT NULL COMMENT '商品副标题',
  category_id BIGINT NOT NULL COMMENT '分类ID',
  brand VARCHAR(50) DEFAULT NULL COMMENT '品牌',
  primary_image VARCHAR(500) NOT NULL COMMENT '主图URL',
  detail_images TEXT DEFAULT NULL COMMENT '详情图URL，JSON数组',
  product_detail TEXT DEFAULT NULL COMMENT '商品详情HTML',
  min_sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '最低售价（元）',
  max_line_price DECIMAL(10,2) DEFAULT NULL COMMENT '最高划线价（元）',
  total_stock INT NOT NULL DEFAULT 0 COMMENT '总库存',
  sold_num INT NOT NULL DEFAULT 0 COMMENT '已售数量',
  tags VARCHAR(100) DEFAULT NULL COMMENT '标签：热销、新品',
  production_date DATE DEFAULT NULL COMMENT '生产日期',
  shelf_life INT DEFAULT NULL COMMENT '保质期（天）',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0下架，1上架',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_spu_code (spu_code),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_sold_num (sold_num DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SPU表';

-- 6. 商品SKU表
DROP TABLE IF EXISTS product_skus;
CREATE TABLE product_skus (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  sku_code VARCHAR(50) NOT NULL COMMENT 'SKU编码，唯一',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  sku_name VARCHAR(100) NOT NULL COMMENT 'SKU名称',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '售价（元）',
  line_price DECIMAL(10,2) DEFAULT NULL COMMENT '划线价（元）',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存',
  sales INT NOT NULL DEFAULT 0 COMMENT '销量',
  specs JSON DEFAULT NULL COMMENT '规格组合JSON',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_sku_code (sku_code),
  INDEX idx_spu_id (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SKU表';

-- 7. 商品规格定义表
DROP TABLE IF EXISTS product_specs;
CREATE TABLE product_specs (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  spec_name VARCHAR(50) NOT NULL COMMENT '规格名称：颜色、尺寸',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_spu_id (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格定义表';

-- 8. 商品规格值表
DROP TABLE IF EXISTS product_spec_values;
CREATE TABLE product_spec_values (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spec_id BIGINT NOT NULL COMMENT '规格ID',
  spec_value VARCHAR(50) NOT NULL COMMENT '规格值：红色、XL',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_spec_id (spec_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格值表';

-- 9. 商品SPU标签关联表
DROP TABLE IF EXISTS product_spu_tags;
CREATE TABLE product_spu_tags (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  tag_name VARCHAR(20) NOT NULL COMMENT '标签名称',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_spu_id (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SPU标签关联表';

-- 10. 商品图片表
DROP TABLE IF EXISTS product_images;
CREATE TABLE product_images (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
  image_type TINYINT NOT NULL DEFAULT 1 COMMENT '类型：1主图，2轮播，3详情',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_spu_id (spu_id),
  INDEX idx_image_type (image_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';

-- 11. 商品库存日志表
DROP TABLE IF EXISTS product_stock_logs;
CREATE TABLE product_stock_logs (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  sku_id BIGINT NOT NULL COMMENT 'SKU ID',
  change_type TINYINT NOT NULL COMMENT '变动类型：1入库，2出库，3调整',
  change_quantity INT NOT NULL COMMENT '变动数量',
  before_stock INT NOT NULL COMMENT '变动前库存',
  after_stock INT NOT NULL COMMENT '变动后库存',
  order_no VARCHAR(32) DEFAULT NULL COMMENT '关联订单号',
  remark VARCHAR(200) DEFAULT NULL COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_sku_id (sku_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品库存日志表';

-- 12. 商品浏览历史表
DROP TABLE IF EXISTS product_browse_history;
CREATE TABLE product_browse_history (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_spu_id (spu_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品浏览历史表';

-- ========================================
-- 购物车模块（1张表）
-- ========================================

-- 13. 购物车表
DROP TABLE IF EXISTS shopping_cart;
CREATE TABLE shopping_cart (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  sku_id BIGINT NOT NULL COMMENT 'SKU ID',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  is_checked TINYINT NOT NULL DEFAULT 1 COMMENT '是否选中',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_sku (user_id, sku_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ========================================
-- 订单模块（3张表）
-- ========================================

-- 14. 订单主表
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  order_no VARCHAR(32) NOT NULL COMMENT '订单号，唯一',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '配送费',
  pay_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
  receiver_name VARCHAR(50) NOT NULL COMMENT '收货人',
  receiver_phone VARCHAR(20) NOT NULL COMMENT '收货电话',
  receiver_address VARCHAR(500) NOT NULL COMMENT '收货地址',
  order_remark VARCHAR(200) DEFAULT NULL COMMENT '订单备注',
  order_status TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态：1待付款，2待发货，3待收货，4待评价，5已完成，6已取消，7退款中，8已退款',
  pay_status TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态：0未支付，1已支付，2已退款',
  pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
  delivery_status TINYINT NOT NULL DEFAULT 0 COMMENT '发货状态：0未发货，1已发货，2已签收',
  delivery_company VARCHAR(50) DEFAULT NULL COMMENT '快递公司',
  delivery_no VARCHAR(50) DEFAULT NULL COMMENT '快递单号',
  delivery_time DATETIME DEFAULT NULL COMMENT '发货时间',
  finish_time DATETIME DEFAULT NULL COMMENT '完成时间',
  cancel_time DATETIME DEFAULT NULL COMMENT '取消时间',
  cancel_reason VARCHAR(200) DEFAULT NULL COMMENT '取消原因',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_order_status (order_status),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单主表';

-- 15. 订单商品明细表
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  order_no VARCHAR(32) NOT NULL COMMENT '订单号',
  spu_id BIGINT NOT NULL COMMENT 'SPU ID',
  sku_id BIGINT NOT NULL COMMENT 'SKU ID',
  product_title VARCHAR(200) NOT NULL COMMENT '商品标题（快照）',
  product_image VARCHAR(500) NOT NULL COMMENT '商品图片（快照）',
  sku_spec_info VARCHAR(200) DEFAULT NULL COMMENT 'SKU规格（快照）',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '商品单价',
  quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '小计金额',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_order_id (order_id),
  INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';

-- 16. 订单状态日志表
DROP TABLE IF EXISTS order_status_logs;
CREATE TABLE order_status_logs (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  order_no VARCHAR(32) NOT NULL COMMENT '订单号',
  from_status TINYINT DEFAULT NULL COMMENT '原状态',
  to_status TINYINT NOT NULL COMMENT '新状态',
  operator_type TINYINT NOT NULL COMMENT '操作人类型：1用户，2管理员，3系统',
  operator_id BIGINT DEFAULT NULL COMMENT '操作人ID',
  remark VARCHAR(200) DEFAULT NULL COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_order_id (order_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态日志表';

-- ========================================
-- 售后模块（2张表）
-- ========================================

-- 17. 售后申请表
DROP TABLE IF EXISTS after_sales;
CREATE TABLE after_sales (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  after_sale_no VARCHAR(32) NOT NULL COMMENT '售后单号，唯一',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  order_no VARCHAR(32) NOT NULL COMMENT '订单号',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  type TINYINT NOT NULL COMMENT '类型：1退款，2退货',
  reason VARCHAR(200) NOT NULL COMMENT '退款原因',
  description VARCHAR(500) DEFAULT NULL COMMENT '详细说明',
  proof_images JSON DEFAULT NULL COMMENT '凭证图片JSON',
  refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '退款金额',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1待审核，2通过，3驳回',
  audit_remark VARCHAR(200) DEFAULT NULL COMMENT '审核备注',
  audit_time DATETIME DEFAULT NULL COMMENT '审核时间',
  refund_time DATETIME DEFAULT NULL COMMENT '退款时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_after_sale_no (after_sale_no),
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后申请表';

-- 18. 售后处理记录表
DROP TABLE IF EXISTS after_sale_logs;
CREATE TABLE after_sale_logs (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  after_sale_id BIGINT NOT NULL COMMENT '售后单ID',
  operator_type TINYINT NOT NULL COMMENT '操作人类型：1用户，2管理员',
  operator_id BIGINT DEFAULT NULL COMMENT '操作人ID',
  action VARCHAR(50) NOT NULL COMMENT '操作类型',
  content VARCHAR(500) DEFAULT NULL COMMENT '操作内容',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  INDEX idx_after_sale_id (after_sale_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后处理记录表';

-- ========================================
-- 配送模块（2张表）
-- ========================================

-- 19. 配送区域表
DROP TABLE IF EXISTS delivery_areas;
CREATE TABLE delivery_areas (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  province_code VARCHAR(20) NOT NULL COMMENT '省份编码',
  province_name VARCHAR(50) NOT NULL COMMENT '省份名称',
  city_code VARCHAR(20) NOT NULL COMMENT '城市编码',
  city_name VARCHAR(50) NOT NULL COMMENT '城市名称',
  district_code VARCHAR(20) NOT NULL COMMENT '区县编码',
  district_name VARCHAR(50) NOT NULL COMMENT '区县名称',
  is_available TINYINT NOT NULL DEFAULT 1 COMMENT '是否可配送：0否，1是',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_city_code (city_code),
  INDEX idx_district_code (district_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送区域表';

-- 20. 配送费用表
DROP TABLE IF EXISTS delivery_fees;
CREATE TABLE delivery_fees (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  area_id BIGINT NOT NULL COMMENT '区域ID',
  min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '满额包邮（元）',
  base_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '基础运费（元）',
  free_fee TINYINT NOT NULL DEFAULT 0 COMMENT '是否包邮：0否，1是',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_area_id (area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送费用表';

-- ========================================
-- 优惠券模块（2张表）
-- ========================================

-- 21. 优惠券表
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  coupon_name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  coupon_type TINYINT NOT NULL COMMENT '类型：1满减券，2折扣券',
  discount_value DECIMAL(10,2) NOT NULL COMMENT '优惠值：满减金额或折扣比例',
  min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '使用门槛（元）',
  max_discount DECIMAL(10,2) DEFAULT NULL COMMENT '最大优惠金额',
  total_quantity INT NOT NULL DEFAULT 0 COMMENT '发放总量',
  received_quantity INT NOT NULL DEFAULT 0 COMMENT '已领取数量',
  used_quantity INT NOT NULL DEFAULT 0 COMMENT '已使用数量',
  valid_days INT NOT NULL COMMENT '有效天数',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME NOT NULL COMMENT '结束时间',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- 22. 用户优惠券关联表
DROP TABLE IF EXISTS user_coupons;
CREATE TABLE user_coupons (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  coupon_id BIGINT NOT NULL COMMENT '优惠券ID',
  coupon_name VARCHAR(100) NOT NULL COMMENT '优惠券名称（快照）',
  coupon_type TINYINT NOT NULL COMMENT '类型：1满减券，2折扣券',
  discount_value DECIMAL(10,2) NOT NULL COMMENT '优惠值',
  min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '使用门槛',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME NOT NULL COMMENT '结束时间',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1未使用，2已使用，3已过期',
  use_time DATETIME DEFAULT NULL COMMENT '使用时间',
  order_id BIGINT DEFAULT NULL COMMENT '订单ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_status (status),
  INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券关联表';

-- ========================================
-- 系统配置模块（2张表）
-- ========================================

-- 23. 轮播图表
DROP TABLE IF EXISTS banners;
CREATE TABLE banners (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  title VARCHAR(100) NOT NULL COMMENT '轮播图标题',
  image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
  link_type TINYINT NOT NULL COMMENT '跳转类型：1商品详情，2分类页，3自定义链接',
  link_value VARCHAR(200) DEFAULT NULL COMMENT '跳转值',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  start_time DATETIME DEFAULT NULL COMMENT '开始时间',
  end_time DATETIME DEFAULT NULL COMMENT '结束时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- 24. 系统配置表
DROP TABLE IF EXISTS system_configs;
CREATE TABLE system_configs (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  config_key VARCHAR(50) NOT NULL COMMENT '配置键，唯一',
  config_value TEXT DEFAULT NULL COMMENT '配置值',
  config_type VARCHAR(20) NOT NULL COMMENT '类型：string/number/json',
  description VARCHAR(200) DEFAULT NULL COMMENT '配置说明',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ========================================
-- 建表完成
-- ========================================
SELECT '✅ 数据库建表完成！共创建24张表' AS message;
