const Category = require('../../../models/category'); // Assurez-vous que le chemin est correct
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction pour ajouter une catégorie
exports.addCategory = async (req, res) => {
    try {
        const name = req.body.name;
        const namear = req.body.namear;

        if (!name || !namear) {
            return res.status(400).json({ message: 'Les champs nom et nom en arabe sont requis.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }

        const imagename = req.file.filename;

        const newCategory = new Category({
            categories_name: name,
            categories_name_ar: namear,
            categories_image: imagename,
        });

        await newCategory.save();
        res.status(201).json({ status: 'succès', data: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la catégorie', error: error.message });
    }
};

// Fonction pour supprimer une catégorie
exports.deleteCategory = async (req, res) => {
    const { id, imagename } = req.body;

    try {
        const oldImagePath = path.join(__dirname, '../uploads/categories', imagename);
        deleteFile(oldImagePath); // Supprime le fichier d'image

        const result = await Category.findByIdAndDelete(id);

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
        if (!id) {
            return res.status(400).json({ message: "ID de catégorie requis" });
        }

        let imagename;
        if (req.file) {
            imagename = req.file.filename;

            if (imageold) {
                const oldImagePath = path.join(__dirname, '../uploads/categories', imageold);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedData = {
            categories_name: name,
            categories_name_ar: namear,
        };

        if (imagename) {
            updatedData.categories_image = imagename;
        }

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
        const categories = await Category.find();

        res.status(200).json({
            status: 'succès',
            data: categories
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories', error: error.message });
    }
};
