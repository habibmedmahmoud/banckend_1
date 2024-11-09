const bcrypt = require('bcryptjs');
const { Admin } = require('../models/admin'); // Modèle Admin
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Gestion des fichiers
const { sendEmail }= require('../Email/testEmail');

// Fonction de connexion d'un administrateur
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ admin_email: email });
        if (!admin) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        const validPassword = await bcrypt.compare(password, admin.admin_password);
        if (!validPassword) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        // Convertir l'admin en objet et supprimer le mot de passe
        const adminData = admin.toObject();
        delete adminData.admin_password; // Supprimer le mot de passe de l'objet

        res.status(200).json({ message: 'Connexion réussie', admin: adminData });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};


// Fonction de vérification du code de vérification pour un admin
exports.verifyAdminCode = async (req, res) => {
    const { admin_email, verify_code } = req.body;

    try {
        // Rechercher l'admin avec l'email et le code de vérification
        const admin = await Admin.findOne({ 
            admin_email, 
            admin_verify_code: verify_code 
        });

        if (!admin) {
            // Si l'admin n'est pas trouvé ou que le code ne correspond pas
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Incorrect email or verification code.' 
            });
        }

        // Si le code est correct, mettre à jour les champs appropriés
        admin.admin_verify_code = verify_code; // Réinitialiser le code de vérification
        admin.admin_approve = 1; // Approuver l'admin

        // Sauvegarder les modifications
        await admin.save();

        return res.status(200).json({ 
            status: 'success', 
            message: 'Admin account verified successfully.' 
        });

    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({ 
            status: 'failure', 
            message: error.message 
        });
    }
};

// Contrôleur pour renvoyer le code de vérification à un admin
exports.resendVerifyCode = async (req, res) => {
    const { admin_email } = req.body;

    // Générer un nouveau code de vérification à 5 chiffres
    const newVerifyCode = Math.floor(10000 + Math.random() * 90000);

    try {
        // Mettre à jour le code de vérification de l'admin
        const updatedAdmin = await Admin.findOneAndUpdate(
            { admin_email: admin_email },
            { admin_verify_code: newVerifyCode },
            { new: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin non trouvé' });
        }

        // Envoyer l'email avec le nouveau code de vérification
        await sendEmail(
            admin_email,
            "Code de vérification",
            `Votre nouveau code de vérification est : ${newVerifyCode}`
        );

        // Réponse en cas de succès
        res.status(200).json({ message: 'Nouveau code de vérification renvoyé avec succès' });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du code de vérification :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// pour de notifi



// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/categories');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
    const allowExt = /jpg|jpeg|png|gif/;
    const isValidExt = allowExt.test(path.extname(file.originalname).toLowerCase());
    const isValidMimetype = allowExt.test(file.mimetype);

    if (isValidExt && isValidMimetype) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier invalide. Seuls .jpg, .jpeg, .png, .gif sont autorisés.'));
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter,
});

// Middleware d'upload d'images
exports.uploadImage = (req, res, next) => {
    upload.single('files')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
