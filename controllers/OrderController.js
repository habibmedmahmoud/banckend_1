// استيراد النماذج الضرورية
const mongoose = require('mongoose');
const Order = require('../models/orders'); // نموذج الطلب
const Coupon = require('../models/coupon'); // نموذج الكوبون
const Cart = require('../models/cart');




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



   // Fonction pour obtenir les détails d'une 
     
const getOrderDetails = async (req, res) => {
    const ordersId = req.params.id; // Récupérer l'ID de la commande à partir des paramètres

    try {
        const orderDetails = await Cart.aggregate([
            {
                $match: { cart_orders: new mongoose.Types.ObjectId(ordersId) }  // Filtrer par ID de commande
            },
            {
                $lookup: {
                    from: 'products', // Nom de la collection pour les produits
                    localField: 'cart_productsid', // Champ dans Cart
                    foreignField: '_id', // Champ correspondant dans la collection Products
                    as: 'productDetails' // Nom de la clé pour les détails des produits
                }
            },
            {
                $unwind: '$productDetails' // Défaire les détails des produits
            },
            {
                $group: {
                    _id: {
                        cart_productsid: '$cart_productsid',
                        cart_usersid: '$cart_usersid',
                        cart_orders: '$cart_orders'
                    },
                    itemsprice: {
                        $sum: {
                            $subtract: [
                                '$productDetails.products_price', // Utiliser products_price
                                { $multiply: ['$productDetails.products_price', { $divide: ['$productDetails.products_discount', 100] }] } // Utiliser products_discount
                                ]
                        }
                    },
                    countitems: { $sum: 1 },
                    cart: { $first: '$$ROOT' },
                    product: { $first: '$productDetails' } // Récupérer les détails du produit
                }
            },
            {
                $project: {
                    _id: 0,
                    itemsprice: 1,
                    countitems: 1,
                    cart: 1,
                    product: 1 // Inclure les détails du produit dans le résultat
                }
            }
        ]);

        if (orderDetails.length > 0) {
            res.status(200).json({
                message: 'Order details retrieved successfully',
                orderDetails
            });
        } else {
            res.status(404).json({
                message: 'No details found for this order'
            });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            message: 'Error fetching order details',
            error: error.message
        });
    }
};







// تصدير وظيفة createOrder
module.exports = { createOrder  , getOrderDetails , getAllOrders};
