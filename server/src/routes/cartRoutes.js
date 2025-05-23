const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

// Proteger todas as rotas
router.use(authController.protect);

// Rotas para o carrinho
router.get('/', cartController.getMyCart);
router.post('/items', cartController.addItemToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
