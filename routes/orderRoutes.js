const express = require('express');
const router = express.Router();

// Importer le contrôleur de commande
const { createOrder , getUserOrdersWithStatus , getOrderDetails , deleteOrder ,  getUserOrders  , updateOrderRating} = require('../controllers/OrderController');
// cette partie pour de utilisateur pour de orders 

// Route pour insérer une commande
router.post('/', createOrder);



// Route pour récupérer les commandes d'un utilisateur ayant un orders_status de 4
// archive 
router.get('/:id', getUserOrdersWithStatus);

// Route pour supprimer une commande

router.delete('/deleteOrder',deleteOrder );

// Route pour obtenir les détails de la commande

router.get('/details/:id', getOrderDetails);


// مسار لاسترداد الطلبات بمعرف المستخدم
router.get('/user/:id/orders', getUserOrders);

// Route PUT pour mettre à jour l'évaluation d'une commande

router.put('/rating/:id' , updateOrderRating);





module.exports = router;
