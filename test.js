// test.js
// Importer la fonction d'envoi de notifications
const sendNotificationToTopic = require("./notificationService");

// Tester l'envoi de la notification
sendNotificationToTopic(
  "إشعار جديد", // Titre de la notification
  "مرحبًا بك في النظام", // Corps de la notification
  "users6707407c09aac849e3f822d8", // Nom du topic
  true // Indiquer si c'est un topic (true) ou un token (false)
)
  .then(() => console.log("Notification envoyée avec succès"))
  .catch((err) => console.error("Erreur lors de l'envoi de la notification:", err));
