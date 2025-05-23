const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Obter todas as avaliações (públicas)
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

// Proteger todas as rotas abaixo
router.use(authController.protect);

// Rotas protegidas
router.post('/', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.patch('/:id/like', reviewController.likeReview);
router.patch('/:id/dislike', reviewController.dislikeReview);

// Rotas apenas para administradores
router.use(authController.restrictTo('admin'));
router.patch('/:id/verify', reviewController.verifyReview);

module.exports = router;
