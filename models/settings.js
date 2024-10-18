const mongoose = require('mongoose');

// Définir le schéma des paramètres
const settingsSchema = new mongoose.Schema({
  titleHome: { 
    type: String,
    required: true,
    maxlength: 50 
  },
  bodyHome: { 
    type: String,
    required: true,
    maxlength: 100 
  },
  deliveryTime: { 
    type: Number,
    default: 30 
  }
});

// Créer le modèle en utilisant le schéma
const Settings = mongoose.model('Settings', settingsSchema);

// Exporter le modèle
module.exports = Settings;
