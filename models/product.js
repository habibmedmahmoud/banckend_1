const mongoose = require('mongoose');

// Définir le schéma du produit avec timestamps
const productSchema = new mongoose.Schema({
    products_name: {
        type: String,
        required: true,
        trim: true
    },
    products_name_ar: {
        type: String,
        required: true,
        trim: true
    },
    products_desc: {
        type: String,
        required: true,
        trim: true
    },
    products_desc_ar: {
        type: String,
        required: true,
        trim: true
    },
    products_image: {
        type: String,
        required: true,
        trim: true
    },
    products_count: {
        type: Number,
        required: true,
        min: 0
    },
    products_active: {
        type: Boolean,
        default: true
    },
    products_price: {
        type: Number,
        required: true,
        min: 0
    },
    products_discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    products_cat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    favorite: {
        type: Boolean,
        default: false // false par défaut (non favori)
    }
    
}, { timestamps: true }); // Active createdAt et updatedAt

// Créer le modèle de produit
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
