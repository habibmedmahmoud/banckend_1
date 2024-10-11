const express = require('express');
const router = express.Router();
const { getCoupon } = require('../controllers/couponController');

// Route POST pour obtenir un coupon valide
router.post('/', getCoupon);

module.exports = router;
