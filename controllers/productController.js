// controllers/productController.js
const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product'); // Assurez-vous d'importer le modèle Product
const Favorite = require('../models/favorite');
const { Types } = mongoose; // Importation de Types



// Fonction de recherche des produits
const searchProducts = async (req, res) => {
  try {
      const search = req.query.search || ''; // Récupérer le terme de recherche
      const regex = new RegExp(search, 'i'); // Utiliser une expression régulière pour la recherche insensible à la casse

      const products = await Product.find({
          $or: [
              { products_name: regex },
              { products_name_ar: regex }
          ]
      }).populate('products_cat'); // Utiliser populate si vous voulez inclure les détails de la catégorie

      res.status(200).json(products); // Retourner les résultats trouvés
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la recherche des produits' });
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
                favorite: isFavorite ? 1 : product.favorite, // Utiliser le champ favorite du produit
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


// دالة لجلب المنتجات المخفضة
async function getDiscountedProducts(req, res) {
  try {
      const userId = req.params.userId;

      // التحقق من صلاحية userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ status: 'failure', message: 'Invalid user ID' });
      }

      // جلب المنتجات المفضلة للمستخدم
      const favoriteProducts = await Favorite.find({ favorite_usersid: userId }).select('favorite_productsid');
      const favoriteProductIds = favoriteProducts.map(fav => fav.favorite_productsid);

      // جلب المنتجات المخفضة في المفضلة
      const favoriteDiscountedProducts = await Product.find({
          _id: { $in: favoriteProductIds },
          products_discount: { $ne: 0 }
      }).lean();

      favoriteDiscountedProducts.forEach(product => {
          product.favorite = true;
          product.products_price_discount = product.products_price - (product.products_price * product.products_discount / 100);
      });

      // جلب المنتجات المخفضة غير الموجودة في المفضلة
      const nonFavoriteDiscountedProducts = await Product.find({
          _id: { $nin: favoriteProductIds },
          products_discount: { $ne: 0 }
      }).lean();

      nonFavoriteDiscountedProducts.forEach(product => {
          product.favorite = false;
          product.products_price_discount = product.products_price - (product.products_price * product.products_discount / 100);
      });

      // دمج النتائج
      const allProducts = [...favoriteDiscountedProducts, ...nonFavoriteDiscountedProducts];

      // إرجاع البيانات
      if (allProducts.length > 0) {
          res.json({ status: 'success', data: allProducts });
      } else {
          res.json({ status: 'failure', message: 'No discounted products found' });
      }
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}


module.exports = {
    getProductsByCategory ,
    searchProducts,
    getDiscountedProducts
   
};
