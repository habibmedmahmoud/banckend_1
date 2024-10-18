// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {getProductsByCategory,  searchProducts ,getDiscountedProducts } = require('../controllers/productController');



router.get('/products/category/:categoryId',getProductsByCategory); // المسار الذي ستستخدمه لجلب المنتجات
    

router.get('/products', searchProducts );

// تحديد المسار للمنتجات المخفضة
router.get('/discounted-products/:userId', getDiscountedProducts);



module.exports = router;
