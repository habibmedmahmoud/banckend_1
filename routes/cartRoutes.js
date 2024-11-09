const express = require('express'); // استيراد express
const router = express.Router(); // إنشاء راوتر جديد
const cartController = require('../controllers/cartController'); // استيراد الكنترولر الخاص بالسلة

// تعريف المسارات الخاصة بالسلة
router.post('/add', cartController.addToCart); // إضافة منتج إلى السلة
router.delete('/:usersid/:itemsid', cartController.removeFromCart); // حذف منتج من السلة
router.get('/count/:usersid/:itemsid', cartController.getCountItems); // الحصول على عدد العناصر في السلة
router.get('/cart/:userId', cartController.getCartDataByUser); // الحصول على بيانات السلة للمستخدم


module.exports = router; // تصدير الروتر
