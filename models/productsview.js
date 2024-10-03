const mongoose = require('mongoose');

// Définir le schéma pour le modèle productsView
const productsViewSchema = new mongoose.Schema({
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
    products_date: {
        type: Date,
        default: Date.now
    },
    products_cat: {
        type: mongoose.Schema.Types.ObjectId, // Référence à la catégorie
        required: true // Si ce champ est requis
    },
    categories_id: {
        type: mongoose.Schema.Types.ObjectId, // Référence à la catégorie
        required: true // Si ce champ est requis
    },
    categories_name: {
        type: String,
        required: true,
        trim: true
    },
    categories_name_ar: {
        type: String,
        required: true,
        trim: true
    },
    categories_image: {
        type: String,
        required: true,
        trim: true
    },
    favorite: {
        type: Boolean,
        default: false // Favoris ou non (true/false)
    }
}, { timestamps: true } // Active createdAt et updatedAt par défaut
);

// Créer le modèle à partir du schéma
const ProductsView = mongoose.model('ProductsView', productsViewSchema);

// Exporter le modèle
module.exports = ProductsView;
