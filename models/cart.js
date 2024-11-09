const mongoose = require('mongoose');

// تعريف نموذج السلة
const cartSchema = new mongoose.Schema({
    cart_usersid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // إشارة إلى نموذج المستخدم
        required: true
    },
    cart_productsid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // إشارة إلى نموذج المنتج
        required: true
    },
    cart_orders: {
        type: mongoose.Schema.Types.ObjectId, // Changez ceci de Number à ObjectId
        ref: 'Order', // Référence au modèle Order
        default: null
    },
}, { timestamps: true }); // تفعيل createdAt و updatedAt

// إنشاء نموذج السلة
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
