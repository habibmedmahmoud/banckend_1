const mongoose = require('mongoose');
const Favorite = require('../models/favorite');

// Fonction pour ajouter un favori
const addFavorite = async (req, res) => {
    try {
        const userId = req.body.usersid;
        const productId = req.body.productsid;

        // Utiliser 'new' pour instancier ObjectId correctement
        const newFavorite = new Favorite({
            favorite_usersid: new mongoose.Types.ObjectId(userId),
            favorite_productsid: new mongoose.Types.ObjectId(productId)
        });

        await newFavorite.save();

        res.status(200).json({ status: 'success', message: 'Favori ajouté avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du favori :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};

const deleteFavorite = async (req, res) => {
    try {
        const userId = req.body.usersid;
        const productId = req.body.productsid;

        console.log('Tentative de suppression du favori avec userId:', userId, 'et productId:', productId);

        const result = await Favorite.deleteOne({
            favorite_usersid: new mongoose.Types.ObjectId(userId),
            favorite_productsid: new mongoose.Types.ObjectId(productId)
        });

        // Affichez le résultat de la suppression
        console.log('Résultat de la suppression:', result);

        if (result.deletedCount === 0) {
            return res.status(404).json({ status: 'error', message: 'Favori non trouvé' });
        }

        res.status(200).json({ status: 'success', message: 'Favori supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du favori :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};


module.exports = {
    addFavorite,
    deleteFavorite
};
