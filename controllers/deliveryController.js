const { Delivery, validateRegisterDelivery, validateLoginDelivery } = require('../models/delivery');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const  { sendEmail } = require('../Email/testEmail');


// وظيفة التسجيل
exports.signup = async (req, res) => {
    // التحقق من صحة بيانات الطلب
    const { error } = validateRegisterDelivery(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { delivery_name, delivery_password, delivery_email, delivery_phone } = req.body;

    try {
        // التحقق من وجود التوصيل بالفعل
        const existingDelivery = await Delivery.findOne({
            $or: [{ delivery_email }, { delivery_phone }]
        });

        if (existingDelivery) {
            return res.status(400).json({ status: 'failure', message: 'L\'email ou le téléphone existe déjà' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(delivery_password, 10);

        // توليد رمز تحقق عشوائي
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // إنشاء توصيل جديد
        const newDelivery = new Delivery({
            delivery_name,
            delivery_password: hashedPassword,
            delivery_email,
            delivery_phone,
            delivery_verify_code: verifyCode
        });

        // حفظ التوصيل في قاعدة البيانات
        await newDelivery.save();

        // إرسال بريد إلكتروني مع رمز التحقق
        const emailSubject = 'Code de vérification';
        const emailText = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(delivery_email, emailSubject, emailText);

        return res.status(201).json({ status: 'success', message: 'Livreur créé avec succès' });

    } catch (error) {
        return res.status(500).json({ status: 'failure', message: error.message });
    }
};

// وظيفة تسجيل الدخول
exports.login = async (req, res) => {
    // التحقق من صحة بيانات الطلب
    const { error } = validateLoginDelivery(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { delivery_email, delivery_password } = req.body;

    try {
        // التحقق من وجود التوصيل
        const delivery = await Delivery.findOne({ delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // مقارنة كلمة المرور مع bcrypt
        const isMatch = await bcrypt.compare(delivery_password, delivery.delivery_password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe invalide' });
        }

        // تسجيل الدخول بنجاح - إرسال جميع بيانات التوصيل ما عدا كلمة المرور
        const deliveryData = delivery.toObject();
        delete deliveryData.delivery_password; // حذف كلمة المرور لأسباب أمنية

        res.status(200).json({ message: 'Connexion réussie', delivery: deliveryData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction de vérification du code de vérification
exports.verifyCode = async (req, res) => {
    const { delivery_email, verify_code } = req.body;

    try {
        // Rechercher le livreur avec l'email et le code de vérification
        const delivery = await Delivery.findOne({ 
            delivery_email, 
            delivery_verify_code: verify_code 
        });

        if (!delivery) {
            // Si le livreur n'est pas trouvé ou que le code ne correspond pas
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Incorrect email or verification code.' 
            });
        }

        // Si le code est correct, mettre à jour les champs appropriés
        delivery.delivery_verify_code = "0"; // Réinitialiser le code de vérification
        delivery.delivery_approve = 1; // Approuver le livreur

        // Sauvegarder les modifications
        await delivery.save();

        return res.status(200).json({ 
            status: 'success', 
            message: 'Account verified successfully.' 
        });

    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({ 
            status: 'failure', 
            message: error.message 
        });
    }
};



// Contrôleur pour vérifier l'e-mail et envoyer un code de vérification
exports.checkEmail = async (req, res) => {
    const { delivery_email } = req.body;

    try {
        // Vérifier si le livreur existe
        const delivery = await Delivery.findOne({ delivery_email: delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: `Livreur avec l'email ${delivery_email} non trouvé` });
        }

        // Générer un code de vérification
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // Mettre à jour le code de vérification dans la base de données
        delivery.delivery_verify_code = verifyCode;
        await delivery.save();

        // Envoyer l'e-mail avec le code de vérification
        const subject = 'Code de vérification pour Ecommerce';
        const text = `Votre code de vérification est : ${verifyCode}`;
        await sendEmail(delivery_email, subject, text);

        res.status(200).json({ message: 'Code de vérification envoyé à l\'email' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour vérifier le code de vérification
exports.checkVerifyCode = async (req, res) => {
    const { delivery_email, verify_code } = req.body;

    try {
        // Vérifier si le livreur existe avec l'email et le code de vérification
        const delivery = await Delivery.findOne({ delivery_email: delivery_email, delivery_verify_code: verify_code });

        if (!delivery) {
            return res.status(404).json({ message: 'Code de vérification incorrect ou email invalide' });
        }

        // Si la vérification est réussie
        return res.status(200).json({ message: 'Vérification réussie', data: delivery });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
    const { delivery_email, newPassword } = req.body; // Supposons que vous envoyez un nouvel e-mail et un nouveau mot de passe dans la requête

    try {
        // Vérifier si le livreur existe
        const delivery = await Delivery.findOne({ delivery_email: delivery_email });

        if (!delivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe du livreur
        delivery.delivery_password = hashedPassword;
        await delivery.save();

        // (Optionnel) Envoyer un e-mail de confirmation
        const subject = 'Votre mot de passe a été réinitialisé';
        const text = 'Votre mot de passe a été mis à jour avec succès.';
        await sendEmail(delivery_email, subject, text); // Utilisez delivery_email ici

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Contrôleur pour renvoyer le code de vérification
exports.resendVerifyCode = async (req, res) => {
    const { delivery_email } = req.body;

    // Générer un code de vérification à 5 chiffres
    const newVerifyCode = Math.floor(10000 + Math.random() * 90000);

    try {
        // Mettre à jour le code de vérification du livreur
        const updatedDelivery = await Delivery.findOneAndUpdate(
            { delivery_email: delivery_email },
            { delivery_verify_code: newVerifyCode },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Livreur non trouvé' });
        }

        // Envoyer l'email avec le nouveau code de vérification
        await sendEmail(delivery_email, "Code de vérification", `Votre nouveau code de vérification est : ${newVerifyCode}`);

        res.status(200).json({ message: 'Nouveau code de vérification renvoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du code de vérification :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};