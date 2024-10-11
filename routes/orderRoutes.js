const express = require('express');
const router = express.Router();

// Importer le contrôleur de commande
const { createOrder } = require('../controllers/OrderController');

// Route pour insérer une commande
router.post('/', createOrder);

module.exports = router;
