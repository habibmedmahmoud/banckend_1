// controllers/addressController.js
const { Address, validateAddAddress, validateUpdateAddress } = require('../models/address');

const addAddress = async (req, res) => {
    try {
        // Valider les données reçues avec Joi
        const { error } = validateAddAddress(req.body);
        if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

        const { address_usersid,address_name , address_city, address_street, address_lat, address_long } = req.body;

        // Créer une nouvelle adresse
        const newAddress = new Address({
            address_usersid,
            address_name,
            address_city,
            address_street,
            address_lat,
            address_long
        });

        // Sauvegarder l'adresse dans la base de données
        await newAddress.save();

        return res.status(200).json({
            status: 'success',
            message: 'Adresse ajoutée avec succès',
            data: newAddress
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de l\'adresse:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Erreur serveur'
        });
    }
};

const updateAddress = async (req, res) => {
    try {
         // Valider les données reçues avec Joi
         const { error } = validateUpdateAddress(req.body);
         if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });
        // Extraire l'ID de l'adresse depuis les paramètres de l'URL
        const { id } = req.params;  // Récupérer l'ID depuis l'URL

        // Extraire les données du corps de la requête
        const { address_name, address_city, address_street, address_lat, address_long } = req.body;

        // Vérifier que l'ID de l'adresse est fourni
        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'L\'ID de l\'adresse est requis'
            });
        }

        // Mise à jour de l'adresse
        const updatedAddress = await Address.findByIdAndUpdate(
            id,  // Utilisez l'ID de l'adresse récupéré dans les paramètres
            {
                address_city,   // Nouvelle valeur de la ville
                address_street, // Nouvelle valeur de la rue
                address_lat,    // Nouvelle valeur de latitude
                address_long,   // Nouvelle valeur de longitude
                address_name    // Nouvelle valeur de nom
            },
            { new: true } // Retourner l'adresse mise à jour après l'opération
        );

        // Si l'adresse n'existe pas
        if (!updatedAddress) {
            return res.status(404).json({
                status: 'error',
                message: 'Adresse non trouvée'
            });
        }

        // Réponse en cas de succès
        return res.status(200).json({
            status: 'success',
            message: 'Adresse mise à jour avec succès',
            data: updatedAddress
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour de l\'adresse'
        });
    }
};





const deleteAddress = async (req, res) => {
    try {
        // Ici, utilisez 'id' pour extraire l'ID de l'URL
        const { id } = req.params; // 'id' extrait des paramètres de l'URL

        // Vérifier si l'ID est fourni
        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'L\'ID de l\'adresse est requis'
            });
        }

        // Supprimer l'adresse de la base de données
        const deletedAddress = await Address.findByIdAndDelete(id);

        // Vérifier si l'adresse existe et a été supprimée
        if (!deletedAddress) {
            return res.status(404).json({
                status: 'error',
                message: 'Adresse non trouvée'
            });
        }

        // Répondre avec un succès
        return res.status(200).json({
            status: 'success',
            message: 'Adresse supprimée avec succès'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'adresse:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Erreur serveur'
        });
    }
};


const getAllAddresses = async (req, res) => {
    const usersid = req.params.usersid; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

    try {
        // Récupérer toutes les adresses pour cet utilisateur
        const addresses = await Address.find({ address_usersid: usersid });
        
        // Vérifier si des adresses ont été trouvées
        if (addresses.length === 0) {
            return res.status(404).json({
                status: 'not_found',
                message: 'Aucune adresse trouvée pour cet utilisateur.'
            });
        }

        // Si des adresses sont trouvées, les retourner avec succès
        return res.status(200).json({
            status: 'success',
            message: 'Adresses récupérées avec succès',
            data: addresses
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des adresses:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération des adresses'
        });
    }
};







module.exports = { addAddress , updateAddress ,deleteAddress , getAllAddresses }; // Assurez-vous que addAddress est exporté
