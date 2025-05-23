const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Proteger todas as rotas
router.use(authController.protect);

// Rotas para utilizadores normais
router.get('/myorders', orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.patch('/:id/pay', orderController.updateOrderToPaid);
router.patch('/:id/cancel', orderController.cancelOrder);

// Rotas apenas para administradores
router.use(authController.restrictTo('admin'));
router.get('/', orderController.getAllOrders);
router.patch('/:id/deliver', orderController.updateOrderToDelivered);

module.exports = router;
