const Notification = require('../models/notification');
const  sendNotificationToTopic  = require('../notificationService');


// دالة لإدخال الإشعار وإرساله إلى FCM
// Fonction pour insérer une notification dans la base de données et l'envoyer à FCM
async function insertNotify(title, body, userid, topic, pageid, pagename) {
  try {
    // Créer une nouvelle notification dans la base de données
    const newNotification = new Notification({
      notification_title: title,
      notification_body: body,
      notification_userid: userid,
    });

    // Sauvegarder la notification dans la base de données
    const result = await newNotification.save();
    console.log("Notification enregistrée:", result);

    // Envoyer la notification à FCM
    await sendNotificationToTopic(title, body, topic, false); // false pour indiquer qu'on envoie à un utilisateur, pas un topic

    // Retourner la réponse indiquant le succès
    return { message: 'Notification insérée et envoyée avec succès.', notification: result };
  } catch (error) {
    // Gérer les erreurs
    console.error("Erreur lors de l'insertion de la notification:", error);
    throw new Error('Erreur lors du traitement de la notification: ' + error.message);
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