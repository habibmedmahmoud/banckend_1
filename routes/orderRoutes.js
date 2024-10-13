const express = require('express');
const router = express.Router();

// Importer le contrôleur de commande
const { createOrder  , getAllOrders  , getUserOrders , getOrderDetails } = require('../controllers/OrderController');

// Route pour insérer une commande
router.post('/', createOrder);
// مسار لاسترجاع جميع الطلبات لمستخدم معين
router.get('/', getAllOrders);

// router.get('/:userId', getordersview); // pending

// استرجاع جميع الطلبات الخاصة بمستخدم معين
router.get('/:id', getUserOrders);

// استرجاع تفاصيل طلب معين
router.get('/details/:id', getOrderDetails);





module.exports = router;
