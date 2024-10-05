const mongoose = require('mongoose');
const Favorite = require('../models/favorite'); // مسار نموذج المفضلات
const Product = require('../models/product');   // مسار نموذج المنتجات
const User = require('../models/user'); 

const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.aggregate([
            {
                $lookup: {
                    from: 'products', // Nom de la collection des produits
                    localField: 'favorite_productsid', // Le champ dans la collection des favoris qui contient l'ID du produit
                    foreignField: '_id', // Le champ dans la collection des produits qui contient l'ID unique
                    as: 'productInfo' // Les données du produit seront stockées sous ce nom
                }
            },
            {
                $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } // Applatir les données du produit
            },
            {
                $project: {
                    _id: 1,  // Afficher l'ID du favori
                    favorite_usersid: 1,  // Afficher l'ID de l'utilisateur
                    favorite_productsid: 1,  // Afficher l'ID du produit
                    'productInfo.products_name': 1,  // Afficher le nom du produit
                    'productInfo.products_name_ar': 1,  // Afficher le nom en arabe du produit
                    'productInfo.products_desc': 1,  // Afficher la description du produit
                    'productInfo.products_desc_ar': 1,  // Afficher la description en arabe du produit
                    'productInfo.products_image': 1,  // Afficher l'image du produit
                    'productInfo.products_price': 1,  // Afficher le prix du produit
                    'productInfo.products_discount': 1,  // Afficher la remise du produit
                    'productInfo.products_count': 1,  // Afficher le stock disponible du produit
                    'productInfo.products_active': 1,  // Afficher si le produit est actif
                    'productInfo.products_date': 1,  // Afficher la date d'ajout du produit
                    'productInfo.products_cat': 1  // Afficher la catégorie du produit
                }
            }
        ]);

        if (!favorites.length) {
            return res.status(404).json({ message: "Aucun favori trouvé." });
        }

        res.json(favorites); // Retourner les données au client
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des favoris." });
    }
};




const toggleFavorite = async (req, res) => {
    try {
        const { usersid, productsid } = req.body;

        // Recherche du produit dans les favoris de l'utilisateur
        const favorite = await Favorite.findOne({
            favorite_usersid: new mongoose.Types.ObjectId(usersid),
            favorite_productsid: new mongoose.Types.ObjectId(productsid),
        });

        if (favorite) {
            // Si le produit est déjà dans les favoris, on le supprime
            await Favorite.deleteOne({ _id: favorite._id });
            return res.status(200).json({
                status: 'success',
                message: 'Le produit a été retiré des favoris avec succès'
            });
        } else {
            // Si le produit n'est pas dans les favoris, on l'ajoute
            const newFavorite = new Favorite({
                favorite_usersid: new mongoose.Types.ObjectId(usersid),
                favorite_productsid: new mongoose.Types.ObjectId(productsid),
            });

            await newFavorite.save();
            return res.status(200).json({
                status: 'success',
                message: 'Le produit a été ajouté aux favoris avec succès'
            });
        }

    } catch (error) {
        console.error('Une erreur s\'est produite lors de la gestion des favoris:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};



const removeFavorite = async (req, res) => {
    try {
        const id = req.params.id; // Récupérer l'id du favori depuis les paramètres de l'URL

        // Vérifier si l'id est un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: 'error', message: 'ID de favori invalide' });
        }

        // Vérifier si le favori existe et le supprimer
        const result = await Favorite.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ status: 'error', message: 'Favori non trouvé' });
        }

        res.status(200).json({ status: 'success', message: 'Favori supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du favori :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};








module.exports = {
    getMyFavorites,
    removeFavorite,
    toggleFavorite 
    
};
