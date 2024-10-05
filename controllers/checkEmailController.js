const { User} = require('../models/user'); 
const crypto = require('crypto'); 
const bcrypt = require('bcryptjs');

const  { sendEmail } = require('../Email/testEmail');

// Contrôleur pour vérifier l'e-mail et envoyer un code de vérification
exports.checkEmail = async (req, res) => {
    const { users_email } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ users_email: users_email });

        if (!user) {
            return res.status(404).json({ message: `Utilisateur avec l'email ${users_email} non trouvé` });
        }

        // Générer un code de vérification
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // Mettre à jour le code de vérification dans la base de données
        user.users_verify_code = verifyCode;
        await user.save();

        // Envoyer l'e-mail avec le code de vérification
        const subject = 'Code de vérification pour Ecommerce';
        const text = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(users_email, subject, text);

        res.status(200).json({ message: 'Code de vérification envoyé à l\'email' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour vérifier le code de vérification
exports.checkVerifyCode = async (req, res) => {
    const { users_email, verify_code } = req.body;

    try {
        // Vérifier si l'utilisateur existe avec l'email et le code de vérification
        const user = await User.findOne({ users_email: users_email, users_verify_code: verify_code });

        if (!user) {
            return res.status(404).json({ message: 'Code de vérification incorrect ou email invalide' });
        }

        // Si la vérification est réussie, tu peux continuer avec l'activation de l'utilisateur ou autre action
        return res.status(200).json({ message: 'Vérification réussie', data: user });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }


};

// Contrôleur pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
    const { users_email, newPassword } = req.body; // Supposons que vous envoyez un nouvel e-mail et un nouveau mot de passe dans la requête

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ users_email: users_email });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur
        user.users_password = hashedPassword;
        await user.save();

        // (Optionnel) Envoyer un e-mail de confirmation
        const subject = 'Votre mot de passe a été réinitialisé';
        const text = 'Votre mot de passe a été mis à jour avec succès.';
        await sendEmail(users_email, subject, text); // Utilisez users_email ici

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Fonction pour renvoyer le code de vérification
exports.resendVerifyCode = async (req, res) => {
    const { users_email } = req.body; // Supposons que l'email est envoyé dans le corps de la requête

    // Générer un nouveau code de vérification (vous pouvez le modifier selon vos besoins)
    const newVerifyCode = Math.floor(100000 + Math.random() * 900000); // Générer un code à 6 chiffres

    try {
        // Mettre à jour le code de vérification de l'utilisateur
        const updatedUser = await User.findOneAndUpdate(
            { users_email: users_email },
            { users_verify_code: newVerifyCode },
            { new: true } // Retourner l'utilisateur mis à jour
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Envoyer l'email avec le nouveau code de vérification
        await sendEmail(users_email, "Code de vérification", `Votre nouveau code de vérification est : ${newVerifyCode}`);

        res.status(200).json({ message: 'Nouveau code de vérification renvoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du code de vérification :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


