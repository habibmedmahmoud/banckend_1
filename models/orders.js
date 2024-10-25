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
        default: null   // يمكن أن يكون null إذا لم يتم توفيره
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
    orders_rating: {
        type: Number,  // تقييم الطلب
        min: 0,        // السماح بالقيمة 0
        max: 5,        // الحد الأقصى: 5
        default: 0     // القيمة الافتراضية: 0
    },
    orders_noterating: {
        type: String,  // Commentaire sur l'évaluation
        default: 'none'  // Valeur par défaut
    },
    
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;