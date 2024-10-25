const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// تسجيل
router.post('/signup', deliveryController.signup);

// تسجيل الدخول
router.post('/login', deliveryController.login);

// Route de vérification du code de vérification
router.post('/verifycode', deliveryController.verifyCode); // Utiliser la fonction verifyCode directement


// Route pour vérifier l'email et envoyer un code de vérification
router.post('/check-email', deliveryController.checkEmail);
router.post('/checkverifycode', deliveryController.checkVerifyCode);
router.post('/reset-password', deliveryController.resetPassword);
router.post('/resend-verify-code', deliveryController.resendVerifyCode);


// Route GET avec un paramètre deliveryId


module.exports = router;
