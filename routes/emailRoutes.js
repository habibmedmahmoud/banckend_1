const express = require('express');
const router = express.Router();
const checkEmailController = require('../controllers/checkEmailController'); // Importez le contrôleur

// Route pour vérifier l'email et envoyer un code de vérification
router.post('/check-email', checkEmailController.checkEmail);
router.post('/checkverifycode', checkEmailController.checkVerifyCode);
router.post('/reset-password', checkEmailController.resetPassword);


module.exports = router;
