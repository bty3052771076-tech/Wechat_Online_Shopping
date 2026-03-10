-- WeChat Mini Program Backend - Database Schema
-- MySQL 8.0+ compatible

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS wechat_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wechat_shop;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT 'WeChat OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT 'WeChat UnionID',
    nickname VARCHAR(100) DEFAULT NULL COMMENT 'User nickname',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT 'Avatar URL',
    gender TINYINT DEFAULT 0 COMMENT '0: unknown, 1: male, 2: female',
    phone VARCHAR(20) DEFAULT NULL COMMENT 'Phone number',
    status TINYINT DEFAULT 1 COMMENT '0: disabled, 1: enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User information';

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT DEFAULT 0 COMMENT 'Parent category ID, 0 for top-level',
    name VARCHAR(50) NOT NULL COMMENT 'Category name',
    icon VARCHAR(200) DEFAULT NULL COMMENT 'Category icon URL',
    sort_order INT DEFAULT 0 COMMENT 'Sort order',
    status TINYINT DEFAULT 1 COMMENT '0: disabled, 1: enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product categories';

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL COMMENT 'Category ID',
    name VARCHAR(200) NOT NULL COMMENT 'Product name',
    description TEXT COMMENT 'Product description',
    main_image VARCHAR(200) NOT NULL COMMENT 'Main product image',
    images JSON COMMENT 'Additional product images',
    price DECIMAL(10,2) NOT NULL COMMENT 'Current price',
    original_price DECIMAL(10,2) DEFAULT NULL COMMENT 'Original price',
    stock INT DEFAULT 0 COMMENT 'Stock quantity',
    sales INT DEFAULT 0 COMMENT 'Sales count',
    status TINYINT DEFAULT 1 COMMENT '0: disabled, 1: enabled, 2: out of stock',
    sort_order INT DEFAULT 0 COMMENT 'Sort order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_sales (sales DESC),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product information';

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    product_id INT NOT NULL COMMENT 'Product ID',
    quantity INT DEFAULT 1 COMMENT 'Quantity',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Shopping cart';

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT 'Order number',
    user_id INT NOT NULL COMMENT 'User ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT 'Total amount',
    status TINYINT DEFAULT 1 COMMENT '0: cancelled, 1: pending, 2: paid, 3: shipped, 4: completed',
    payment_status TINYINT DEFAULT 0 COMMENT '0: unpaid, 1: paid',
    payment_time TIMESTAMP NULL COMMENT 'Payment time',
    ship_time TIMESTAMP NULL COMMENT 'Shipping time',
    receive_time TIMESTAMP NULL COMMENT 'Receipt time',
    remark VARCHAR(500) DEFAULT NULL COMMENT 'Order remarks',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Order information';

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT 'Order ID',
    product_id INT NOT NULL COMMENT 'Product ID',
    product_name VARCHAR(200) NOT NULL COMMENT 'Product name (snapshot)',
    product_image VARCHAR(200) NOT NULL COMMENT 'Product image (snapshot)',
    price DECIMAL(10,2) NOT NULL COMMENT 'Product price (snapshot)',
    quantity INT NOT NULL COMMENT 'Quantity',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Order items';

-- Shipping addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    consignee VARCHAR(50) NOT NULL COMMENT 'Consignee name',
    phone VARCHAR(20) NOT NULL COMMENT 'Phone number',
    province VARCHAR(50) NOT NULL COMMENT 'Province',
    city VARCHAR(50) NOT NULL COMMENT 'City',
    district VARCHAR(50) NOT NULL COMMENT 'District',
    detail_address VARCHAR(200) NOT NULL COMMENT 'Detailed address',
    is_default TINYINT DEFAULT 0 COMMENT '0: not default, 1: default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Shipping addresses';

-- Insert sample categories
INSERT INTO categories (parent_id, name, icon, sort_order, status) VALUES
(0, '推荐', 'icon-recommend', 1, 1),
(0, '食品', 'icon-food', 2, 1),
(0, '饮料', 'icon-drink', 3, 1),
(0, '日用品', 'icon-daily', 4, 1),
(0, '数码', 'icon-digital', 5, 1);

-- Insert sample products
INSERT INTO products (category_id, name, description, main_image, price, original_price, stock, sales, status, sort_order) VALUES
(1, '特惠商品A', '这是一个示例商品', 'https://via.placeholder.com/400x400', 99.00, 129.00, 100, 50, 1, 1),
(2, '美味零食', '健康美味的休闲零食', 'https://via.placeholder.com/400x400', 29.90, 39.90, 200, 120, 1, 2),
(3, '新鲜果汁', '100%纯天然果汁', 'https://via.placeholder.com/400x400', 15.00, 20.00, 150, 80, 1, 3);

-- Create view for product statistics
CREATE OR REPLACE VIEW v_product_stats AS
SELECT
    p.id,
    p.name,
    p.price,
    p.stock,
    p.sales,
    c.name AS category_name,
    (SELECT COUNT(*) FROM order_items WHERE product_id = p.id) AS order_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status IN (1, 2);

-- Create trigger for order status update
DELIMITER $$

CREATE TRIGGER after_order_payment
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 1 AND OLD.payment_status = 0 THEN
        SET NEW.payment_time = NOW();
    END IF;

    IF NEW.status = 3 AND OLD.status != 3 THEN
        SET NEW.ship_time = NOW();
    END IF;

    IF NEW.status = 4 AND OLD.status != 4 THEN
        SET NEW.receive_time = NOW();
    END IF;
END$$

DELIMITER ;
