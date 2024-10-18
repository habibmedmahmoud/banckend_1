const express = require('express');
const router = express.Router();
const { loginAdmin, addCategory, uploadImage ,  deleteCategory , editCategory , getAllCategories} = require('../controllers/adminController'); // Import du contrôleur

// Route POST pour la connexion de l'admin
router.post('/login', loginAdmin);

// Route POST pour ajouter une catégorie
router.post('/add', uploadImage, addCategory);

// Route POST pour supprimer une catégorie
router.post('/delete', deleteCategory);

// Route PUT pour éditer une catégorie
router.put('/edit', uploadImage, editCategory); // Utilisez uploadImage pour gérer l'upload de fichiers

// Route GET pour récupérer toutes les catégories
router.get('/categories', getAllCategories);

module.exports = router;
