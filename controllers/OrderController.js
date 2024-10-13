// استيراد النماذج الضرورية
const mongoose = require('mongoose');
const Order = require('../models/orders'); // نموذج الطلب
const Coupon = require('../models/coupon'); // نموذج الكوبون
const Cart = require('../models/cart');
const Address = require('../models/address'); // Modèle d'adresse




const createOrder = async (req, res) => {
    try {
        const { orders_usersid, orders_address, orders_type, orders_pricedelivery, orders_price, orders_coupon, orders_payment } = req.body;

        let totalprice = orders_price + orders_pricedelivery;

        // Vérifier la validité du coupon si fourni
        if (orders_coupon) {
            const now = new Date();
            const coupon = await Coupon.findOne({ 
                _id: new mongoose.Types.ObjectId(orders_coupon), 
                coupon_expiredate: { $gt: now }, 
                coupon_count: { $gt: 0 }
            });

            if (coupon) {
                totalprice = totalprice - (orders_price * coupon.coupon_discount / 100);

                // Mettre à jour le nombre de coupons
                coupon.coupon_count -= 1;
                await coupon.save();
            }
        }

        // Créer une nouvelle commande
        const newOrder = new Order({
            orders_usersid,
            orders_address,
            orders_type,
            orders_pricedelivery,
            orders_price,
            orders_coupon: orders_coupon ? new mongoose.Types.ObjectId(orders_coupon) : null,
            orders_payment,
            orders_totalprice: totalprice
        });

        // Enregistrer la commande dans la base de données
        await newOrder.save();

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(400).json({ message: 'Order validation failed', error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        // البحث عن جميع الطلبات باستخدام Mongoose
        const orders = await Order.find();
        
        // تحقق مما إذا تم العثور على أي طلبات
        if (orders.length > 0) {
            res.status(200).json({
                message: 'Orders retrieved successfully',
                orders
            });
        } else {
            res.status(404).json({
                message: 'No orders found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving orders',
            error: error.message
        });
    }
};
// const getordersview = async (req, res) => {
//     try {
//         const userId = req.params.userId; // Assurez-vous de passer l'ID de l'utilisateur en paramètre

//         // Rechercher les commandes de l'utilisateur, filtrer par orders_status != 4
//         const orders = await Order.find({ 
//                 orders_usersid: userId, 
//                 orders_status: { $ne: 4 } // Exclure les commandes avec status 4
//             })
//             .populate('orders_address') // Récupérer les détails de l'adresse
//             .exec();

//         // Formater la réponse pour inclure les informations des commandes et des adresses
//         const formattedOrders = orders.map(order => ({
//             _id: order._id.toString(), // Convertir _id en chaîne pour la compatibilité
//             orders_usersid: order.orders_usersid,
//             orders_totalprice: order.orders_totalprice,
//             orders_status: order.orders_status,
//             orders_type: order.orders_type,
//             orders_pricedelivery: order.orders_pricedelivery,
//             orders_price: order.orders_price,
//             orders_payment: order.orders_payment,
//             orders_datetime: order.orders_datetime,
//             address: order.orders_address ? { // Vérifier si orders_address est défini
//                 addressId: order.orders_address._id.toString(),
//                 address_name: order.orders_address.address_name,
//                 address_city: order.orders_address.address_city,
//                 address_street: order.orders_address.address_street,
//                 address_lat: order.orders_address.address_lat,
//                 address_long: order.orders_address.address_long,
//             } : null // Si l'adresse n'existe pas, mettre null
//         }));

//         // Retourner la réponse dans le format souhaité
//         return res.status(200).json({
//             status: "success",
//             data: formattedOrders
//         });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };

// استرجاع جميع الطلبات المرتبطة بمستخدم معين والتي حالتها ليست 4
const getUserOrders = async (req, res) => {
    const userId = req.params.id; // Récupération de l'ID de l'utilisateur depuis l'URL

    try {
        // Vérification que l'ID de l'utilisateur est un ObjectId valide
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "L'ID de l'utilisateur est invalide" });
        }

        // Récupérer les commandes associées à l'utilisateur (sauf celles avec un statut 4)
        const orders = await Order.find({
            orders_usersid: userId,
            orders_status: { $ne: 4 }
        }).populate('orders_address'); // Jointure avec l'adresse de la commande

        // Vérifier s'il y a des commandes disponibles
        if (orders.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée pour cet utilisateur" });
        }

        // Réponse réussie avec les commandes
        res.status(200).json(orders);

    } catch (error) {
        // Gestion des erreurs inattendues
        console.error("Erreur lors de la récupération des commandes :", error);
        res.status(500).json({ message: "Une erreur est survenue lors de la récupération des commandes", error });
    }
};



// استرجاع تفاصيل الطلب باستخدام cart_orders
const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('orderId reçu:', orderId);

        // تحقق من صلاحية ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'معرّف الطلب غير صالح' });
        }

        // استعلام للتحقق من وجود السجل في Cart
        const testCart = await Cart.findOne({ cart_orders: orderId });
        console.log('Test Cart:', testCart);

        if (!testCart) {
            return res.status(404).json({ message: 'لم يتم العثور على تفاصيل الطلب' });
        }

        // استعلام التجميع (Aggregation)
        const cartItems = await Cart.aggregate([
            { $match: { cart_orders: mongoose.Types.ObjectId(orderId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cart_productsid',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: null,
                    itemsprice: {
                        $sum: {
                            $subtract: [
                                '$product.products_price',
                                {
                                    $multiply: [
                                        '$product.products_price',
                                        { $divide: ['$product.products_discount', 100] }
                                    ]
                                }
                            ]
                        }
                    },
                    countitems: { $sum: 1 },
                    items: { $push: '$product' }
                }
            }
        ]);

        console.log('cartItems:', cartItems);

        if (!cartItems.length) {
            return res.status(404).json({ message: 'لم يتم العثور على تفاصيل الطلب' });
        }

        res.status(200).json(cartItems[0]);
    } catch (error) {
        console.error('خطأ في استرجاع تفاصيل الطلب:', error);
        res.status(500).json({ message: 'خطأ في استرجاع تفاصيل الطلب', error: error.message });
    }
};





// تصدير وظيفة createOrder
module.exports = { createOrder   , getAllOrders,getUserOrders,getOrderDetails };
