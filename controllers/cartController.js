const mongoose = require('mongoose'); // Importer mongoose
const Cart = require('../models/cart'); // Importer le modèle Cart
const Product = require('../models/product'); // Importer le modèle Product
const { ObjectId } = require('mongodb'); // استيراد ObjectId من MongoDB

// Fonction pour ajouter un produit au panier
exports.addToCart = async (req, res) => {
    const { usersid, productsid } = req.body;
  
    try {
      const newCartItem = new Cart({
        cart_usersid: usersid,
        cart_productsid: productsid ,
        cart_orders: null // Cherchez les articles qui n'ont pas de commandes associées
      });
  
      await newCartItem.save();
      res.status(201).json({ message: 'Produit ajouté au panier avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'ajout au panier.', error });
    }
  };
  
  

// Fonction pour supprimer un produit du panier
exports.deleteFromCart = async (req, res) => {
    const { usersid, productsid  } = req.body;

    try {
        // Supprimer le produit du panier en fonction de usersid, itemsid et cart_orders = null
        const deletedCartItem = await Cart.findOneAndDelete({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Equivalent à "cart_orders = 0" en PHP
        });

        // Vérifier si l'article existait et a été supprimé
        if (!deletedCartItem) {
            return res.status(404).json({
                message: "Le produit n'existe pas dans le panier ou la commande a déjà été traitée."
            });
        }

        // Répondre avec succès si la suppression a eu lieu
        res.status(200).json({ message: 'Le produit a été supprimé du panier avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit du panier:', error);
        res.status(500).json({
            message: 'Erreur du serveur lors de la suppression du produit du panier.'
        });
    }
};


// Contrôleur pour obtenir le nombre de produits pour un utilisateur et un produit spécifique
exports.getCountProducts = async (req, res) => {
    try {
        // Assurez-vous d'utiliser 'new' pour créer un ObjectId
        const usersid = new mongoose.Types.ObjectId(req.params.usersid);
        const productsid = new mongoose.Types.ObjectId(req.params.productsid);

        // Compter les documents correspondants
        const count = await Cart.countDocuments({
            cart_usersid: usersid,
            cart_productsid: productsid,
            cart_orders: null // Vérification des produits non commandés
        });

        // Retourner la réponse avec le nombre de produits
        res.json({ status: 'success', data: count });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de produits:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};


exports.getCartDataByUser = async (req, res) => {
    const userId = req.params.userid; // استلام معرف المستخدم من الطلب

    try {
        const cartData = await Cart.aggregate([
            {
                $match: { cart_usersid: new ObjectId(userId) } // مطابقة المستخدم
            },
            {
                $lookup: {
                    from: 'products', // اسم مجموعة المنتجات
                    localField: 'cart_productsid', // الحقل المحلي (معرف المنتج في السلة)
                    foreignField: '_id', // الحقل الخارجي (معرف المنتج الحقيقي)
                    as: 'product'
                }
            },
            { $unwind: '$product' }, // فك السلسلة للحصول على تفاصيل المنتج
            {
                $group: {
                    _id: '$cart_productsid', // معرف المنتج في السلة
                    cart_id: { $first: '$_id' }, // cart_id
                    cart_usersid: { $first: '$cart_usersid' }, // معرف المستخدم
                    cart_orders: { $first: '$cart_orders' }, // الطلبات المرتبطة بالسلة
                    product: { $first: '$product' }, // تفاصيل المنتج
                    count: { $sum: 1 } // عدد مرات إضافة المنتج
                }
            },
            {
                $addFields: {
                    'product.totalprice': {
                        $multiply: [
                            {
                                $subtract: [
                                    '$product.products_price',
                                    {
                                        $multiply: [
                                            '$product.products_price',
                                            { $divide: ['$product.products_discount', 100] }
                                        ]
                                    }
                                ]
                            },
                            '$count'
                        ]
                    },
                    'product.totalcount': '$count' // عدد مرات الإضافة
                }
            },
            {
                $project: {
                    _id: 0,
                    cart_id: 1,
                    cart_usersid: 1,
                    cart_orders: 1,
                    cart_productsid: '$_id', // معرف المنتج في السلة
                    // تفاصيل المنتج
                    "product_id": '$product._id', // معرف المنتج الحقيقي
                    "products_name": '$product.products_name',
                    "products_name_ar": '$product.products_name_ar',
                    "products_desc": '$product.products_desc',
                    "products_desc_ar": '$product.products_desc_ar',
                    "products_image": '$product.products_image',
                    "products_count": '$product.products_count',
                    "products_active": '$product.products_active',
                    "products_price": '$product.products_price',
                    "products_discount": '$product.products_discount',
                    "products_cat": '$product.products_cat',
                    "totalprice": '$product.totalprice',
                    "totalcount": '$product.totalcount'
                }
            }
        ]);

        if (!cartData.length) {
            return res.status(404).json({ message: "Aucun article trouvé pour cet utilisateur." });
        }

        // حساب الإجمالي لكل المنتجات
        const totalprice = cartData.reduce((sum, item) => sum + item.totalprice, 0);
        const totalcount = cartData.reduce((sum, item) => sum + item.totalcount, 0);

        // إرسال الرد بالتنسيق المطلوب
        res.json({
            status: "success",
            countprice: {
                totalprice,
                totalcount
            },
            data: cartData
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};





