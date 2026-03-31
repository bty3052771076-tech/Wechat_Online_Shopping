const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

router.get('/', promotionController.getList.bind(promotionController));
router.get('/:id', promotionController.getDetail.bind(promotionController));

module.exports = router;
