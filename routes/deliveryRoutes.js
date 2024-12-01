const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
// auth 
// تسجيل
router.post('/signup', deliveryController.signup);

// تسجيل الدخول
router.post('/login', deliveryController.login);

// Route de vérification du code de vérification
router.post('/verifycode', deliveryController.verifyCode); // Utiliser la fonction verifyCode directement

// forgetpassword 
// Route pour vérifier l'email et envoyer un code de vérification
router.post('/check-email', deliveryController.checkEmail);
router.post('/checkverifycode', deliveryController.checkVerifyCode);
router.post('/reset-password', deliveryController.resetPassword);
router.post('/resend-verify-code', deliveryController.resendVerifyCode);


// orders

// Define the route to get filtered orders by delivery ID
// accepted  
router.get('/accepted/delivery/:id', deliveryController.getFilteredOrders);
// approve 
router.post('/approve-order', deliveryController.approveOrder);

// Route pour récupérer les commandes par livreur et statut
router.get('/archive/delivery/:id', deliveryController.fetchOrdersForDelivery);
// Route pour récupérer les détails d'une commande
//details 
router.get('/details/:id', deliveryController.fetchOrderDetails); 
// done 
// Route pour mettre à jour le statut de la commande et envoyer les notifications
router.post('/update-order', deliveryController.updateOrderStatusAndNotify);
// // pending 
// Route pour récupérer les commandes avec les adresses
router.get('/orders', deliveryController.getOrdersWithAddress);




module.exports = router;
