const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, OrderController.createOrder);
router.post('/auction', authMiddleware, OrderController.createOrderFromAuction);
router.get('/buyer', authMiddleware, OrderController.getBuyerOrders);
router.get('/seller', authMiddleware, OrderController.getSellerOrders);
router.get('/:id', authMiddleware, OrderController.getOrderById);
router.put('/:id/status', authMiddleware, OrderController.updateOrderStatus);
router.put('/:id/tracking', authMiddleware, OrderController.addTracking);

module.exports = router;
