const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticate } = require('../middlewares/auth');

// 公开接口：获取可领取的优惠券列表
router.get('/', couponController.getAvailable.bind(couponController));

// 以下需要用户认证
// 获取当前用户的优惠券（?status=default|useless|disabled）
router.get('/user', authenticate, couponController.getUserCoupons.bind(couponController));
// 获取优惠券适用商品列表（公开，#21）
router.get('/:id/goods', couponController.getGoods.bind(couponController));
// 领取优惠券
router.post('/:id/claim', authenticate, couponController.claim.bind(couponController));

module.exports = router;
