const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * 用户端路由
 * 前缀: /api/users
 */

// 用户注册（不需要认证）
router.post('/register', userController.register);

// 用户登录（不需要认证）
router.post('/login', userController.login);

// 获取用户信息（需要认证）
router.get('/profile', authenticate, userController.getProfile);

// 更新用户信息（需要认证）
router.put('/profile', authenticate, userController.updateProfile);

module.exports = router;
