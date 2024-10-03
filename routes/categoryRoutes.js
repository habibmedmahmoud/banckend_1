const express = require('express');
const router = express.Router();
const {
   
    getAllCategories,
  
} = require('../controllers/categoryController');

// // Route pour créer une nouvelle catégorie
// router.post('/categories', createCategory);

// Route pour obtenir toutes les catégories
router.get('/categories', getAllCategories);

// // Route pour obtenir une catégorie par ID
// router.get('/categories/:id', getCategoryById);

// // Route pour mettre à jour une catégorie
// router.put('/categories/:id', updateCategory);

// // Route pour supprimer une catégorie
// router.delete('/categories/:id', deleteCategory);

module.exports = router;
