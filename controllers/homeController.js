
const Category = require('../models/category');
const Product = require('../models/product');


// دالة لجلب جميع الفئات والمنتجات مع العلاقات بينها
async function getAllDataHome(req, res) {
    try {
        // جلب جميع الفئات
        const categories = await Category.find();

        // جلب المنتجات التي تحتوي على تخفيض (products_discount مختلف عن 0)
        const products = await Product.find({ products_discount: { $ne: 0 } }).populate('products_cat');

        // إعادة الاستجابة مع البيانات
        return res.status(200).json({
            status: 'success',
            categories: categories,
            products: products.map(product => ({
                _id: product._id, // ID المنتج
                products_name: product.products_name, // اسم المنتج
                products_desc: product.products_desc, // وصف المنتج
                products_image: product.products_image, // صورة المنتج
                products_count: product.products_count, // عدد المنتجات المتاحة
                products_active: product.products_active, // حالة المنتج (مفعل/غير مفعل)
                products_price: product.products_price, // سعر المنتج
                products_discount: product.products_discount, // نسبة الخصم
                categories_id: product.products_cat._id, // ID الفئة
                categories_name: product.products_cat.categories_name, // اسم الفئة
                categories_name_ar: product.products_cat.categories_name_ar, // اسم الفئة بالعربية
                categories_image: product.products_cat.categories_image ,
               
                

            }))
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

module.exports = { getAllDataHome };