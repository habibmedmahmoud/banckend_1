const Product = require('../../../models/product');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Gestion des fichiers

// Ajouter un produit
exports.addProduct = async (req, res) => {
    const { 
        name, 
        namear, 
        desc, 
        descar, 
        count, 
        price, 
        discount = 0, // 0 par défaut
        catid, 
        active,  // Géré plus bas avec une valeur par défaut
        favorite // Géré plus bas avec une valeur par défaut
    } = req.body;

    try {
        // Validation des champs obligatoires
        if (!name || !namear || !desc || !descar || !count || !price || !catid) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé.' });
        }

        const imagename = req.file.filename; // Nom de l'image uploadée

        // Définir les valeurs par défaut si elles ne sont pas fournies
        const productActive = active === 'true' || active === true; // Défaut à false si non fourni
        const productFavorite = favorite === 'true' || favorite === true; // Défaut à false si non fourni

        // Création du produit
        const newProduct = new Product({
            products_name: name,
            products_name_ar: namear,
            products_desc: desc,
            products_desc_ar: descar,
            products_count: count,
            products_price: price,
            products_discount: discount,
            products_image: imagename,
            products_cat: catid,
            products_active: productActive, // Valeur par défaut ou donnée reçue
            favorite: productFavorite // Valeur par défaut ou donnée reçue
        });

        // Sauvegarder le produit
        await newProduct.save();

        // Réponse avec succès
        res.status(201).json({ message: 'Produit ajouté avec succès', product: newProduct });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Erreur lors de l\'ajout du produit', error: error.message });
    }
};
// Fonction pour récupérer tous les produits avec leurs catégories
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'products_cat',
                    foreignField: '_id',
                    as: 'category_info'
                }
            },
            { $unwind: '$category_info' }
        ]);

        res.status(200).json({ message: 'Produits récupérés avec succès', data: products });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message });
    }
};

// Fonction pour modifier un produit
exports.updateProduct = async (req, res) => {
    const { 
        name, namear, desc, descar, count, active, 
        price, discount, catid, imageold 
    } = req.body;

    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé.' });
        }

        const category = await Category.findById(catid);
        if (!category) {
            return res.status(400).json({ message: 'Catégorie invalide.' });
        }

        product.products_name = name;
        product.products_name_ar = namear;
        product.products_desc = desc;
        product.products_desc_ar = descar;
        product.products_count = count;
        product.products_active = active;
        product.products_price = price;
        product.products_discount = discount;
        product.products_cat = catid;

        if (req.file) {
            const newImage = req.file.filename;

            if (imageold) {
                const oldImagePath = path.join(__dirname, '../uploads/products', imageold);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Erreur lors de la suppression de l\'image:', err);
                    }
                });
            }

            product.products_image = newImage;
        }

        await product.save();
        res.status(200).json({ message: 'Produit modifié avec succès', product });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la modification du produit', error: error.message });
    }
};

// Fonction pour supprimer un produit
exports.deleteProduct = async (req, res) => {
    const { id, imagename } = req.body;

    try {
        const imagePath = path.join(__dirname, '../uploads/products', imagename);
        deleteFile(imagePath);

        const result = await Product.deleteOne({ _id: id });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Produit non trouvé.' });
        }

        res.status(200).json({ message: 'Produit supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
    }
};

// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
