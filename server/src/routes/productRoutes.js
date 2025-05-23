const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Redirecionar rotas de avaliações para o router de avaliações
router.use('/:productId/reviews', reviewRouter);

// Rotas públicas
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);

// Proteger todas as rotas abaixo
router.use(authController.protect);

// Rotas protegidas
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/images', productController.uploadProductImages);

module.exports = router;
