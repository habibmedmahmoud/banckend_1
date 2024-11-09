// routes/notificationRoutes.js

const express = require('express');
const { insertNotify , getAllNotifications } = require('../controllers/notificationController');

const router = express.Router();

// مسار لإدخال وإرسال الإشعار
router.post('/notify', insertNotify);

// مسار للحصول على جميع الإشعارات بناءً على `userid`
router.get('/notifications/:userid', getAllNotifications);


module.exports = router;