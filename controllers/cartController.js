const mongoose = require('mongoose'); // Importer mongoose
const Cart = require('../models/cart'); // Importer le modèle Cart
const Product = require('../models/product'); // Importer le modèle Product

// Fonction pour ajouter un produit au panier
exports.addToCart = async (req, res) => {
    const { usersid, productsid } = req.body;

    try {
        // Vérifiez si le produit existe déjà dans le panier de l'utilisateur
        const existingCartItem = await Cart.findOne({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Cherchez les articles qui n'ont pas de commandes associées
        });

        // Si l'article existe déjà, renvoyez un message approprié
        if (existingCartItem) {
            return res.status(400).json({ message: 'المنتج موجود بالفعل في السلة.' });
        }

        // Ajouter un nouveau produit au panier
        const newCartItem = new Cart({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Initialisez cart_orders à null
        });

        // Enregistrez le nouvel article dans le panier
        await newCartItem.save();

        // Retournez un message de succès
        res.status(200).json({ message: 'تم إضافة المنتج إلى السلة بنجاح.' });
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة إلى السلة:', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء إضافة إلى السلة.' });
    }
};

// Fonction pour supprimer un produit du panier
exports.deleteFromCart = async (req, res) => {
    const { usersid, productsid } = req.body;

    try {
        // Trouver le produit et le supprimer du panier en fonction de l'utilisateur, du produit, et cart_orders = null
        const deletedCartItem = await Cart.findOneAndDelete({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Vérifiez que cart_orders est null
        });

        // Vérifiez si le produit existe dans le panier
        if (!deletedCartItem) {
            // Le produit n'existe pas ou la condition n'est pas satisfaite, renvoyez un message
            return res.status(404).json({ message: 'المنتج غير موجود في السلة أو الطلب تم معالجته بالفعل.' });
        }

        // Réponse réussie si la suppression a eu lieu
        res.status(200).json({ message: 'تم حذف المنتج من السلة بنجاح.' });
    } catch (error) {
        // Gérer les erreurs en cas de problème lors de la suppression
        console.error('حدث خطأ أثناء حذف المنتج من السلة:', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء حذف المنتج من السلة.' });
    }
};

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
        res.json({ status: 'success', data: count }); // Renvoie le compte des produits
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
                    cart_orders: null // Condition pour vérifier que cart_orders est null
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
                            productsprice: "$productData.products_price", // Prix du produit
                            countproducts: 1 // Compte des produits individuels
                        }
                    }
                }
            }
        ]);

        return cartViewData;

    } catch (error) {
        console.error("Error fetching cart view data:", error);
        throw error; // Propager l'erreur pour traitement ultérieur
    }
};

// Contrôleur pour récupérer les données du panier pour un utilisateur et un produit
exports.getCartDataByUserAndProduct = async (req, res) => {
    const userId = req.params.userid; // Récupérer l'ID de l'utilisateur à partir des paramètres
    const productId = req.params.productid; // Récupérer l'ID du produit à partir des paramètres

    try {
        const cartViewData = await getCartViewByUserAndProduct(userId, productId); // Appeler la fonction d'agrégation

        if (cartViewData.length > 0) {
            // Si des données sont trouvées, les renvoyer
            res.json({
                status: "success",
                datacart: cartViewData[0].carts.map(cart => ({
                    ...cart,
                    productsprice: cart.productsprice, // Le prix du produit
                    countproducts: cart.countproducts // Le nombre de produits
                })),
                countprice: {
                    totalprice: cartViewData[0].productsprice, // Prix total
                    totalcout: cartViewData[0].countproducts  // Nombre total de produits
                }
            });
        } else {
            // Aucune donnée trouvée
            res.json({ status: "error", message: "No cart data found for this user and product" });
        }

    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ status: "error", message: "An error occurred while fetching cart data" });
    }
};
