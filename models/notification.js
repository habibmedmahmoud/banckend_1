const mongoose = require('mongoose');

// Définir le schéma de la notification
const NotificationSchema = new mongoose.Schema({
  notification_title: { 
    type: String, 
    required: true 
  },
  notification_body: { 
    type: String, 
    required: true 
  },
  notification_userid: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', required: true 
    }, // Référence à l'utilisateur
 
  },
  {
    timestamps: true // Active createdAt et updatedAt automatiquement
  }
);

// Exporter le modèle
module.exports = mongoose.model('Notification', NotificationSchema);