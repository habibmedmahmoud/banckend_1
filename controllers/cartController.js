// controllers/cartController.js
const mongoose = require('mongoose'); // Importer mongoose
const Cart = require('../models/cart'); // Importer le modèle Cart
const Product = require('../models/product'); // Importer le modèle Product

// Fonction pour ajouter un produit au panier (sans vérifier l'existence)
// Fonction pour ajouter un produit au panier
exports.addToCart = async (req, res) => {
    const { usersid, productsid } = req.body;

    try {
        // Ajouter directement un nouveau produit au panier sans vérifier si le produit existe déjà
        const newCartItem = new Cart({
            cart_usersid: usersid,
            cart_productsid: productsid
        });

        // Sauvegarder le nouvel élément dans le panier
        await newCartItem.save();

        // Retourner un message de succès
        res.status(200).json({ message: 'Produit ajouté au panier avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout au panier.' });
    }
};



// Fonction pour supprimer un produit du panier
exports.deleteFromCart = async (req, res) => {
    const { usersid, productsid } = req.body;

    try {
        // Trouver et supprimer un produit du panier basé sur l'utilisateur et le produit
        const deletedCartItem = await Cart.findOneAndDelete({
            cart_usersid: usersid,
            cart_productsid: productsid
        });

        // Vérifier si le produit existait dans le panier
        if (!deletedCartItem) {
            // Produit non trouvé, retourner un message
            return res.status(404).json({ message: 'Produit non trouvé dans le panier.' });
        }

        // Réponse réussie si la suppression a eu lieu
        res.status(200).json({ message: 'Produit supprimé du panier avec succès.' });
    } catch (error) {
        // Gérer les erreurs en cas de problème lors de la suppression
        console.error('Erreur lors de la suppression du produit du panier:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du produit du panier.' });
    }
};

// Contrôleur pour obtenir le nombre de produits pour un utilisateur et un produit spécifique
// Contrôleur pour obtenir le nombre de produits pour un utilisateur et un produit spécifique
exports.getCountProducts = async (req, res) => {
    const { usersid, productsid } = req.params;  // Utiliser req.params au lieu de req.query
  
    try {
        // Utilisation de countDocuments pour compter les documents correspondants
        const count = await Cart.countDocuments({
            cart_usersid: usersid,      // Filtrer par l'ID de l'utilisateur
            cart_productsid: productsid // Filtrer par l'ID du produit
        });
  
        // Retourner la réponse sous forme JSON
        if (count > 0) {
            res.json({ status: 'success', data: count }); // Renvoie le compte des produits
        } else {
            res.json({ status: 'success', data: 0 }); // Aucune produit trouvé
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de produits:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' }); // Gérer les erreurs
    }
};


exports.getCartView = async (req, res) => {
    const { usersid } = req.body; // ID de l'utilisateur provenant de la requête

    try {
        const cartView = await Cart.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'cart_productsid',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $match: {
                    cart_usersid: new mongoose.Types.ObjectId(usersid) // Correction ici
                }
            },
            {
                $group: {
                    _id: '$cart_productsid',
                    countproducts: { $sum: 1 },
                    totalPrice: { $sum: '$productDetails.products_price' },
                    productDetails: { $first: '$productDetails' }
                }
            }
        ]);

        if (cartView.length > 0) {
            res.status(200).json({ status: 'success', data: cartView });
        } else {
            res.status(404).json({ status: 'error', message: 'Aucun panier trouvé pour cet utilisateur' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'agrégation du panier :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};


