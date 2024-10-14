// routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const { getMyFavorites , removeFavorite ,toggleFavorite ,deleteFavoriteById} = require('../controllers/favoriteController');



router.get('/:userId', getMyFavorites );

router.post('/toggle',toggleFavorite );

router.post('/remove-favorite',removeFavorite );
router.delete('/:id', deleteFavoriteById);







module.exports = router;
