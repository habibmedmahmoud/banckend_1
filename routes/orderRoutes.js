const express = require('express');
const router = express.Router();

// Importer le contrôleur de commande
const { createOrder  , getAllOrders , getOrderDetails } = require('../controllers/OrderController');

// Route pour insérer une commande
router.post('/', createOrder);
// مسار لاسترجاع جميع الطلبات لمستخدم معين
router.get('/', getAllOrders);
router.get('/:id', getOrderDetails);



module.exports = router;
