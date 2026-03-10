const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminProductController = require('../controllers/admin-product.controller');
const adminOrderController = require('../controllers/admin-order.controller');
const { requireAdminAuth } = require('../middlewares/admin-auth');

/**
 * 管理端路由
 * 前缀: /api/admin
 */

// 管理员登录（不需要认证）
router.post('/login', adminController.login);

// 获取管理员信息（需要认证）
router.get('/profile', requireAdminAuth, adminController.getProfile);

// 修改密码（需要认证）
router.put('/password', requireAdminAuth, adminController.changePassword);

/**
 * 商品管理路由（需要管理员权限）
 */

// 获取商品列表
router.get('/products', requireAdminAuth, adminProductController.getProducts);

// 添加商品
router.post('/products', requireAdminAuth, adminProductController.createProduct);

// 更新商品
router.put('/products/:id', requireAdminAuth, adminProductController.updateProduct);

// 删除商品
router.delete('/products/:id', requireAdminAuth, adminProductController.deleteProduct);

/**
 * 订单管理路由（需要管理员权限）
 */

// 获取订单列表
router.get('/orders', requireAdminAuth, adminOrderController.getOrders);

// 订单发货
router.put('/orders/:id/ship', requireAdminAuth, adminOrderController.shipOrder);

module.exports = router;
