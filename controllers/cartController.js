const mongoose = require('mongoose');
const Cart = require('../models/cart'); // استيراد نموذج السلة
const Product = require('../models/product'); // استيراد نموذج المنتج
const { ObjectId } = require('mongodb'); // استيراد ObjectId من MongoDB
const { getData , insertData , getAllData  , deleteData} = require("../utils/functions");
// دالة لإضافة منتج إلى السلة
exports.addToCart = async (req, res) => {
    try {
        const { usersid, itemsid } = req.body;

        // إضافة العنصر إلى السلة مباشرة دون التحقق من وجوده
        const data = {
            cart_usersid: usersid,
            cart_productsid: itemsid,
            cart_orders: null // أو 0 حسب الحاجة
        };

        const insertResult = await insertData('cart', data);

        if (insertResult.status === "success") {
            return res.status(201).json({ status: "success", message: "Item added to cart successfully." });
        } else {
            return res.status(500).json({ status: "failure", message: "Failed to add item to cart." });
        }

    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

// Suppression d'un élément du panier
exports.removeFromCart = async (req, res) => {
    try {
        // Récupérer les paramètres depuis les paramètres d'URL
        const { usersid, itemsid } = req.params;

        // Condition de suppression : utilisateur et produit
        const condition = {
            cart_usersid: new ObjectId(usersid), // Utilisation de 'new' pour créer un ObjectId
            cart_productsid: new ObjectId(itemsid), // Utilisation de 'new' pour créer un ObjectId
            cart_orders: null // S'assurer que l'ordre est nul
        };

        // Appeler la fonction deleteData pour supprimer l'élément du panier
        const result = await deleteData('Cart', condition);

        // Renvoyer la réponse JSON au client
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Fonction pour obtenir le nombre d'articles dans le panier
exports.getCountItems = async (req, res) => {
    try {
        const { usersid, itemsid } = req.params;

        // Assurez-vous d'utiliser 'new' pour créer un ObjectId
        const count = await Cart.countDocuments({
            cart_usersid: new mongoose.Types.ObjectId(usersid),
            cart_productsid: new mongoose.Types.ObjectId(itemsid),
            cart_orders: null
        });

        if (count > 0) {
            return res.json({ status: "success", data: count });
        } else {
            return res.json({ status: "success", data: 0 });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: error.message });
    }
};



// دالة للحصول على بيانات العربة (Cart) للمستخدم
exports.getCartDataByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // استخدام getAllData لجلب بيانات cartview
        const data = await getAllData(Cart, { cart_usersid: new mongoose.Types.ObjectId(userId), cart_orders: null }, false);

        // تجميع البيانات لحساب إجمالي السعر وعدد المنتجات
        const summary = await Cart.aggregate([
            {
                $match: { cart_usersid: new mongoose.Types.ObjectId(userId), cart_orders: null }
            },
            {
                $lookup: {
                    from: "products", // اسم مجموعة المنتجات
                    localField: "cart_productsid",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails" // توسيع البيانات المجمعة من المنتجات
            },
            {
                $group: {
                    _id: "$cart_usersid",
                    totalprice: { $sum: "$productDetails.products_price" },
                    totalcount: { $sum: 1 }
                }
            }
        ]);

        // إذا لم يتم العثور على أي نتائج في التجميع، نرجع قيم افتراضية
        const countprice = summary.length > 0 ? summary[0] : { totalprice: 0, totalcount: 0 };

        res.json({
            status: "success",
            countprice: countprice,
            datacart: data
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};