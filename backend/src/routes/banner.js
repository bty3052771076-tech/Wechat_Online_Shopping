const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');

// 公开接口，不需要认证
router.get('/', bannerController.getList.bind(bannerController));

module.exports = router;
