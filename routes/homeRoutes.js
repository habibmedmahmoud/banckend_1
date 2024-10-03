const express = require('express');
const router = express.Router();
const { getAllDataHome  } =  require('../controllers/homeController');

router.get('/home',  getAllDataHome );

// Exporter le routeur
module.exports = router;