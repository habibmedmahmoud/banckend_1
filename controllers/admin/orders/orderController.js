// controllers/orderController.js
const Order = require('../../../models/orders'); // تأكد من استيراد النموذج الصحيح
const Notification = require('../../../models/notification');
const { sendNotificationToTopic } = require('../../../notificationService');


// approve 
// دالة للموافقة على الطلب
const approveOrder = async (req, res) => {
    const orderid = req.body.ordersid; // استرداد معرف الطلب من جسم الطلب
    const userid = req.body.usersid; // استرداد معرف المستخدم من جسم الطلب

    try {
        // تحديث حالة الطلب إلى 1 حيث تكون الحالة الحالية 0
        await Order.updateOne({ _id: orderid, orders_status: 0 }, { orders_status: 1 });

        // إدخال إشعار في قاعدة البيانات
        const notificationData = {
            notification_title: "success",
            notification_body: "The Order Has been Approved",
            notification_userid: userid,
        };
        
        const newNotification = new Notification(notificationData);
        await newNotification.save();

        // إرسال الإشعار إلى FCM
        await sendNotificationToTopic("success", "The Order Has been Approved", `users${userid}`, "none", "refreshorderpending");

        res.status(200).json({ message: 'الطلب تمت الموافقة عليه والإشعار تم إرساله بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب', error: error.message });
    }
}

// archive 
// Fonction pour récupérer toutes les commandes avec leur adresse
const getAllOrdersWithAddress = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $match: { orders_status: 4 } // Filtrer les commandes avec status 4
            },
            {
                $lookup: {
                    from: 'addresses',          // Nom de la collection pour Address en MongoDB
                    localField: 'orders_address', // Champ de référence dans Order
                    foreignField: '_id',         // Champ correspondant dans Address
                    as: 'addressInfo'            // Nom du champ pour les données associées
                }
            },
            {
                $unwind: {
                    path: "$addressInfo",       // Transforme le tableau en un seul document
                    preserveNullAndEmptyArrays: true // Conserver les commandes sans adresse
                }
            }
        ]);

        res.status(200).json(orders);
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des commandes." });
    }
};
 
// prepare 
const processOrderApproval = async (req, res) => {
    try {
        const orderId = req.body.ordersid;
        const userId = req.body.usersid;
        const orderType = req.body.ordertype;
        const updatedStatus = orderType === "0" ? 2 : 4;

        const updateResult = await Order.updateOne(
            { _id: orderId, orders_status: 1 },
            { $set: { orders_status: updatedStatus } }
        );

        if (updateResult.nModified === 0) {
            return res.status(404).json({ message: "Commande introuvable ou déjà mise à jour" });
        }

        // Message et titre de la notification
        const notificationMessage = "The Order Has been Approved";
        const notificationTitle = "Commande Approuvée"; // Titre de la notification

        // Créer la notification en utilisant les champs requis
        await Notification.create({
            notification_title: notificationTitle, // Ajout du titre
            notification_body: notificationMessage, // Ajout du corps
            notification_userid: userId, // ID de l'utilisateur
        });

        // Envoi de la notification à un sujet selon le type de commande
        if (orderType === "0") {
            await sendNotificationToTopic(
                "warning",
                "There is an order awaiting approval",
                "delivery"
            );
        } else {
            await sendNotificationToTopic(
                "success",
                notificationMessage,
                `users${userId}`,
                "none",
                "refreshorderpending"
            );
        }

        res.status(200).json({ message: "Commande approuvée avec succès et notification envoyée." });
    } catch (error) {
        console.error("Erreur lors de l'approbation de la commande :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'approbation de la commande." });
    }
}

// view 
const fetchOrdersWithAddresses = async (req, res) => {
    try {
        // استرجاع جميع الطلبات واستبعاد الطلبات ذات الحالة 4
        const orders = await Order.find({ orders_status: { $ne: 4 } }) // exclude orders with status 4
            .populate('orders_address'); // دمج بيانات العنوان

        // إرسال البيانات المسترجعة كاستجابة
        res.status(200).json(orders);
    } catch (error) {
        console.error("خطأ أثناء استرجاع الطلبات:", error);
        res.status(500).json({ message: "خطأ في الخادم أثناء استرجاع الطلبات." });
    }
};


module.exports = {
    approveOrder, // approve
    getAllOrdersWithAddress, // archive 
    processOrderApproval,  // prepare 
    fetchOrdersWithAddresses // view 

};
