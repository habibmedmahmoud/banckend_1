const Notification = require('../models/notification');
const { User } = require('../models/user'); // Assurez-vous d'utiliser l'importation correcte

const axios = require('axios');

// Fonction pour envoyer une notification via FCM
async function sendGCM(title, message, topic, pageid, pagename) {
    const url = 'https://fcm.googleapis.com/fcm/send';
    const fields = {
        to: '/topics/' + topic,
        priority: 'high',
        content_available: true,
        notification: {
            body: message,
            title: title,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            sound: "default"
        },
        data: {
            pageid: pageid,
            pagename: pagename
        }
    };

    const headers = {
        'Authorization': 'key=ezt42FWyQg2uRF0UdSquXh:APA91bFGl6l9pdkCr4Y3jp4-Oe0D-1Y1LS5oLqaICzDMUzPRA8KWoQAKLUg6_Prah3GxLKA_fv24cdvDlXZMn85vYXyQPe5kO72mv6huMQATPU1XGAYkH6B-BpzjgWaqrj3THAREazcH', // Remplacez par votre clé de serveur
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, fields, { headers });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
        throw error;
    }
}

// Fonction pour insérer une notification
async function insertNotify(req, res) {
    const { title, body, userid, topic, pageid, pagename } = req.body;

    try {
        // Vérifiez si l'utilisateur existe
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const notification = new Notification({
            notification_title: title,
            notification_body: body,
            notification_userid: userid,
        });

        await notification.save();
        await sendGCM(title, body, topic, pageid, pagename);
        res.status(200).json({ message: 'Notification insérée avec succès', notification });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'insertion de la notification', error: error.message });
    }
}

module.exports = { insertNotify };
