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


const getDiscountedProducts = async (req, res) => {
    try {
        // جلب جميع المنتجات المفضلة وتحويل IDs إلى ObjectId
        const favoriteProducts = await Favorite.find().select('favorite_productsid');
        const favoriteProductIds = favoriteProducts.map(fav =>
            new mongoose.Types.ObjectId(fav.favorite_productsid) // استخدام 'new'
        );

        // جلب المنتجات التي لديها خصم والتحقق من حالة المفضلة
        const products = await Product.aggregate([
            {
                $match: { products_discount: { $ne: 0 } } // المنتجات التي لديها خصم
            },
            {
                $addFields: {
                    itemspricedisount: {
                        $subtract: [
                            "$products_price",
                            { $multiply: ["$products_price", { $divide: ["$products_discount", 100] }] }
                        ]
                    },
                    favorite: {
                        $cond: {
                            if: { $in: ["$_id", favoriteProductIds] },
                            then: true, // المنتج مفضل
                            else: false // المنتج غير مفضل
                        }
                    }
                }
            }
        ]);

        if (products.length > 0) {
            res.json({ status: 'success', data: products });
        } else {
            res.json({ status: 'failure', message: 'No discounted products found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


module.exports = {
    getProductsByCategory ,
    searchProducts,
    getDiscountedProducts
   
};
