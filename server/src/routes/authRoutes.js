const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rotas públicas
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Rotas protegidas
router.use(authController.protect);
router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);
router.delete('/deleteMe', authController.deleteMe);
router.patch('/updateMyPassword', authController.updateMyPassword);

module.exports = router;
