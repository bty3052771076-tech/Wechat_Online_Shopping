const express = require('express');

const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/list', productController.getList);
router.get('/detail/:id', productController.getDetail);
router.get('/categories/list', productController.getCategoriesList);
router.get('/categories/tree', productController.getCategoriesTree);
router.get('/:id/comments/summary', productController.getCommentsSummary);
router.get('/:id/comments', productController.getCommentsList);
// 提交评价（需登录）
router.post('/:id/comments', authenticate, productController.submitComment);

module.exports = router;
