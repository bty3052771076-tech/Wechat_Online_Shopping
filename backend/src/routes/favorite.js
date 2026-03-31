const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authenticate } = require('../middlewares/auth');

// 全部需要用户认证
router.get('/', authenticate, favoriteController.getList.bind(favoriteController));
router.post('/', authenticate, favoriteController.add.bind(favoriteController));
router.delete('/:spuId', authenticate, favoriteController.remove.bind(favoriteController));
router.get('/check/:spuId', authenticate, favoriteController.check.bind(favoriteController));

module.exports = router;
