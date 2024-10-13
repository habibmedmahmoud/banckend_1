// routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const { getMyFavorites , removeFavorite ,toggleFavorite } = require('../controllers/favoriteController');



router.get('/', getMyFavorites );

router.post('/toggle',toggleFavorite );

router.post('/remove-favorite',removeFavorite );







module.exports = router;
