// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {getProductsByCategory,  searchProducts ,getDiscountedProducts  } = require('../controllers/productController');



router.get('/products/category/:categoryId',getProductsByCategory); // المسار الذي ستستخدمه لجلب المنتجات
    

router.get('/products', searchProducts );

// Route لجلب المنتجات التي تحتوي على خصم وحالة المفضلة
router.get('/discounted-products', getDiscountedProducts);


module.exports = router;
