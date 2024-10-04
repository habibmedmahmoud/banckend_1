// routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const { addFavorite, deleteFavorite } = require('../controllers/favoriteController');

// Route pour ajouter un favori
router.post('/add', addFavorite);

// Route pour supprimer un favori
router.delete('/delete', deleteFavorite);

module.exports = router;
