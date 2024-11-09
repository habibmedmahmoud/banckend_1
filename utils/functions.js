
const mongoose = require('mongoose');
const Cart = require('../models/cart');  // استيراد نموذج السلة

// دالة getData لتحصل على البيانات من السلة حسب الشروط
async function getData(table, where, values, json = true) {
    try {
        // إذا كان الجدول هو Cart
        if (table === 'cart') {
            // البحث عن العناصر التي تتوافق مع الشروط
            const data = await Cart.find(where).exec();

            const count = data.length;

            if (json) {
                if (count > 0) {
                    return { status: "success", data };
                } else {
                    return { status: "failure" };
                }
            } else {
                return count;  // إذا كان json = false نقوم بإرجاع عدد الصفوف
            }
        }
    } catch (error) {
        console.error("Error in getData:", error);
        return { status: "failure", error: error.message };
    }
}

// دالة insertData لإدخال البيانات إلى السلة
async function insertData(table, data, json = true) {
    try {
        if (table === 'cart') {
            // إنشاء عنصر جديد في السلة
            const newCartItem = new Cart(data);
            await newCartItem.save();

            const count = 1;  // لأننا أضفنا عنصر واحد

            if (json) {
                if (count > 0) {
                    return { status: "success" };
                } else {
                    return { status: "failure" };
                }
            }
            return count;  // إذا كان json = false نقوم بإرجاع عدد الصفوف
        }
    } catch (error) {
        console.error("Error in insertData:", error);
        return { status: "failure", error: error.message };
    }
}

// دالة getAllData لجلب البيانات من قاعدة البيانات
async function getAllData(model, filter = {}, json = true) {
    try {
        const data = await model.find(filter);
        const count = data.length;

        if (json) {
            if (count > 0) {
                return { status: "success", data: data };
            } else {
                return { status: "failure" };
            }
        } else {
            return data;
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        return json
            ? { status: "error", message: error.message }
            : error.message;
    }
}

// Fonction de suppression
async function deleteData(collection, condition, json = true) {
    try {
        // Récupérer le modèle de la collection
        const Model = mongoose.model(collection);

        // Supprimer le document correspondant à la condition
        const result = await Model.deleteOne(condition);

        // Vérifier si l'option json est activée pour envoyer une réponse JSON
        if (json) {
            if (result.deletedCount > 0) {
                return { status: 'success', message: 'Document deleted successfully' };
            } else {
                return { status: 'failure', message: 'No matching document found' };
            }
        }

        // Retourner le nombre de documents supprimés
        return result.deletedCount;
    } catch (error) {
        throw new Error(`Error deleting data: ${error.message}`);
    }
}

module.exports = {
    getData , 
    insertData ,
    getAllData , 
    deleteData
};
