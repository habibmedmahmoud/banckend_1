// controllers/productController.js
const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product'); // Assurez-vous d'importer le modèle Product
const Favorite = require('../models/favorite');
const { Types } = mongoose; // Importation de Types



// Fonction pour rechercher les produits
const searchProducts = async (req, res) => {
    try {
      // Récupération du terme de recherche depuis la requête
      const search = (req.query.search || '').trim();
  
      // Vérification si un terme de recherche est fourni
      if (!search) {
        return res.status(400).json({ message: 'Veuillez fournir un terme de recherche' });
      }
  
      // Recherche dans MongoDB avec les expressions régulières (similaire à LIKE en SQL)
      const products = await Product.find({
        $or: [
          { products_name: { $regex: search, $options: 'i' } }, // Recherche dans le champ products_name
          { products_name_ar: { $regex: search, $options: 'i' } } // Recherche dans le champ products_name_ar
        ]
      });
  
      // Si aucun produit n'est trouvé
      if (products.length === 0) {
        return res.status(404).json({ message: 'Aucun produit trouvé' });
      }
  
      // Retourner les produits trouvés
      res.json(products);
  
    } catch (err) {
      // Gestion des erreurs serveur
      res.status(500).json({ message: 'Erreur serveur', error: err });
    }
  };

  const getProductsByCategory = async (req, res) => {
    const categoryId = req.params.categoryId; // _id الخاص بالفئة
    const userId = req.query.userId; // يمكن أن يكون undefined إذا لم يتم تمريره

    try {
        // ابحث عن المنتجات التي تنتمي إلى الفئة باستخدام الحقل products_cat
        const products = await Product.find({ products_cat: categoryId }).lean();

        // إذا كان userId موجودًا، احصل على المنتجات المفضلة
        let favorites = [];
        if (userId) {
            favorites = await Favorite.find({ favorite_usersid: userId }).lean();
        }

        // قائمة بمعرفات المنتجات المفضلة للمستخدم
        const favoriteProductIds = favorites.map(fav => fav.favorite_productsid.toString());

        // إعادة هيكلة البيانات لتحديد ما إذا كانت المنتجات مفضلة أو غير مفضلة وحساب السعر المخفض
        const result = products.map(product => {
            const isFavorite = favoriteProductIds.includes(product._id.toString());
            const discountedPrice = product.products_price - (product.products_price * product.products_discount / 100);
            return {
                ...product,
                favorite: isFavorite ? 1 : 0, // 1 للمنتجات المفضلة و 0 لغير المفضلة
                productspricediscount: discountedPrice
            };
        });

        // إذا لم توجد منتجات في هذه الفئة
        if (result.length === 0) {
            return res.status(404).json({ status: "failure", message: "Aucune produit trouvée pour cette catégorie." });
        }

        // إعادة المنتجات المفضلة وغير المفضلة
        res.status(200).json({ status: "success", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "failure", message: "Erreur interne du serveur" });
    }
};











module.exports = {
    getProductsByCategory ,
    searchProducts
   
};
