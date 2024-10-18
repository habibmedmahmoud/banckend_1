const express = require('express');
const router = express.Router();

// Importer le contrôleur de commande
const { createOrder  , getAllOrders  , getUserOrders , getOrderDetails , deleteOrder , getArchivedOrders , updateOrder } = require('../controllers/OrderController');

// Route pour insérer une commande
router.post('/', createOrder);
// مسار لاسترجاع جميع الطلبات لمستخدم معين
router.get('/', getAllOrders);

// router.get('/:userId', getordersview); // pending

// استرجاع جميع الطلبات الخاصة بمستخدم معين
router.get('/:id', getUserOrders);

// مسار حذف الطلب
router.delete('/:id',deleteOrder );


// استرجاع تفاصيل طلب معين
router.get('/details/:id', getOrderDetails);


// مسار لاسترجاع الطلبات المؤرشفة
router.get('/archive/:id', getArchivedOrders);


// Route pour mettre à jour une commande
router.put('/update', updateOrder);



module.exports = router;
