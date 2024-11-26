// controllers/orderController.js
const Order = require('../../../models/orders'); // تأكد من استيراد النموذج الصحيح
const Notification = require('../../../models/notification');
const { insertNotify } = require('../../notificationController');
const  sendNotificationToTopic = require('../../../notificationService');




// approve 
const approveOrder = async (req, res) => {
    const { ordersid, usersid } = req.body; // Récupérer les données de la requête

    try {
        // Mise à jour de l'état de la commande
        const updatedOrder = await Order.updateOne(
            { _id: ordersid, orders_status: 0 }, // Condition : ID de commande et statut = 0
            { $set: { orders_status: 1 } }       // Mise à jour : statut = 1
        );

        // Vérifier si une commande a été mise à jour
        if (updatedOrder.matchedCount === 0) {
            return res.status(404).json({ message: "Commande introuvable ou déjà mise à jour" });
        }

        // Ajouter une notification pour l'utilisateur
        await insertNotify(
            "success", 
            "The Order Has been Approved", 
            usersid, 
            `users${usersid}`, 
            "none", 
            "refreshorderpending"
        );

        // Envoyer une notification push
        await sendNotificationToTopic(
            "success", 
            "The Order Has been Approved", 
            `users${usersid}`, 
            "none", 
            "refreshorderpending"
        );

        // Réponse en cas de succès
        res.status(200).json({ message: "Commande mise à jour avec succès et notification envoyée" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};



  
  

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
