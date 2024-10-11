const Cart = require('../models/cart'); // Importer le modèle Cart
const Order = require('../models/orders'); // Importer le modèle Order

const createOrder = async (req, res) => {
    try {
        // Capturer les données de la requête
        const { orders_usersid, orders_address, orders_type, orders_pricedelivery, orders_price, orders_payment } = req.body;

        // Créer une nouvelle commande
        const newOrder = new Order({
            orders_usersid,
            orders_address,
            orders_type,
            orders_pricedelivery,
            orders_price,
            orders_payment
        });

        // Sauvegarder la commande dans la base de données
        const savedOrder = await newOrder.save();

        if (savedOrder) {
            // Mettez à jour le panier en indiquant que la commande est créée
            await Cart.updateMany(
                { cart_usersid: orders_usersid, cart_orders: null }, // Filtrer le panier par utilisateur et commande non associée
                { cart_orders: savedOrder._id }  // Utiliser l'ID de la commande directement
            );

            return res.status(201).json({ message: "Order created and cart updated successfully" });
        } else {
            return res.status(400).json({ message: "Failed to create order" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createOrder };
