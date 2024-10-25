// استيراد النماذج الضرورية
const mongoose = require('mongoose');
const Order = require('../models/orders'); // نموذج الطلب
const Coupon = require('../models/coupon'); // نموذج الكوبون
const Cart = require('../models/cart');
const Address = require('../models/address'); // Modèle d'adresse

const createOrder = async (req, res) => {
    try {
      const {
        orders_usersid,
        orders_address = null, // عنوان اختياري
        orders_type,
        orders_pricedelivery = 0,
        orders_price,
        couponid = null, // يمكن أن يكون فارغًا
        orders_payment
      } = req.body;
  
      // حساب السعر الإجمالي (إضافة رسوم التوصيل إذا كان الطلب يتطلب ذلك)
      let totalprice = orders_price;
      if (orders_type === 0) {
        totalprice += orders_pricedelivery;
      }
  
      // التحقق من الكوبون إذا كان موجودًا
      let discount = 0;
      let appliedCoupon = null;
  
      if (couponid) {
        const now = new Date();
        const coupon = await Coupon.findOne({
          _id: couponid,
          coupon_expiredate: { $gt: now },
          coupon_count: { $gt: 0 }
        });
  
        if (coupon) {
          discount = (orders_price * coupon.coupon_discount) / 100;
          totalprice -= discount;
  
          // تحديث الكمية المتبقية من الكوبون
          coupon.coupon_count -= 1;
          await coupon.save();
  
          appliedCoupon = coupon._id; // حفظ معرف الكوبون في الطلب
        }
      }
  
      // إنشاء الطلب
      const newOrder = new Order({
        orders_usersid,
        orders_address,
        orders_type,
        orders_pricedelivery: orders_type === 0 ? orders_pricedelivery : 0,
        orders_price,
        orders_totalprice: totalprice,
        orders_payment,
        orders_coupon: appliedCoupon // تعيين الكوبون إذا تم استخدامه
      });
  
      await newOrder.save();
  
      // الرد على العميل بنجاح
      res.status(201).json({
        status: 'success',
        message: 'تم إنشاء الطلب بنجاح.',
        order: newOrder
      });
  
    } catch (error) {
      console.error('خطأ أثناء إنشاء الطلب:', error);
      res.status(500).json({
        status: 'error',
        message: 'حدث خطأ أثناء إنشاء الطلب.'
      });
    }
  };
  
  



const getUserOrders = async (req, res) => {
    const userId = req.params.id; // Récupération de l'ID de l'utilisateur depuis l'URL

    try {
        // Vérification que l'ID de l'utilisateur est un ObjectId valide
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "L'ID de l'utilisateur est invalide" });
        }

        // Récupération des paramètres de pagination
        const { page = 1, limit = 10 } = req.query;

        // Récupérer les commandes associées à l'utilisateur (sauf celles avec un statut 4) avec pagination et tri
        const orders = await Order.find({
            orders_usersid: userId,
            orders_status: { $ne: 4 }
        })
        .populate('orders_address') // Jointure avec l'adresse de la commande
        .sort({ createdAt: -1 }) // Tri décroissant par date de création
        .skip((page - 1) * limit) // Sauter les résultats précédents pour la pagination
        .limit(Number(limit)); // Limiter le nombre de résultats

        // Vérifier s'il y a des commandes disponibles
        if (orders.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée pour cet utilisateur" });
        }

        // Réponse réussie avec les commandes
        res.status(200).json({
            message: "Commandes récupérées avec succès",
            orders,
            currentPage: page,
            totalOrders: await Order.countDocuments({ orders_usersid: userId, orders_status: { $ne: 4 } }), // Total des commandes pour la pagination
            totalPages: Math.ceil(await Order.countDocuments({ orders_usersid: userId, orders_status: { $ne: 4 } }) / limit) // Calcul des pages totales
        });

    } catch (error) {
        // Gestion des erreurs inattendues
        console.error("Erreur lors de la récupération des commandes :", error);
        res.status(500).json({ message: "Une erreur est survenue lors de la récupération des commandes", error });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        // تحقق من صلاحية ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'معرّف الطلب غير صالح' });
        }

        // استعلام للتحقق من وجود السجل في Cart
        const testCart = await Cart.findOne({ cart_orders: new mongoose.Types.ObjectId(orderId) });

        if (!testCart) {
            return res.status(404).json({ message: 'لم يتم العثور على تفاصيل الطلب' });
        }

        // استعلام التجميع (Aggregation)
        const cartItems = await Cart.aggregate([
            { $match: { cart_orders: new mongoose.Types.ObjectId(orderId) } },
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
                $project: {
                    _id: 1,
                    cart_usersid: 1,
                    cart_productsid: 1,
                    cart_orders: 1,
                    product: 1 // تضمين جميع تفاصيل المنتج
                }
            },
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
                    items: { $push: '$product' },
                    cartInfo: {
                        $first: {
                            _id: '$_id',
                            cart_usersid: '$cart_usersid',
                            cart_productsid: '$cart_productsid',
                            cart_orders: '$cart_orders'
                        }
                    }
                }
            }
        ]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'لم يتم العثور على تفاصيل الطلب' });
        }

        res.status(200).json(cartItems[0]);
    } catch (error) {
        console.error('خطأ في استرجاع تفاصيل الطلب:', error);
        res.status(500).json({ message: 'خطأ في استرجاع تفاصيل الطلب', error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Paramètres de pagination

        // Recherche des commandes avec pagination et tri par date de création
        const orders = await Order.find()
            .sort({ createdAt: -1 }) // Tri décroissant par date de création
            .skip((page - 1) * limit) // Sauter les résultats précédents pour la pagination
            .limit(Number(limit)); // Limiter le nombre de résultats

        // Vérification de la longueur des commandes trouvées
        if (orders.length > 0) {
            res.status(200).json({
                message: 'Orders retrieved successfully',
                orders,
                currentPage: page,
                totalOrders: await Order.countDocuments(), // Total des commandes pour la pagination
                totalPages: Math.ceil(await Order.countDocuments() / limit) // Calcul des pages totales
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


const deleteOrder = async (req, res) => {
    const orderId = req.params.id;
  
    try {
      const result = await Order.deleteOne({
        _id: new mongoose.Types.ObjectId(orderId), // Utilisation de 'new'
        orders_status: 0,
      });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Aucune commande trouvée ou le statut n\'est pas égal à 0.' });
      }
  
      return res.status(200).json({ message: 'Commande supprimée avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande :', error);
      return res.status(500).json({ message: 'Erreur interne lors de la suppression.' });
    }
  };

// دالة للحصول على الطلبات في حالة الأرشفة
const getArchivedOrders = async (req, res) => {
    const userId = req.params.id; // استرجاع ID المستخدم من المعلمات

    try {
        // التحقق من أن ID المستخدم هو ObjectId صالح
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "L'ID de l'utilisateur est invalide" });
        }

        // استرجاع الطلبات المرتبطة بالمستخدم التي لها حالة 4 مع العناوين المرتبطة بها
        const archivedOrders = await Order.find({
            orders_usersid: userId,
            orders_status: 4 // الطلبات المؤرشفة
        })
        .populate({
            path: 'orders_address',  // علاقة الطلب بالعنوان
            select: 'address_name address_city address_street address_lat address_long',  // الحقول المطلوبة من العنوان
        })
        .sort({ createdAt: -1 }); // ترتيب النتائج حسب تاريخ الإنشاء

        // التحقق من وجود طلبات مؤرشفة
        if (archivedOrders.length === 0) {
            return res.status(404).json({ message: "Aucune commande archivée trouvée pour cet utilisateur" });
        }

        // استجابة ناجحة مع البيانات
        res.status(200).json({
            message: "Commandes archivées récupérées avec succès",
            archivedOrders
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des commandes archivées :", error);
        res.status(500).json({ 
            message: "Une erreur est survenue lors de la récupération des commandes archivées", 
            error 
        });
    }
};




const updateOrder = async (req, res) => {
    try {
        const { id, rating, comment } = req.body;

        if (!id || rating === undefined || comment === undefined) {
            return res.status(400).json({ message: 'ID, rating et commentaire sont requis.' });
        }

        // Vérification de la validité du rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Le rating doit être compris entre 1 et 5.' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }

        const data = {
            orders_noterating: comment,
            orders_rating: rating
        };

        const result = await Order.updateOne({ _id: id }, { $set: data });

        if (result.nModified > 0) {
            return res.status(200).json({ message: 'Commande mise à jour avec succès.' });
        } else {
            return res.status(404).json({ message: 'Aucune modification apportée à la commande.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande.' });
    }
};




// تصدير وظيفة createOrder
module.exports = { createOrder   , getAllOrders,getUserOrders,getOrderDetails , deleteOrder , getArchivedOrders , updateOrder };
