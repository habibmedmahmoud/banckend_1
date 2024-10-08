const mongoose = require('mongoose');
const Joi = require('joi');

// Définition du schéma d'adresse
const addressSchema = new mongoose.Schema({
    address_usersid: {
        type: mongoose.Schema.Types.ObjectId,  // Référence à l'utilisateur
        ref: 'User',
        required: true
    },
    address_city: {
        type: String,
        required: true,
        trim: true
    },
    address_street: {
        type: String,
        required: true,
        trim: true
    },
    address_lat: {
        type: Number,
        required: true
    },
    address_long: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Ajoute les champs createdAt et updatedAt automatiquement
});



const validateAddAddress = (data) => {
    const schema = Joi.object({
        address_usersid: Joi.string().required(),  // usersid est obligatoire
        address_city: Joi.string().min(2).max(255).required(),  // La ville doit avoir entre 2 et 255 caractères
        address_street: Joi.string().min(2).max(255).required(),  // La rue doit avoir entre 2 et 255 caractères
        address_lat: Joi.number().required(),  // Latitude obligatoire
        address_long: Joi.number().required()  // Longitude obligatoire
    });

    return schema.validate(data);
};

// Créer le modèle Mongoose à partir du schéma d'adresse
const Address = mongoose.model('Address', addressSchema);

module.exports = {
 Address,
 validateAddAddress

}