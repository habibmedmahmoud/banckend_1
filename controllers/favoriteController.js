const mongoose = require('mongoose');
const Favorite = require('../models/favorite'); // مسار نموذج المفضلات
const Product = require('../models/product');   // مسار نموذج المنتجات
const User = require('../models/user'); 
const { ObjectId } = mongoose.Types; // Assurez-vous que cela soit bien importé

const getMyFavorites = async (req, res) => {
    try {
        const { userId } = req.params; // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête

        // Vérifier si userId est un ID valide
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide." });
        }

        const favorites = await Favorite.aggregate([
            {
                $match: { favorite_usersid: new ObjectId(userId) } // Utiliser new ObjectId
            },
            {
                $lookup: {
                    from: 'products', // Nom de la collection des produits
                    localField: 'favorite_productsid', // Champ dans la collection des favoris
                    foreignField: '_id', // Champ dans la collection des produits
                    as: 'productInfo' // Nom sous lequel stocker les informations des produits
                }
            },
            {
                $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } // Applatir les données du produit
            },
            {
                $project: {
                    _id: 1,
                    favorite_usersid: 1,
                    favorite_productsid: 1,
                    'productInfo.products_name': 1,
                    'productInfo.products_name_ar': 1,
                    'productInfo.products_desc': 1,
                    'productInfo.products_desc_ar': 1,
                    'productInfo.products_image': 1,
                    'productInfo.products_price': 1,
                    'productInfo.products_discount': 1,
                    'productInfo.products_count': 1,
                    'productInfo.products_active': 1,
                    'productInfo.products_date': 1,
                    'productInfo.products_cat': 1
                }
            }
        ]);

        if (!favorites.length) {
            return res.status(404).json({ message: "Aucun favori trouvé." });
        }

        res.json(favorites); // Retourner les données au client
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des favoris." });
    }
};


const toggleFavorite = async (req, res) => {
    try {
        const { usersid, productsid } = req.body;

        // Recherche du produit dans les favoris de l'utilisateur
        const favorite = await Favorite.findOne({
            favorite_usersid: new mongoose.Types.ObjectId(usersid),
            favorite_productsid: new mongoose.Types.ObjectId(productsid),
        });

        // Rechercher le produit pour le mettre à jour
        const product = await Product.findById(new mongoose.Types.ObjectId(productsid));

        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Produit non trouvé' });
        }

        if (favorite) {
            // Si le produit est déjà dans les favoris, on le supprime
            await Favorite.deleteOne({ _id: favorite._id });
            // Mettre à jour le champ favorite à false
            product.favorite = false; // Mise à jour à false
            await product.save();
            return res.status(200).json({
                status: 'success',
                message: 'Le produit a été retiré des favoris avec succès'
            });
        } else {
            // Si le produit n'est pas dans les favoris, on l'ajoute
            const newFavorite = new Favorite({
                favorite_usersid: new mongoose.Types.ObjectId(usersid),
                favorite_productsid: new mongoose.Types.ObjectId(productsid),
            });

            await newFavorite.save();
            // Mettre à jour le champ favorite à true
            product.favorite = true; // Mise à jour à true
            await product.save();
            return res.status(200).json({
                status: 'success',
                message: 'Le produit a été ajouté aux favoris avec succès'
            });
        }

    } catch (error) {
        console.error('Une erreur s\'est produite lors de la gestion des favoris:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { usersid, productsid } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(usersid) || !mongoose.Types.ObjectId.isValid(productsid)) {
            return res.status(400).json({ status: 'error', message: 'IDs invalides' });
        }

        const favorite = await Favorite.findOne({ 
            favorite_usersid: usersid, 
            favorite_productsid: productsid 
        });
        
        if (!favorite) {
            return res.status(404).json({ status: 'error', message: 'Favori non trouvé' });
        }

        await Favorite.deleteOne({ _id: favorite._id });

        const product = await Product.findById(productsid);
        if (product) {
            product.favorite = false; 
            await product.save();
        }

        res.status(200).json({ status: 'success', message: 'Favori supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du favori :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
};

const deleteFavoriteById = async (req, res) => {
    try {
        // استرجاع المعرف من عنوان URL
        const id = req.params.id;

        // التحقق من صحة ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'معرّف غير صالح' });
        }

        // حذف العنصر من قاعدة البيانات
        const result = await Favorite.deleteOne({ _id: id });

        // التحقق مما إذا تم الحذف بنجاح
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'المفضل غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف المفضل بنجاح' });
    } catch (error) {
        console.error('خطأ في حذف المفضل:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};

module.exports = {
    getMyFavorites,
    removeFavorite,
    toggleFavorite ,
    deleteFavoriteById
    
};
