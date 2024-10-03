const mongoose = require('mongoose');

// Définir le schéma de la catégorie
const categorySchema = new mongoose.Schema({
    
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
        type: String, // Ajout du champ pour l'image
        required: false, // Si ce n'est pas obligatoire
        trim: true
    },
   
},
{
    timestamps: true // Ajoute les champs createdAt et updatedAt automatiquement

});

// Créer le modèle à partir du schéma
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
