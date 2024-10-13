const express = require('express');
const { insertNotify } = require('../controllers/notificationController');

const router = express.Router();

// Route pour envoyer et enregistrer une notification
router.post('/send', insertNotify);

module.exports = router;
