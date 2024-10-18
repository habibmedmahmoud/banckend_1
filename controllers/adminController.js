const bcrypt = require('bcryptjs');
const { Admin } = require('../models/admin'); // Import du modèle Admin
const Category = require('../models/category'); // Assurez-vous que le modèle Category est correctement importé
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Assurez-vous que cette ligne est présente

// Fonction de connexion d'un administrateur
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Recherche de l'admin avec l'email donné
        const admin = await Admin.findOne({ admin_email: email });
        if (!admin) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        // Comparaison du mot de passe
        const validPassword = await bcrypt.compare(password, admin.admin_password);
        if (!validPassword) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        res.status(200).json({ message: 'Connexion réussie' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Fonction pour ajouter une catégorie
exports.addCategory = async (req, res) => {
    try {
        console.log(req.body); // Ajoutez cette ligne pour déboguer

        const name = req.body.name;
        const namear = req.body.namear;

        // Vérifiez si le fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }

        const imagename = req.file.filename; // Nom de l'image uploadée

        const newCategory = new Category({
            categories_name: name,
            categories_name_ar: namear,
            categories_image: imagename,
        });

        await newCategory.save();
        res.status(201).json({ message: 'Catégorie ajoutée avec succès', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la catégorie', error: error.message });
    }
};

// Fonction pour supprimer une catégorie
exports.deleteCategory = async (req, res) => {
    const { id, imagename } = req.body; // Récupérer l'ID et le nom de l'image

    try {
        // Supprimer le fichier de l'image
        deleteFile(path.join(__dirname, '../uploads/categories', imagename));

        // Supprimer la catégorie de la base de données
        const result = await Category.findByIdAndDelete(id); // Utilisation de Mongoose pour supprimer la catégorie

        if (!result) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        res.status(200).json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie', error: error.message });
    }
};

// Fonction pour éditer une catégorie
exports.editCategory = async (req, res) => {
    const { id, name, namear, imageold } = req.body;

    try {
        // Vérifiez si l'id est valide
        if (!id) {
            return res.status(400).json({ message: "ID de catégorie requis" });
        }

        // Vérifiez si un nouveau fichier a été uploadé
        let imagename;
        if (req.file) {
            imagename = req.file.filename;

            // Supprimez l'ancienne image
            if (imageold) {
                const oldImagePath = path.join(__dirname, '../uploads/categories', imageold);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Créez l'objet de données à mettre à jour
        const updatedData = {
            categories_name: name,
            categories_name_ar: namear,
        };

        // Ajoutez le champ de l'image uniquement si un nouveau fichier a été uploadé
        if (imagename) {
            updatedData.categories_image = imagename;
        }

        // Mettez à jour la catégorie dans la base de données
        const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        res.status(200).json({ message: 'Catégorie mise à jour avec succès', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie', error: error.message });
    }
};

// Fonction pour obtenir toutes les catégories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // Récupérer toutes les catégories de la base de données

        res.status(200).json({
            message: 'Catégories récupérées avec succès',
            categories: categories
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories', error: error.message });
    }
};

// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Supprime le fichier
    }
};

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/categories'); // Chemin vers le répertoire
        cb(null, dir); // Définir le chemin de destination
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Obtenir l'extension du fichier
        cb(null, uniqueSuffix + ext); // Nom du fichier avec une partie unique
    }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
    const allowExt = /jpg|jpeg|png|gif/; // Extensions autorisées
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
    limits: { fileSize: 2 * 1024 * 1024 }, // Limite de taille de fichier (2 Mo)
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
