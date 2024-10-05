// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {getProductsByCategory} = require('../controllers/productController');



router.get('/products/category/:categoryId',getProductsByCategory); // المسار الذي ستستخدمه لجلب المنتجات
    

module.exports = router;
