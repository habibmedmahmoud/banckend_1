// models/Notification.js

const mongoose = require('mongoose');

// تعريف بنية الإشعار
const notificationSchema = new mongoose.Schema({
  notification_title: {
    type: String,
    required: true,
  },
  notification_body: {
    type: String,
    required: true,
  },
  notification_userid: {
    type: mongoose.Schema.Types.ObjectId, // يمكن أن يكون ObjectId لمعرف المستخدم
    required: true,
  },
}, {
  timestamps: true // لحفظ وقت الإنشاء والتحديث
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
