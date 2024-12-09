const { Delivery, validateRegisterDelivery, validateLoginDelivery } = require('../models/delivery');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const  { sendEmail } = require('../Email/testEmail');
const Order = require('../models/orders');
const mongoose = require('mongoose');
const sendNotificationToTopic = require('../notificationService'); // تأكد من تعديل المسار حسب هيكل مشروعك
const { insertNotify } = require('../controllers/notificationController');
const { ObjectId } = require("mongoose").Types;
const Cart = require('../models/cart');


// وظيفة التسجيل
exports.signup = async (req, res) => {
    // التحقق من صحة بيانات الطلب
    const { error } = validateRegisterDelivery(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { delivery_name, delivery_password, delivery_email, delivery_phone } = req.body;

    try {
        // التحقق من وجود التوصيل بالفعل
        const existingDelivery = await Delivery.findOne({
            $or: [{ delivery_email }, { delivery_phone }]
        });

        if (existingDelivery) {
            return res.status(400).json({ status: 'failure', message: 'L\'email ou le téléphone existe déjà' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(delivery_password, 10);

        // توليد رمز تحقق عشوائي
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // إنشاء توصيل جديد
        const newDelivery = new Delivery({
            delivery_name,
            delivery_password: hashedPassword,
            delivery_email,
            delivery_phone,
            delivery_verify_code: verifyCode
        });

        // حفظ التوصيل في قاعدة البيانات
        await newDelivery.save();

        // إرسال بريد إلكتروني مع رمز التحقق
        const emailSubject = 'Code de vérification';
        const emailText = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(delivery_email, emailSubject, emailText);

        return res.status(201).json({ status: 'success', message: 'Livreur créé avec succès' });

    } catch (error) {
        return res.status(500).json({ status: 'failure', message: error.message });
    }
};

// وظيفة تسجيل الدخول
exports.login = async (req, res) => {
    // التحقق من صحة بيانات الطلب
    const { error } = validateLoginDelivery(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { delivery_email, delivery_password } = req.body;

    try {
        // التحقق من وجود التوصيل
        const delivery = await Delivery.findOne({ delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // مقارنة كلمة المرور مع bcrypt
        const isMatch = await bcrypt.compare(delivery_password, delivery.delivery_password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe invalide' });
        }

        // تسجيل الدخول بنجاح - إرسال جميع بيانات التوصيل ما عدا كلمة المرور
        const deliveryData = delivery.toObject();
        delete deliveryData.delivery_password; // حذف كلمة المرور لأسباب أمنية

        res.status(200).json({ message: 'Connexion réussie', delivery: deliveryData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction de vérification du code de vérification
exports.verifyCode = async (req, res) => {
    const { delivery_email, verify_code } = req.body;

    try {
        // Rechercher le livreur avec l'email et le code de vérification
        const delivery = await Delivery.findOne({ 
            delivery_email, 
            delivery_verify_code: verify_code 
        });

        if (!delivery) {
            // Si le livreur n'est pas trouvé ou que le code ne correspond pas
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Incorrect email or verification code.' 
            });
        }

        // Si le code est correct, mettre à jour les champs appropriés
        delivery.delivery_verify_code = verify_code; // Réinitialiser le code de vérification
        delivery.delivery_approve = 1; // Approuver le livreur

        // Sauvegarder les modifications
        await delivery.save();

        return res.status(200).json({ 
            status: 'success', 
            message: 'Account verified successfully.' 
        });

    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({ 
            status: 'failure', 
            message: error.message 
        });
    }
};



// Contrôleur pour vérifier l'e-mail et envoyer un code de vérification
exports.checkEmail = async (req, res) => {
    const { delivery_email } = req.body;

    try {
        // Vérifier si le livreur existe
        const delivery = await Delivery.findOne({ delivery_email: delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: `Livreur avec l'email ${delivery_email} non trouvé` });
        }

        // Générer un code de vérification
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // Mettre à jour le code de vérification dans la base de données
        delivery.delivery_verify_code = verifyCode;
        await delivery.save();

        // Envoyer l'e-mail avec le code de vérification
        const subject = 'Code de vérification pour Ecommerce';
        const text = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(delivery_email, subject, text);

        res.status(200).json({ message: 'Code de vérification envoyé à l\'email' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour vérifier le code de vérification
exports.checkVerifyCode = async (req, res) => {
    const { delivery_email, verify_code } = req.body;

    try {
        // Vérifier si le livreur existe avec l'email et le code de vérification
        const delivery = await Delivery.findOne({ delivery_email: delivery_email, delivery_verify_code: verify_code });

        if (!delivery) {
            return res.status(404).json({ message: 'Code de vérification incorrect ou email invalide' });
        }

        // Si la vérification est réussie
        return res.status(200).json({ message: 'Vérification réussie', data: delivery });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
    const { delivery_email, newPassword } = req.body; // Supposons que vous envoyez un nouvel e-mail et un nouveau mot de passe dans la requête

    try {
        // Vérifier si le livreur existe
        const delivery = await Delivery.findOne({ delivery_email: delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe du livreur
        delivery.delivery_password = hashedPassword;
        await delivery.save();

        // (Optionnel) Envoyer un e-mail de confirmation
        const subject = 'Votre mot de passe a été réinitialisé';
        const text = 'Votre mot de passe a été mis à jour avec succès.';
        await sendEmail(delivery_email, subject, text); // Utilisez delivery_email ici

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour renvoyer le code de vérification
exports.resendVerifyCode = async (req, res) => {
    const { delivery_email } = req.body;

    // Générer un code de vérification à 5 chiffres
    const newVerifyCode = Math.floor(10000 + Math.random() * 90000);

    try {
        // Mettre à jour le code de vérification du livreur
        const updatedDelivery = await Delivery.findOneAndUpdate(
            { delivery_email: delivery_email },
            { delivery_verify_code: newVerifyCode },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // Envoyer l'email avec le nouveau code de vérification
        await sendEmail(delivery_email, "Code de vérification", `Votre nouveau code de vérification est : ${newVerifyCode}`);

        res.status(200).json({ message: 'Nouveau code de vérification renvoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du code de vérification :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};




// accepted 

// Controller function to get filtered orders
exports.getFilteredOrders = async (req, res) => {
    try {
        const deliveryId = req.params.id; // Récupérer l'identifiant de livraison depuis les paramètres de la requête

        // Trouver les commandes avec orders_status = 3 et orders_delivery = deliveryId
        const orders = await Order.find({
            orders_status: 3,
            orders_delivery: deliveryId
        }).populate('orders_address'); // Inclure les détails de l'adresse

        // Reformater les données pour inclure les informations d'adresse directement
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orders_usersid: order.orders_usersid,
            orders_address: order.orders_address._id,
            address_usersid: order.orders_address.address_usersid,
            address_name: order.orders_address.address_name,
            address_city: order.orders_address.address_city,
            address_street: order.orders_address.address_street,
            address_lat: order.orders_address.address_lat,
            address_long: order.orders_address.address_long,
            createdAt: order.orders_address.createdAt,
            updatedAt: order.orders_address.updatedAt,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_coupon: order.orders_coupon,
            orders_payment: order.orders_payment,
            orders_totalprice: order.orders_totalprice,
            orders_status: order.orders_status,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            orders_datetime: order.orders_datetime,
            orders_delivery: order.orders_delivery,
        }));

        // Envoyer une réponse structurée
        res.status(200).json({
            status: "success",
            data: formattedOrders
        });
    } catch (error) {
        console.error("Error fetching filtered orders:", error);
        res.status(500).json({ 
            status: "error",
            message: "An error occurred while fetching orders."
        });
    }
};
// approve 
exports.approveOrder = async (req, res) => {
    try {
        // Extraction des données envoyées dans le corps de la requête
        const { orderid, userid, deliveryid } = req.body;

        // Vérification de la présence des données nécessaires
        if (!orderid || !userid || !deliveryid) {
            return res.status(400).json({ message: "Données manquantes." });
        }

        // Utilisation de new pour instancier l'ObjectId
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: new ObjectId(orderid), orders_status: 2 }, // Condition avec new ObjectId
            { orders_status: 3, orders_delivery: deliveryid }, // Données à mettre à jour
            { new: true } // Retourne le document mis à jour
        );

        // Vérification si la commande a été trouvée et mise à jour
        if (!updatedOrder) {
            return res.status(404).json({ message: "Commande non trouvée ou statut incorrect." });
        }

        // Envoi d'une notification au sujet de l'utilisateur
        await sendNotificationToTopic(
            "success",
            "La commande a été approuvée.",
            `users${userid}`,
            "none",
            "refreshorderpending"
        );

        // Insertion d'une notification dans la base de données
        await insertNotify(
            "success",
            "Votre commande est en cours de livraison.",
            userid,
            `users${userid}`,
            "none",
            "refreshorderpending"
        );

        // Envoi d'une notification pour d'autres services
        await sendNotificationToTopic(
            "warning",
            "La commande a été approuvée par le service de livraison.",
            "services",
            "none",
            "none"
        );

        // Envoi d'une notification au service de livraison
        await sendNotificationToTopic(
            "warning",
            `La commande a été approuvée par le service de livraison ${deliveryid}`,
            "delivery",
            "none",
            "none"
        );

        // Réponse de succès
        res.status(200).json({
            message: "Commande approuvée avec succès.",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Erreur lors de l'approbation de la commande :", error);
        res.status(500).json({
            message: "Erreur lors de l'approbation de la commande.",
            error: error.message,
        });
    }
};

// archive 
// Fonction pour récupérer les commandes filtrées par statut et livreur
exports.fetchOrdersForDelivery = async (req, res) => {
    try {
        const deliveryId = req.params.id; // Récupérer l'ID du livreur à partir des paramètres de la requête

        // Recherche des commandes où orders_status = 4 et orders_delivery correspond à l'ID du livreur
        const orders = await Order.find({
            orders_status: 4,
            orders_delivery: deliveryId
        })
        .populate('orders_address'); // Effectuer une jointure avec le modèle Address

        // Vérifier si des commandes ont été trouvées
        if (orders.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée avec les critères donnés." });
        }

        // إعادة تنسيق البيانات للحصول على البنية المطلوبة
        const formattedOrders = orders.map(order => ({
            _idorder: order._id,
            orders_usersid: order.orders_usersid,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_coupon: order.orders_coupon,
            orders_payment: order.orders_payment,
            orders_totalprice: order.orders_totalprice,
            orders_status: order.orders_status,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            orders_datetime: order.orders_datetime,
            orders_delivery: order.orders_delivery,
            _idadrres: order.orders_address?._id,
            address_usersid: order.orders_address?.address_usersid,
            address_name: order.orders_address?.address_name,
            address_city: order.orders_address?.address_city,
            address_street: order.orders_address?.address_street,
            address_lat: order.orders_address?.address_lat,
            address_long: order.orders_address?.address_long,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            __v: order.__v
        }));

        // إرسال الاستجابة بالبيانات المنسقة
        res.status(200).json({
            status: "success",
            data: formattedOrders
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes filtrées:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des commandes." });
    }
};


// details 

// Nouvelle fonction pour récupérer les détails de la commande
exports.fetchOrderDetails = async (req, res) => {
    const orderId = req.params.id;

    try {
        // Vérification de l'ID de la commande
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "ID de commande non valide" });
        }

        // Récupération de la commande
        const order = await Order.findById(orderId).populate('orders_usersid');
        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Récupérer les articles du panier associés à cette commande
        const carts = await Cart.aggregate([
            {
                $match: { cart_orders: new mongoose.Types.ObjectId(orderId) }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cart_productsid',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: "$productData"
            },
            {
                $group: {
                    _id: "$productData._id", // Agrégation par produit
                    totalprice: {
                        $sum: {
                            $multiply: [
                                {
                                    $subtract: [
                                        "$productData.products_price",
                                        { $multiply: ["$productData.products_price", { $divide: ["$productData.products_discount", 100] }] }
                                    ]
                                },
                                { $ifNull: ["$count", 1] }
                            ]
                        }
                    },
                    totalcount: { $sum: { $ifNull: ["$count", 1] } },
                    productDetails: { $first: "$productData" },
                    cartUsersId: { $first: "$cart_usersid" },
                    cartProductId: { $first: "$cart_productsid" },
                    cartOrders: { $first: "$cart_orders" }
                }
            }
        ]);

        if (!carts.length) {
            return res.status(404).json({ message: "Aucun produit trouvé dans cette commande" });
        }

        // Détails des produits dans la commande
        const productsDetails = carts.map(cartItem => {
            const product = cartItem.productDetails;
            const priceAfterDiscount = product.products_price - (product.products_price * product.products_discount / 100);

            return {
                productId: product._id,
                productName: product.products_name,
                productName_ar: product.products_name_ar, 
                productDesc: product.products_desc,
                productDesc_ar: product.products_desc_ar,
                productImage: product.products_image,
                productCount: cartItem.totalcount,
                originalPrice: product.products_price,
                discount: product.products_discount,
                priceAfterDiscount: priceAfterDiscount,
                totalPrice: cartItem.totalprice.toFixed(2),
                totalCount: cartItem.totalcount,
                productCat: product.products_cat,
                productActive: product.products_active,
                cart_usersid: cartItem.cartUsersId || null,
                cart_productsid: cartItem.cartProductId || null,
                cart_orders: cartItem.cartOrders || null
            };
        });

        // Calcul du prix total et de la quantité totale
        const totalPrice = carts.reduce((sum, item) => sum + item.totalprice, 0).toFixed(2);
        const totalCount = carts.reduce((sum, item) => sum + item.totalcount, 0);

        // Construction de la réponse
        const response = {
            status: "success",
            countprice: {
                totalprice: totalPrice,
                totalcount: totalCount
            },
            datacart: productsDetails
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de la commande:", error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

//done 
// Fonction pour mettre à jour le statut de la commande et envoyer les notifications
exports.updateOrderStatusAndNotify = async (req, res) => {
    const { orderid, userid } = req.body;

    try {
        // Vérification des paramètres
        if (!orderid || !userid) {
            return res.status(400).json({ message: "Order ID and User ID are required" });
        }

        // Mise à jour du statut de la commande à 4 (Livré)
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderid, orders_status: 3 }, // Chercher une commande avec status 3 (en attente)
            { $set: { orders_status: 4 } }, // Mettre à jour le statut à 4 (Livré)
            { new: true } // Retourner la commande mise à jour
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found or already updated" });
        }

        // Notification à l'utilisateur
        await insertNotify(
            "success", 
            "Your Order Has been delivered", 
            userid, 
            `users${userid}`, // Formater le nom du destinataire
            "none", 
            "refreshorderpending"
        );

        // Envoi de la notification GCM à l'utilisateur
        await sendNotificationToTopic(
            "success", 
            "The Order Has been Approved", 
            `users${userid}`, // Destinataire: l'utilisateur
            "none", 
            "refreshorderpending"
        );

        // Notification à "services" pour informer qu'une commande a été livrée
        await sendNotificationToTopic(
            "warning", 
            "The Order Has been delivered to The Customer", 
            "services", // Destinataire: services
            "none", 
            "none"
        );

        // Réponse réussie
        return res.status(200).json({ message: "Order status updated and notifications sent" });

    } catch (error) {
        console.error("Error during order update and notification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//
// pending 

exports.getOrdersWithAddress = async (req, res) => {
    try {
        // Recherche de toutes les commandes avec un statut 2
        const orders = await Order.find({ orders_status: 2 })
            .populate('orders_address') // Jointure avec la collection Address
            .exec();

        // Vérifier si des commandes ont été trouvées
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Aucune commande trouvée avec ce statut."
            });
        }

        // Reformater les données pour inclure les informations d'adresse directement
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orders_usersid: order.orders_usersid,
            orders_address: order.orders_address._id,
            address_usersid: order.orders_address.address_usersid,
            address_name: order.orders_address.address_name,
            address_city: order.orders_address.address_city,
            address_street: order.orders_address.address_street,
            address_lat: order.orders_address.address_lat,
            address_long: order.orders_address.address_long,
            createdAt: order.orders_address.createdAt,
            updatedAt: order.orders_address.updatedAt,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_coupon: order.orders_coupon,
            orders_payment: order.orders_payment,
            orders_totalprice: order.orders_totalprice,
            orders_status: order.orders_status,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            orders_datetime: order.orders_datetime,
            orders_delivery: order.orders_delivery,
        }));

        // Réponse avec les commandes formatées
        return res.status(200).json({
            status: "success",
            data: formattedOrders
        });
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la récupération des commandes avec les adresses : ", error);
        return res.status(500).json({
            status: "error",
            message: "Erreur interne du serveur"
        });
    }
};



