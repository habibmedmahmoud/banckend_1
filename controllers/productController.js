// controllers/productController.js
const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product'); // Assurez-vous d'importer le modèle Product
const Favorite = require('../models/favorite');
const { Types } = mongoose; // Importation de Types




const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = new mongoose.Types.ObjectId(req.params.categoryId); // ID التصنيف الذي تم اختياره
        const userId = new mongoose.Types.ObjectId(req.params.userId); // ID المستخدم

        // التحقق من أن التصنيف موجود
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'التصنيف غير موجود'
            });
        }

        // استخدام الـ Aggregation Pipeline لجلب المنتجات الخاصة بالتصنيف المحدد فقط
        const products = await Product.aggregate([
            // فلترة المنتجات بناءً على التصنيف
            {
                $match: {
                    products_cat: categoryId // المنتجات التي تنتمي إلى التصنيف المختار
                }
            },
            // دمج المنتجات مع الفئات للحصول على معلومات الفئة
            {
                $lookup: {
                    from: 'categories',
                    localField: 'products_cat',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            // فك تجميع معلومات الفئة
            {
                $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
            },
            // جلب بيانات المفضلات الخاصة بالمستخدم
            {
                $lookup: {
                    from: 'favorites',
                    localField: '_id',
                    foreignField: 'favorite_productsid',
                    as: 'favoriteInfo'
                }
            },
            // فك تجميع المفضلات
            {
                $unwind: { path: '$favoriteInfo', preserveNullAndEmptyArrays: true }
            },
            // إضافة حقل "favorite" لتحديد ما إذا كان المنتج مفضلاً للمستخدم
            {
                $addFields: {
                    favorite: {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: ['$favoriteInfo.favorite_usersid', userId] }, // تحقق ما إذا كان المنتج مفضلاً
                                    { $ne: ['$favoriteInfo', null] } // المنتج موجود في المفضلة
                                ]
                            },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            // تحديد الحقول التي نريد إرجاعها
            {
                $project: {
                    products_id: '$_id',
                    products_name: 1,
                    products_name_ar: 1,
                    products_desc: 1,
                    products_desc_ar: 1,
                    products_image: 1,
                    products_count: 1,
                    products_active: 1,
                    products_price: 1,
                    products_discount: 1,
                    products_date: 1,
                    'categoryInfo.categories_id': 1,
                    'categoryInfo.categories_name': 1,
                    'categoryInfo.categories_name_ar': 1,
                    'categoryInfo.categories_image': 1,
                    'categoryInfo.categories_datetime': 1,
                    favorite: 1 // إضافة حقل "favorite" في النتائج
                }
            }
        ]);

        // التحقق إذا لم يتم العثور على منتجات
        if (!products.length) {
            return res.status(404).json({ message: "لا توجد منتجات في هذا التصنيف." });
        }

        // إرجاع المنتجات الخاصة بالتصنيف
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
    getProductsByCategory
   
};
