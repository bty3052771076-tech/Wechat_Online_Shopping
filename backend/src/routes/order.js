const express = require('express');

const orderController = require('../controllers/order.controller');
const afterSaleController = require('../controllers/after-sale.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/create', authenticate, orderController.createOrder);
router.get('/list', authenticate, orderController.getOrderList);
router.put('/:orderNo/pay', authenticate, orderController.payOrder);
router.put('/:orderNo/cancel', authenticate, orderController.cancelOrder);

router.get('/after-sales/preview', authenticate, afterSaleController.getPreview);
router.get('/after-sales/reasons', authenticate, afterSaleController.getReasons);
router.get('/after-sales/logistics-companies', authenticate, afterSaleController.getLogisticsCompanies);
router.get('/after-sales', authenticate, afterSaleController.getList);
router.get('/after-sales/:rightsNo', authenticate, afterSaleController.getDetail);
router.post('/after-sales/apply', authenticate, afterSaleController.apply);
router.put('/after-sales/:rightsNo/cancel', authenticate, afterSaleController.cancel);
router.put('/after-sales/:rightsNo/logistics', authenticate, afterSaleController.updateLogistics);

router.put('/:orderNo/confirm-received', authenticate, afterSaleController.confirmReceived);
router.get('/detail/:id', authenticate, orderController.getOrderDetail);

module.exports = router;
