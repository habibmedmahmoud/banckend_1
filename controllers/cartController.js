// controllers/cartController.js
const mongoose = require('mongoose'); // Importer mongoose
const Cart = require('../models/cart'); // Importer le modèle Cart
const Product = require('../models/product'); // Importer le modèle Product

// Fonction pour ajouter un produit au panier (sans vérifier l'existence)
// Fonction pour ajouter un produit au panier
exports.addToCart = async (req, res) => {
    const { usersid, productsid } = req.body;

    try {
        // Vérifier si le produit existe déjà dans le panier de l'utilisateur
        const existingCartItem = await Cart.findOne({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // ou cart_orders: 0 si vous préférez cela
        });

        // Si l'élément existe déjà, retourner un message approprié
        if (existingCartItem) {
            return res.status(400).json({ message: 'Le produit est déjà dans le panier.' });
        }

        // Ajouter un nouveau produit au panier
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
        // Trouver et supprimer un produit du panier basé sur l'utilisateur, le produit et où cart_orders = 0
        const deletedCartItem = await Cart.findOneAndDelete({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Condition pour vérifier que cart_orders est égal à 0
        });

        // Vérifier si le produit existait dans le panier
        if (!deletedCartItem) {
            // Produit non trouvé ou condition non remplie, retourner un message
            return res.status(404).json({ message: 'Produit non trouvé dans le panier ou la commande est déjà traitée.' });
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


// Fonction pour récupérer les données du panier par ID utilisateur et ID produit
const getCartViewByUserAndProduct = async (userId, productId) => {
    try {
        const cartViewData = await Cart.aggregate([
            {
                $lookup: {
                    from: "products", // Nom de la collection des produits
                    localField: "cart_productsid", // Champ dans Cart
                    foreignField: "_id", // Champ dans Product
                    as: "productData" // Nom de la sortie
                }
            },
            {
                $match: {
                    cart_usersid: new mongoose.Types.ObjectId(userId), // Filtrer par ID d'utilisateur
                    cart_productsid: new mongoose.Types.ObjectId(productId), // Filtrer par ID de produit
                    cart_orders: null // Ajout de la condition pour cart_orders
                }
            },
            {
                $unwind: "$productData" // Déplier le tableau résultant de $lookup
            },
            {
                $group: {
                    _id: "$cart_usersid", // Regrouper par ID d'utilisateur
                    productsprice: { $sum: "$productData.products_price" }, // Somme des prix des produits
                    countproducts: { $sum: 1 }, // Nombre de produits
                    carts: {
                        $push: {
                            _id: "$_id",
                            cart_usersid: "$cart_usersid",
                            cart_productsid: "$cart_productsid",
                            products_id: "$productData._id",
                            products_name: "$productData.products_name",
                            products_name_ar: "$productData.products_name_ar",
                            products_desc: "$productData.products_desc",
                            products_desc_ar: "$productData.products_desc_ar",
                            products_image: "$productData.products_image",
                            products_count: "$productData.products_count",
                            products_active: "$productData.products_active",
                            products_price: "$productData.products_price",
                            products_discount: "$productData.products_discount",
                            products_cat: "$productData.products_cat",
                            productsprice: "$productData.products_price", // Ajout du prix du produit à chaque entrée
                            countproducts: 1 // Nombre de produits individuels dans chaque entrée
                        }
                    }
                }
            }
        ]);

        return cartViewData;

    } catch (error) {
        console.error("Error fetching cart view data:", error);
        throw error;
    }
};


// Contrôleur pour récupérer les données du panier pour un utilisateur et un produit
exports.getCartDataByUserAndProduct = async (req, res) => {
    const userId = req.params.userid;
    const productId = req.params.productid;

    try {
        const cartViewData = await getCartViewByUserAndProduct(userId, productId);

        if (cartViewData.length > 0) {
            res.json({
                status: "success",
                datacart: cartViewData[0].carts.map(cart => ({
                    ...cart, 
                    productsprice: cart.productsprice, // Le prix du produit à chaque élément
                    countproducts: cart.countproducts // Le nombre de produits à chaque élément
                })),
                countprice: {
                    totalprice: cartViewData[0].productsprice, // Prix total de tous les produits
                    totalcout: cartViewData[0].countproducts  // Nombre total de produits dans le panier
                }
            });
        } else {
            res.json({ status: "error", message: "No cart data found for this user and product" });
        }

    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ status: "error", message: "An error occurred while fetching cart data" });
    }
};