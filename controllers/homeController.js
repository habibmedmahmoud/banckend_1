
const Category = require('../models/category');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Setting = require('../models/settings');


// دالة لجلب الإعدادات، الفئات، والمنتجات الأكثر مبيعًا
async function getAllDataHome(req, res) {
    try {
        // 1. جلب الإعدادات
        const settings = await Setting.find();

        // 2. جلب الفئات
        const categories = await Category.find();

        // 3. جلب المنتجات الأكثر مبيعًا باستخدام Aggregate
        const topSellingProducts = await Cart.aggregate([
            { $match: { cart_orders: { $ne: 0 } } }, // الطلبات غير الصفرية
            {
                $lookup: {
                    from: 'products', // اسم مجموعة المنتجات
                    localField: 'cart_productid', // الحقل في Cart
                    foreignField: '_id', // الحقل في Products
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }, // فك المنتج من المصفوفة
            {
                $group: {
                    _id: '$cart_productid',
                    countitems: { $sum: 1 }, // حساب عدد الطلبات
                    product: { $first: '$productDetails' }
                }
            },
            {
                $project: {
                    _id: 1,
                    countitems: 1,
                    'product.products_name': 1,
                    'product.products_name_ar': 1,
                    'product.products_desc': 1,
                    'product.products_desc_ar': 1,
                    'product.products_image': 1,
                    'product.products_count': 1,
                    'product.products_active': 1,
                    'product.products_price': 1,
                    'product.products_discount': 1,
                    'product.favorite': 1,
                    productpricediscount: {
                        $subtract: [
                            '$product.products_price',
                            {
                                $multiply: [
                                    '$product.products_price',
                                    { $divide: ['$product.products_discount', 100] }
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { countitems: -1 } } // ترتيب تنازلي
        ]);

        // 4. تنسيق البيانات داخل مصفوفة بالشكل المطلوب
        const data = [
            {
                settings: settings.map(setting => ({
                    titleHome: setting.titleHome,
                    bodyHome: setting.bodyHome,
                    deliveryTime: setting.deliveryTime
                }))
            },
            ...categories.map(category => ({ category })),
            { topSellingProducts }
        ];

        // 5. إرسال الاستجابة بشكل JSON
        return res.status(200).json({
            status: 'success',
            data
        });

    } catch (error) {
        // 6. معالجة الأخطاء
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}




module.exports = { getAllDataHome };