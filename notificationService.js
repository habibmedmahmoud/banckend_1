const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Charger le fichier JSON pour les clés de service Firebase
const serviceAccount = require("./user-app-firebase-a9e59-firebase-adminsdk-cdl8u-8a71a9726a.json");

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Fonction pour envoyer une notification à un topic
async function sendNotificationToTopic(title, body, topic) {
  try {
    const url = `https://fcm.googleapis.com/v1/projects/user-app-firebase-a9e59/messages:send`;

    // Construire le payload
    const payload = {
      message: {
        topic: topic,
        notification: {
          title: title,
          body: body,
        },
      },
    };

    // Obtenir le token d'accès pour l'authentification
    const token = await admin.credential.cert(serviceAccount).getAccessToken();
    const accessToken = token.access_token;

    // Envoyer la requête HTTP POST
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Notification envoyée avec succès :", data);
    } else {
      console.error("Erreur lors de l'envoi de la notification :", data);
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    throw error;
  }
}
// Exporter la fonction
module.exports = sendNotificationToTopic;
