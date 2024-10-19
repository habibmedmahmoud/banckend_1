const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Gestion des fichiers

// Configuration de multer pour l'upload d'images des produits
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/products'); // Nouveau répertoire pour les images des produits
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Filtrage des fichiers pour les produits
const productFileFilter = (req, file, cb) => {
    const allowExt = /jpg|jpeg|png|gif/;
    const isValidExt = allowExt.test(path.extname(file.originalname).toLowerCase());
    const isValidMimetype = allowExt.test(file.mimetype);

    if (isValidExt && isValidMimetype) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier invalide. Seuls .jpg, .jpeg, .png, .gif sont autorisés.'));
    }
};

// Configuration de multer pour les produits
const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2 Mo
    fileFilter: productFileFilter,
});

// Middleware d'upload d'images pour les produits
exports.uploadProductImage = (req, res, next) => {
    uploadProduct.single('files')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
