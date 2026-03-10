const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminProductController = require('../controllers/admin-product.controller');
const adminOrderController = require('../controllers/admin-order.controller');
const adminUserController = require('../controllers/admin-user.controller');
const adminDeliveryController = require('../controllers/admin-delivery.controller');
const adminAfterSaleController = require('../controllers/admin-after-sale.controller');
const { requireAdminAuth } = require('../middlewares/admin-auth');

router.post('/login', adminController.login);
router.get('/profile', requireAdminAuth, adminController.getProfile);
router.put('/password', requireAdminAuth, adminController.changePassword);

router.get('/products', requireAdminAuth, adminProductController.getProducts);
router.get('/products/:id', requireAdminAuth, adminProductController.getProductDetail);
router.post('/products', requireAdminAuth, adminProductController.createProduct);
router.put('/products/:id', requireAdminAuth, adminProductController.updateProduct);
router.delete('/products/:id', requireAdminAuth, adminProductController.deleteProduct);

router.get('/orders', requireAdminAuth, adminOrderController.getOrders);
router.get('/orders/:idOrOrderNo', requireAdminAuth, adminOrderController.getOrderDetail);
router.put('/orders/:idOrOrderNo/ship', requireAdminAuth, adminOrderController.shipOrder);

router.get('/users', requireAdminAuth, adminUserController.getUsers);
router.get('/users/:id', requireAdminAuth, adminUserController.getUserDetail);
router.put('/users/:id/remark', requireAdminAuth, adminUserController.updateRemark);

router.get('/delivery-areas', requireAdminAuth, adminDeliveryController.getList);
router.post('/delivery-areas', requireAdminAuth, adminDeliveryController.create);
router.put('/delivery-areas/:id', requireAdminAuth, adminDeliveryController.update);
router.delete('/delivery-areas/:id', requireAdminAuth, adminDeliveryController.remove);

router.get('/after-sales', requireAdminAuth, adminAfterSaleController.getList);
router.get('/after-sales/:id', requireAdminAuth, adminAfterSaleController.getDetail);
router.put('/after-sales/:id/audit', requireAdminAuth, adminAfterSaleController.audit);

module.exports = router;
