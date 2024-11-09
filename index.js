const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const auth = require('basic-auth');
const connectToDB = require('./config/db');
// Import des routes
const userRoutes = require('./routes/userRoutes');
const verifyRouter = require('./Verifycode/verifyCode');
const checkemailRouter = require('./routes/emailRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Routes des catégories
const homeRoutes = require('./routes/homeRoutes'); 
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const AddressRoutes = require('./routes/address');
const couponRoutes = require('./routes/couponRoutes');
const ordersRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import des routes Admin
const notificationRoutes = require('./routes/notificationRoute'); 

// Initialiser l'application express
const app = express();
const PORT = process.env.PORT;

// Middleware pour parser les requêtes HTTP
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const db = mongoose.connection;
connectToDB();

// // Utilisation des routes utilisateur
app.use('/api/users', userRoutes);
app.use('/api', verifyRouter);
app.use('/api', checkemailRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/product', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', AddressRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notification', notificationRoutes);



app.get('/', (req, res) => {
    res.send('Le serveur fonctionne correctement !');
});



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`);
});