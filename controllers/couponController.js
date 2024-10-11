const Coupon = require('../models/coupon'); // Assure-toi que ton modèle Coupon est bien importé

// Fonction pour obtenir un coupon valide
const getCoupon = async (req, res) => {
    try {
        // Récupérer le nom du coupon depuis le corps de la requête
        const { couponname } = req.body;
        
        // Obtenir la date et l'heure actuelles
        const now = new Date();

        // Chercher un coupon qui correspond aux critères
        const coupon = await Coupon.findOne({
            coupon_name: couponname,               // Cherche le coupon par son nom
            coupon_expiredate: { $gt: now },       // Date d'expiration doit être supérieure à la date actuelle
            coupon_count: { $gt: 0 }               // Le nombre de coupons disponibles doit être supérieur à 0
        });

        // Si aucun coupon n'est trouvé
        if (!coupon) {
            return res.status(404).json({
                status: 'error',
                message: 'Coupon non valide ou expiré'
            });
        }

        // Réponse en cas de succès avec le coupon trouvé
        return res.status(200).json({
            status: 'success',
            message: 'Coupon valide',
            data: coupon
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du coupon:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération du coupon'
        });
    }
};

// Exporter la fonction pour utilisation dans les routes
module.exports = {
    getCoupon
};
