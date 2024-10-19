// routes/address.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Route pour ajouter une adresse
router.post('/add', addressController.addAddress); // Utiliser addAddress
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.get('/:usersid', addressController.getAllAddresses);

module.exports = router;
