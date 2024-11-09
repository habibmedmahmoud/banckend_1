// استيراد النماذج الضرورية
const mongoose = require('mongoose');
const Order = require('../models/orders'); // نموذج الطلب
const Coupon = require('../models/coupon'); // نموذج الكوبون
const Cart = require('../models/cart');
const Address = require('../models/address'); // Modèle d'adresse
const moment = require('moment'); // Pour gérer les dates
const Product = require('../models/product');

// cette partie de utilisateur  pour de orders 
// checkout 
const createOrder = async (req, res) => {
    try {
        const {
            usersid,
            addressid,
            orderstype,
            pricedelivery,
            ordersprice,
            couponid,
            paymentmethod,
            coupondiscount
        } = req.body;

        // إذا كان الطلب من نوع "استلام"، تكلفة التوصيل تساوي 0
        let finalDeliveryPrice = orderstype === "1" ? 0 : pricedelivery;
        let totalprice = ordersprice + finalDeliveryPrice;

        // التحقق من الكوبون إذا كان متوفرًا
        if (couponid) {
            const now = new Date();
            const coupon = await Coupon.findOne({
                _id: new mongoose.Types.ObjectId(couponid),
                coupon_expiredate: { $gt: now },
                coupon_count: { $gt: 0 }
            });

            if (coupon) {
                totalprice -= ordersprice * (coupondiscount / 100);
                coupon.coupon_count -= 1;
                await coupon.save();
            }
        }

        // إعداد بيانات الطلب الجديد
        const orderData = {
            orders_usersid: new mongoose.Types.ObjectId(usersid),
            orders_address: orderstype === "1" ? null : new mongoose.Types.ObjectId(addressid), // إذا كان الاستلام، لا حاجة للعنوان
            orders_type: orderstype,
            orders_pricedelivery: finalDeliveryPrice,
            orders_price: ordersprice,
            orders_coupon: couponid ? new mongoose.Types.ObjectId(couponid) : null,
            orders_totalprice: totalprice,
            orders_payment: paymentmethod
        };

        // إنشاء الطلب وحفظه في قاعدة البيانات
        const newOrder = await Order.create(orderData);

        // تحديث السلة لتشير إلى الطلب الجديد
        await Cart.updateMany(
            { cart_usersid: new mongoose.Types.ObjectId(usersid), cart_orders: null },
            { cart_orders: newOrder._id }
        );

        res.status(201).json({ success: true, message: "تم إنشاء الطلب بنجاح", order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطأ في إنشاء الطلب", error: error.message });
    }
};
// archive 
const getUserOrdersWithStatus = async (req, res) => {
    try {
        const { id: userid } = req.params;

        // Requête pour obtenir les commandes de l'utilisateur avec orders_status = 4
        const orders = await Order.find({
            orders_usersid: userid,
            orders_status: 4
        }).populate('orders_address');  // Jointure avec les détails de l'adresse

        // Vérification si des commandes sont trouvées
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucune commande trouvée avec ce statut pour cet utilisateur"
            });
        }

        res.status(200).json({
            success: true,
            message: "Commandes récupérées avec succès",
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des commandes",
            error: error.message
        });
    }
};
// details 
const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id; // Récupération de l'ID de la commande
        const order = await Order.findById(orderId).populate('orders_usersid');

        // Vérifier si la commande existe
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Récupérer tous les articles du panier associés à cette commande
        const carts = await Cart.find({ cart_orders: orderId }).populate('cart_productsid');

        // Détails des produits
        const productsDetails = carts.map(cart => {
            const product = cart.cart_productsid;

            // Vérifiez que le produit est correctement peuplé
            if (!product) {
                return null; // Ignorez les produits non trouvés
            }

            // Calculez le prix après réduction
            const priceAfterDiscount = product.products_price - (product.products_price * product.products_discount / 100);

            return {
                productId: product._id,
                productName: product.products_name,
                productName_ar: product.products_name_ar, // Inclure le nom arabe si nécessaire
                productDesc: product.products_desc,
                productDesc_ar: product.products_desc_ar, // Inclure la description arabe si nécessaire
                productImage: product.products_image,
                productCount: cart.cart_productsid.products_count, // Comptez les produits dans le panier
                originalPrice: product.products_price, // Prix d'origine
                discount: product.products_discount, // Montant de la réduction
                priceAfterDiscount: priceAfterDiscount, // Prix après réduction
            };
        }).filter(Boolean); // Filtrer les produits null

        // Construire la réponse finale
        const response = {
            orderId: order._id,
            orderPrice: order.orders_price,
            orderTotalPrice: order.orders_totalprice,
            deliveryPrice: order.orders_pricedelivery,
            orderStatus: order.orders_status, // Statut de la commande
            orderRating: order.orders_rating, // Évaluation de la commande
            orderDateTime: order.orders_datetime, // Date et heure de la commande
            products: productsDetails,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error });
    }
};

// Fonction pour supprimer une commande
// delete 
const deleteOrder = async (req, res) => {
    try {
        const { ordersid } = req.body;

        // Recherche et suppression de la commande avec status 0
        const deletedOrder = await Order.findOneAndDelete({
            _id: ordersid,
            orders_status: 0
        });

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Commande introuvable ou déjà traitée"
            });
        }

        res.status(200).json({
            success: true,
            message: "Commande supprimée avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de la commande",
            error: error.message
        });
    }
};
// pending 
// وظيفة للحصول على الطلبات استنادًا إلى معرف المستخدم
const getUserOrders = async (req, res) => {
    const userid = req.params.id; // استرداد معرف المستخدم من باراميتر الطلب
  
    try {
      // استرداد الطلبات المرتبطة بمعرف المستخدم مع تضمين معلومات العنوان
      const orders = await Order.find({
        orders_usersid: userid,
        orders_status: { $ne: 4 }  // تصفية الطلبات لاستبعاد تلك التي لديها `orders_status = 4`
      }).populate('orders_address');  // الانضمام مع مجموعة العناوين
  
      // إرجاع الطلبات والعناوين بصيغة JSON
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'حدث خطأ أثناء استرداد الطلبات' });
    }
  }
  
const updateOrderRating = async (req, res) => {
    const { id } = req.params; // Récupérer l'ID de la commande depuis les paramètres de l'URL
    const { rating, comment } = req.body; // Récupérer rating et comment depuis le corps de la requête

    try {
        // Met à jour la commande avec la note et le commentaire
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                orders_rating: rating,
                orders_noterating: comment
            },
            { new: true, runValidators: true } // Retourne le document mis à jour et valide les mises à jour
        );

        // Vérifier si l'ordre a été trouvé et mis à jour
        if (!updatedOrder) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Retourner la réponse avec la commande mise à jour
        res.status(200).json({ message: "Commande mise à jour avec succès", order: updatedOrder });
    } catch (error) {
        // Gérer les erreurs
        res.status(500).json({ message: "Erreur lors de la mise à jour de la commande", error });
    }
};


// تصدير وظيفة createOrder
module.exports = { 
    createOrder , 
    getUserOrdersWithStatus,
    getOrderDetails ,
    deleteOrder,
    getUserOrders , 
    updateOrderRating,
   
};
