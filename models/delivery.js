// /models/Delivery.js
const mongoose = require('mongoose');
const Joi = require('joi');

const deliverySchema = new mongoose.Schema({
    delivery_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    delivery_password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    delivery_email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    delivery_phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    delivery_verify_code: {
        type: String
    },
    delivery_approve: {
        type: Number,
        default: 0 // valeur par défaut pour delivery_approve
    }
}, {
    timestamps: true // Ajoute les champs createdAt et updatedAt automatiquement
});

// Fonction pour valider l'inscription d'un livreur
function validateRegisterDelivery(obj) {
    const schema = Joi.object({
        delivery_name: Joi.string().trim().min(2).max(200).required(),
        delivery_email: Joi.string().trim().min(5).max(100).required().email(),
        delivery_password: Joi.string().trim().min(6).required(),
        delivery_phone: Joi.string().trim().required()
    });
    return schema.validate(obj);
}

// Fonction pour valider la connexion d'un livreur (login)
function validateLoginDelivery(obj) {
    const schema = Joi.object({
        delivery_email: Joi.string().trim().min(5).max(100).required().email(),
        delivery_password: Joi.string().trim().min(6).required()
    });
    return schema.validate(obj);
}

// Exporter le modèle Delivery
const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = {
    Delivery,
    validateRegisterDelivery,
    validateLoginDelivery
};
