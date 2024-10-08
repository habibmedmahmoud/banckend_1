const Category = require('../models/category');

// // Créer une nouvelle catégorie
// exports.createCategory = async (req, res) => {
//     const { categories_name, categories_name_ar, categories_image } = req.body;

//     try {
//         // Créer une nouvelle catégorie
//         const newCategory = new Category({
//             categories_name,
//             categories_name_ar,
//             categories_image
//         });

//         // Sauvegarder la catégorie dans la base de données
//         const savedCategory = await newCategory.save();
//         res.status(201).json({
//             status: 'success',
//             data: savedCategory
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };

// // Obtenir toutes les catégories
// exports.getAllCategories = async (req, res) => {
//     try {
//         const categories = await Category.find();

//         if (categories.length > 0) {
//             res.status(200).json({
//                 status: 'success',
//                 data: categories
//             });
//         } else {
//             res.status(404).json({
//                 status: 'failure',
//                 message: 'Aucune catégorie trouvée'
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };

// // Obtenir une catégorie par ID
// exports.getCategoryById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const category = await Category.findById(id);

//         if (!category) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Catégorie non trouvée'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             data: category
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };

// // Mettre à jour une catégorie
// exports.updateCategory = async (req, res) => {
//     const { id } = req.params;
//     const { categories_name, categories_name_ar, categories_image } = req.body;

//     try {
//         const updatedCategory = await Category.findByIdAndUpdate(
//             id,
//             { categories_name, categories_name_ar, categories_image },
//             { new: true, runValidators: true }
//         );

//         if (!updatedCategory) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Catégorie non trouvée'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             data: updatedCategory
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };

// // Supprimer une catégorie
// exports.deleteCategory = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const deletedCategory = await Category.findByIdAndDelete(id);

//         if (!deletedCategory) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Catégorie non trouvée'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Catégorie supprimée avec succès'
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };
