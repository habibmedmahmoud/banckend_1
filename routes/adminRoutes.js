const express = require('express');
const router = express.Router();
const { loginAdmin, uploadImage , verifyAdminCode , resendVerifyCode  } = require('../controllers/adminController');
const { addCategory, deleteCategory, editCategory, getAllCategories } = require('../controllers/admin/categoris/categoryController');
const { addProduct, deleteProduct, getAllProducts, updateProduct } = require('../controllers/admin/products/ProductController');
const { uploadProductImage } = require('../utils/imageUpload');
const { checkEmail , checkVerifyCode , resetPassword }  = require('../controllers/admin/forgetpassword/forgetpasswordController');
const { approveOrder , getAllOrdersWithAddress ,  processOrderApproval , fetchOrdersWithAddresses } =  require('../controllers/admin/orders/orderController');

// Route POST pour la connexion de l'admin
router.post('/login', loginAdmin);

// Route pour vérifier le code de vérification de l'admin
router.post('/verify', verifyAdminCode);

// Route pour renvoyer le code de vérification à un admin
router.post('/resend-verify-code', resendVerifyCode);


// Route pour vérifier l'e-mail et envoyer un code de vérification
router.post('/check-email', checkEmail);

// Route pour vérifier le code de vérification
router.post('/check-verify-code', checkVerifyCode);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', resetPassword);


// Route POST pour ajouter une catégorie
router.post('/categories/add', uploadImage, addCategory);

// Route POST pour supprimer une catégorie
router.post('/categories/delete', deleteCategory);

// Route PUT pour éditer une catégorie
router.put('/categories/edit', uploadImage, editCategory);

// Route GET pour récupérer toutes les catégories
router.get('/categories', getAllCategories);

// Products Routes
router.post('/products/add', uploadProductImage, addProduct);
router.delete('/products/delete', deleteProduct);
router.get('/products', getAllProducts);
router.put('/products/:id', uploadProductImage, updateProduct);

// orders Routes
// مسار للموافقة على الطلب
router.post('/orders/approve-order', approveOrder);
// Définir la route pour obtenir toutes les commandes avec leurs adresses
router.get('/orders-with-address', getAllOrdersWithAddress);

// Nouvelle route pour confirmer une commande
router.post('/order/confirm', processOrderApproval);

// المسار لاسترجاع جميع الطلبات مع العناوين
router.get('/orders', fetchOrdersWithAddresses);


module.exports = router;
