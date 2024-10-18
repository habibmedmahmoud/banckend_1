// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route pour ajouter un produit au panier
router.post('/add-to-cart', cartController.addToCart);
router.delete('/delete-from-cart', cartController.deleteFromCart);
router.get('/get-count-products/:usersid/:productsid', cartController.getCountProducts);
router.get('/:userid', cartController.getCartDataByUser);




module.exports = router;
