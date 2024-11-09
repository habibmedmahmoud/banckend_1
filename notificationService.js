const admin = require("firebase-admin");

// تهيئة Firebase Admin باستخدام ملف مفتاح الخدمة
const serviceAccount = require("./user-app-firebase-a9e59-firebase-adminsdk-cdl8u-8a71a9726a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// دالة لإرسال إشعار إلى موضوع (topic) محدد
async function sendNotificationToTopic(title, body, topic, pageid = "", pagename = "") {
  const message = {
    topic: topic, // اسم الموضوع الذي سيتم إرسال الإشعار له
    notification: {
      title: title,
      body: body,
    },
    data: {
      pageid: pageid,
      pagename: pagename,
    },
  };

  try {
    // إرسال الرسالة إلى Firebase Cloud Messaging
    const response = await admin.messaging().send(message);
    console.log("تم إرسال الرسالة بنجاح:", response);
  } catch (error) {
    console.error("خطأ أثناء إرسال الرسالة:", error);
  }
}


module.exports = {
  sendNotificationToTopic,
};

// // استدعاء الدالة مع القيم المطلوبة للإشعار
// sendNotificationToTopic(
//   "Titre de la notification",      // عنوان الإشعار
//   "Contenu de la notification",    // محتوى الإشعار
//   "users6707407c09aac849e3f822d8", // الـ topic المطلوب
//   "",                              // معرف الصفحة (يمكن تركه فارغًا)
//   ""                               // اسم الصفحة (يمكن تركه فارغًا)
// );
