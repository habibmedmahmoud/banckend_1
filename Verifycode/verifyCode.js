const express = require('express');
const router = express.Router();
const {User}  = require('../models/user');   // Assurez-vous de lier votre modèle User

// Route de vérification du code de vérification
router.post('/verifycode', async (req, res) => {
    const { users_email, verify_code } = req.body;

    try {
        // Rechercher l'utilisateur avec l'email et le code de vérification
        const user = await User.findOne({ users_email, users_verify_code: verify_code });

        if (!user) {
            // Si l'utilisateur n'est pas trouvé ou que le code ne correspond pas
            return res.status(400).json({ status: 'failure', message: 'Incorrect email or verification code.' });
        }

        // Si le code est correct, vous pouvez activer l'utilisateur ou autre action (par ex. mettre à jour users_verify_code)
        user.users_verify_code = "0"; // On réinitialise le code de vérification pour éviter une réutilisation
        await user.save();

        return res.status(200).json({ status: 'success', message: 'Account verified successfully.' });

    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({ status: 'failure', message: error.message });
    }
});

module.exports = router;
