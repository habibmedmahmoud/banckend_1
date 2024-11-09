const Notification = require('../models/notification');
const  { sendNotificationToTopic } = require('../notificationService');


// دالة لإدخال الإشعار وإرساله إلى FCM
async function insertNotify({ title, body, userid, topic, pageid, pagename }) {
  try {
      // إدخال الإشعار في قاعدة البيانات
      const newNotification = new Notification({
          notification_title: title,
          notification_body: body,
          notification_userid: userid,
      });
      
      const result = await newNotification.save();

      // إرسال الإشعار إلى FCM
      await sendNotificationToTopic(title, body, topic, pageid, pagename);

      // إرجاع النتيجة في حال الحاجة
      return { message: 'تم إدخال الإشعار وإرساله بنجاح', notification: result };
  } catch (error) {
      // إلقاء الخطأ ليتم التعامل معه في الدالة `approveOrder`
      throw new Error('حدث خطأ أثناء معالجة الطلب: ' + error.message);
  }
}


  // دالة لاسترداد جميع الإشعارات بناءً على معرف المستخدم
const getAllNotifications = async (req, res) => {
  const userid = req.params.userid;

  try {
      // استرداد جميع الإشعارات حيث `notification_userid` يطابق `userid`
      const notifications = await Notification.find({ notification_userid: userid });

      res.status(200).json(notifications);
  } catch (error) {
      res.status(500).json({ message: 'حدث خطأ أثناء استرداد الإشعارات', error: error.message });
  }
};




  module.exports = {
    insertNotify,
    getAllNotifications 
    
  };