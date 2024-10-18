const mongoose = require('mongoose');
const Joi = require('joi');

// Définition du schéma Admin
const adminSchema = new mongoose.Schema({
    admin_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    admin_password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    admin_email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    admin_phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    admin_verify_code: { 
        type: String 
    }, // Code de vérification pour l’admin
    admin_role: {
        type: Number, // Rôle sous forme d'entier
        default: 0 // 0 = utilisateur par défaut, 1 = admin, 2 = superadmin
    },
    admin_approve: {
        type: Number,
        default: 0 // 0 = non approuvé, 1 = approuvé
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Validation de la connexion Admin (login)
function validateLoginAdmin(obj) {
    const schema = Joi.object({
        admin_email: Joi.string().trim().min(5).max(100).required().email(),
        admin_password: Joi.string().trim().min(6).required()
    });
    return schema.validate(obj);
}

// Exportation du modèle Admin et des fonctions de validation
const Admin = mongoose.model('Admin', adminSchema);

module.exports = {
    Admin,
    validateLoginAdmin
};
