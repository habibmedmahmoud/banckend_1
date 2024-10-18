const mongoose = require('mongoose');

// Schéma des commandes (orders)
const orderSchema = new mongoose.Schema({
    orders_usersid: {
        type: mongoose.Schema.Types.ObjectId,  // Référence à l'utilisateur
        required: true
    },
    orders_address: {
        type: mongoose.Schema.Types.ObjectId,  // Référence à une adresse
        ref: 'Address',  // Jointure avec le modèle Address
        required: true
    },
    orders_type: {
        type: Number,   // 0 => livraison ; 1 => retrait
        enum: [0, 1],   
        default: 0
    },
    orders_pricedelivery: {
        type: Number,   
        default: 0
    },
    orders_price: {
        type: Number,   
        required: true
    },
    orders_coupon: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Coupon',
        default: null
    },
    orders_datetime: {
        type: Date,     
        default: Date.now
    },
    orders_payment: {
        type: Number,   
        enum: [0, 1],   
        default: 0
    },
    orders_totalprice: {
        type: Number,
        default: 0
    },
    orders_status: {
        type: Number,
        default: 0
    } ,
    // Ajout des nouveaux champs
     orders_rating: {
        type: Number,  // Évaluation de la commande
        min: 1,        // Valeur minimale de l'évaluation
        max: 5,        // Valeur maximale de l'évaluation
        default: 0     // Par défaut, aucune évaluation
    },
    orders_noterating: {
        type: String,  // Commentaire sur l'évaluation
        default: 'none'  // Valeur par défaut
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;