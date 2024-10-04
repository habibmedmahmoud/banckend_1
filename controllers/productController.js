// controllers/productController.js
const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product'); // Assurez-vous d'importer le modèle Product
const Favorite = require('../models/favorite');
const { Types } = mongoose; // Importation de Types

// وظيفة لاسترجاع جميع المنتجات مع الفئات المرتبطة
const getAllProducts = async (req, res) => {
    try {
        // جلب جميع المنتجات مع ملء البيانات المرتبطة بالفئة (products_cat)
        const products = await Product.find().populate('products_cat');

        // إرجاع المنتجات في JSON
        res.status(200).json({
            status: 'success',
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


// Fonction pour récupérer les produits par catégorie
const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = new mongoose.Types.ObjectId(req.params.categoryId); // ID de la catégorie
        const userId = new mongoose.Types.ObjectId(req.params.userId); // ID de l'utilisateur

        // Vérifier si la catégorie existe
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'La catégorie n\'existe pas'
            });
        }

        // Récupérer les produits favoris de l'utilisateur dans cette catégorie
        const favoriteProductIds = await Favorite.find({ favorite_usersid: userId })
            .select('favorite_productsid')
            .lean()
            .exec();

        const favoriteProductIdsArray = favoriteProductIds.map(fav => fav.favorite_productsid);

        // Récupérer tous les produits de la catégorie
        const products = await Product.aggregate([
            {
                $match: {
                    products_cat: categoryId
                }
            },
            {
                $addFields: {
                    favorite: {
                        $cond: {
                            if: { $in: ['$_id', favoriteProductIdsArray] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            {
                $project: {
                    products_name: 1,
                    products_name_ar: 1,
                    products_desc: 1,
                    products_desc_ar: 1,
                    products_image: 1,
                    products_price: 1,
                    products_discount: 1,
                    favorite: 1 // Inclure le champ 'favorite'
                }
            }
        ]);

        // Retourner les produits avec l'indicateur 'favorite'
        res.status(200).json({
            status: 'success',
            products: products
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des produits par catégorie :', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur'
        });
    }
};




module.exports = {
    
    getAllProducts,
    getProductsByCategory,
    // getProductById ,
};
