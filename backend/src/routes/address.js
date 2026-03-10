const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * 收货地址路由
 * 前缀: /api/addresses
 * 所有路由都需要JWT认证
 */

// 添加收货地址
router.post('/', authenticate, addressController.addAddress);

// 获取地址列表
router.get('/', authenticate, addressController.getAddressList);

// 更新地址
router.put('/:id', authenticate, addressController.updateAddress);

// 删除地址
router.delete('/:id', authenticate, addressController.deleteAddress);

// 设置默认地址
router.put('/:id/default', authenticate, addressController.setDefaultAddress);

module.exports = router;
