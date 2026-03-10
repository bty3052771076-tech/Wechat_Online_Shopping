const express = require('express');

const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/list', productController.getList);
router.get('/detail/:id', productController.getDetail);
router.get('/categories/list', productController.getCategoriesList);
router.get('/categories/tree', productController.getCategoriesTree);
router.get('/:id/comments/summary', productController.getCommentsSummary);
router.get('/:id/comments', productController.getCommentsList);

module.exports = router;
