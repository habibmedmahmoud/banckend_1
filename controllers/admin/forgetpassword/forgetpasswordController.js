const { Admin } = require('../../../models/admin');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const  { sendEmail } = require('../../../Email/testEmail');

// Vérification de l'e-mail et envoi du code de vérification
exports.checkEmail = async (req, res) => {
    const { admin_email } = req.body;

    try {
        // Vérifier si l'administrateur existe
        const admin = await Admin.findOne({ admin_email: admin_email });

        if (!admin) {
            return res.status(404).json({ message: `Administrateur avec l'email ${admin_email} non trouvé` });
        }

        // Générer un code de vérification
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // Mettre à jour le code de vérification dans la base de données
        admin.admin_verify_code = verifyCode;
        await admin.save();

        // Envoyer l'e-mail avec le code de vérification
        const subject = 'Code de vérification pour l\'admin';
        const text = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(admin_email, subject, text);

        res.status(200).json({ message: 'Code de vérification envoyé à l\'email de l\'administrateur' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// 
// Vérification du code de vérification
exports.checkVerifyCode = async (req, res) => {
    const { admin_email, verify_code } = req.body;

    try {
        // Chercher l'admin par email et code de vérification
        const admin = await Admin.findOne({ 
            admin_email, 
            admin_verify_code: verify_code 
        });

        if (!admin) {
            return res.status(404).json({ message: 'Code de vérification incorrect ou email invalide' });
        }

        // Réinitialiser le code de vérification (optionnel)
        admin.admin_verify_code = verify_code ;
        await admin.save();

        return res.status(200).json({ message: 'Vérification réussie', data: admin });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { admin_email, newPassword } = req.body;

    try {
        // Vérifier si l'admin existe
        const admin = await Admin.findOne({ admin_email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin non trouvé' });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        admin.admin_password = hashedPassword;
        await admin.save();

        // Envoyer un e-mail de confirmation (optionnel)
        const subject = 'Votre mot de passe a été réinitialisé';
        const text = 'Votre mot de passe a été mis à jour avec succès.';
        await sendEmail(admin_email, subject, text);

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



