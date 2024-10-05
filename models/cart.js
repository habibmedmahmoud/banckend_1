const mongoose = require('mongoose');

// Définir le schéma du panier
const cartSchema = new mongoose.Schema({
    cart_usersid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User
        required: true
    },
    cart_productsid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Référence au modèle Product
        required: true
    }
}, { timestamps: true }); // Active createdAt et updatedAt

// Créer le modèle de panier
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
