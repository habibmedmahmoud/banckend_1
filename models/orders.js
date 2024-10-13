const mongoose = require('mongoose');

// Définir le schéma des commandes (orders)
const orderSchema = new mongoose.Schema({
    orders_usersid: {
        type: mongoose.Schema.Types.ObjectId,  // Référence à l'utilisateur
        required: true
    },
    orders_address: {
        type: Number,   // ID de l'adresse (sans référence explicite)
        required: true
    },
    orders_type: {
        type: Number,   // 0 => livraison ; 1 => retrait
        enum: [0, 1],   // Limite les valeurs à 0 ou 1
        default: 0,
        required: true
    },
    orders_pricedelivery: {
        type: Number,   // Prix de livraison
        default: 0,
        required: true
    },
    orders_price: {
        type: Number,   // Prix total de la commande
        required: true
    },
    orders_coupon: {
        type: mongoose.Schema.Types.ObjectId,  // Référence à un coupon
        ref: 'Coupon',  // Optionnel, mais peut aider pour les jointures
        default: null  // Valeur par défaut si nécessaire
    },
    orders_datetime: {
        type: Date,     // Date de création de la commande
        default: Date.now,  // Date actuelle par défaut
        required: true
    },
    orders_payment: {
        type: Number,   // 0 => espèces ; 1 => carte de paiement
        enum: [0, 1],   // Limite les valeurs à 0 ou 1
        default: 0,
        required: true
    },
    orders_totalprice: {
        type: Number,
        default: 0,
    },
    orders_status: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true   // Ajoute automatiquement createdAt et updatedAt
});

// Créer le modèle Order à partir du schéma
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;  // Assurez-vous que cette lign