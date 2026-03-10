const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * 购物车路由
 * 前缀: /api/cart
 * 所有路由都需要JWT认证
 */

// 加入购物车
router.post('/add', authenticate, cartController.addToCart);

// 获取购物车列表
router.get('/list', authenticate, cartController.getCartList);

// 修改购物车
router.put('/update', authenticate, cartController.updateCartItem);

// 删除购物车商品
router.delete('/delete/:id', authenticate, cartController.deleteCartItem);

module.exports = router;
