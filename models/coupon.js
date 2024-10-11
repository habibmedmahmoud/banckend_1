const mongoose = require('mongoose');

// Définition du schéma de coupon
const couponSchema = new mongoose.Schema({
    coupon_name: {
        type: String,
        required: true,
        unique: true,  // Garantir que le nom du coupon soit unique
        trim: true,
        maxlength: 50  // Longueur maximale de 50 caractères
    },
    coupon_count: {
        type: Number,
        required: true,
       
    },
    coupon_discount: {
        type: Number,
        required: true,
        default: 0,    // Par défaut, la remise est 0
        
    },
    coupon_expiredate: {
        type: Date,
        required: true  // La date d'expiration est obligatoire
    }
}, {
    timestamps: true  // Ajoute automatiquement createdAt et updatedAt
});

// Création du modèle Coupon à partir du schéma
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
