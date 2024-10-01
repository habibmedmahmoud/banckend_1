// /models/User.js
const mongoose = require('mongoose');
const Joi = require('joi');
const userSchema = new mongoose.Schema({
users_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
},
users_password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
},
users_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 100
},
users_phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
},
users_verify_code: {
    type: String,
    default: "0"
},
},
{
    timestamps: true // Ajoute les champs createdAt et updatedAt automatiquement
});

// Fonction pour valider l'inscription d'un utilisateur
function validateRegisterUser(obj) {
    const schema = Joi.object({
        users_name: Joi.string().trim().min(2).max(200).required(),
        users_email: Joi.string().trim().min(5).max(100).required().email(),
        users_password: Joi.string().trim().min(6).required(),
        users_phone: Joi.string().trim().required()
    });
    return schema.validate(obj);
}

// Fonction pour valider la connexion d'un utilisateur (login)
function validateLoginUser(obj) {
    const schema = Joi.object({
        users_email: Joi.string().trim().min(5).max(100).required().email(),
        users_password: Joi.string().trim().min(6).required()
    });
    return schema.validate(obj);
}



// Exporter le modèle User
// Exporter le modèle utilisateur
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser
};