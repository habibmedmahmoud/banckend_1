// controllers/productController.js
const mongoose = require('mongoose');
const Category = require('../models/category');
const  Product  = require('../models/product'); // Assurez-vous d'importer le modèle Product

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

// دالة للحصول على جميع المنتجات في فئة معينة
const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        // تحقق ما إذا كانت الفئة موجودة
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'الفئة غير موجودة'
            });
        }

        // جلب المنتجات التي تنتمي إلى الفئة
        const products = await Product.find({ products_cat: categoryId }).populate('products_cat');

        // إرجاع المنتجات في JSON
        res.status(200).json({
            status: 'success',
            products: products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم'
        });
    }
};


// دالة للحصول على منتج بواسطة ID
// const getProductById = async (req, res) => {
//     try {
//         // تحويل ID إلى ObjectId
//         const productId = new mongoose.Types.ObjectId(req.params.id); // إضافة new هنا

//         // العثور على المنتج مع تفاصيل الفئة
//         const product = await Product.findById(productId).populate('products_cat');

//         // التحقق مما إذا كان المنتج موجودًا
//         if (!product) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'المنتج غير موجود'
//             });
//         }

//         // إرجاع المنتج
//         res.status(200).json({
//             status: 'success',
//             product: product
//         });
//     } catch (error) {
//         console.error('Error fetching product:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'خطأ في الخادم'
//         });
//     }
// };

module.exports = {
    
    getAllProducts,
    getProductsByCategory,
    // getProductById ,
};
