// /controllers/userController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const {User,
    validateRegisterUser,validateLoginUser} = require('../models/user'); // Fonction pour l'inscription (signup)
const  { sendEmail } = require('../Email/testEmail');


exports.signup = async (req, res) => {
    // Valider les données de la requête
    const { error } = validateRegisterUser(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { users_name, users_password, users_email, users_phone } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({
            $or: [{ users_email }, { users_phone }]
        });

        if (existingUser) {
            return res.status(400).json({ status: 'failure', message: 'Email or phone already exists' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(users_password, 10);

        // Générer un code de vérification aléatoire
        const verifyCode = crypto.randomInt(10000, 99999).toString();

        // Créer un nouvel utilisateur
        const newUser = new User({
            users_name,
            users_password: hashedPassword,
            users_email,
            users_phone,
            users_verify_code: verifyCode
        });

        // Enregistrer l'utilisateur dans la base de données
        await newUser.save();
        // Envoyer l'e-mail avec le code de vérification
        // Envoyer l'e-mail avec le code de vérification
        const emailSubject = 'Code de vérification';
        const emailText = `Votre code de vérification est : ${verifyCode}`; // Contenu de l'e-mail avec le code
        await sendEmail(users_email, emailSubject, emailText); // Envoi du code de vérification par e-mail

        return res.status(201).json({ status: 'success', message: 'User created successfully' });

    } catch (error) {
        return res.status(500).json({ status: 'failure', message: error.message });
    }
};

// Fonction de login
exports.login = async (req, res) => {

    // Valider les données de la requête
    const { error } = validateLoginUser(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { users_email, users_password } = req.body;

    try {
        // Vérifier si l'utilisateur existe (sans la condition users_approve)
        const user = await User.findOne({ users_email });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Comparer le mot de passe avec bcrypt
        const isMatch = await bcrypt.compare(users_password, user.users_password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe invalide' });
        }

        // Connexion réussie - renvoyer toutes les données utilisateur sauf le mot de passe
        const userData = user.toObject(); // Convertir en objet JavaScript simple
        delete userData.users_password; // Supprimer le mot de passe pour des raisons de sécurité

        res.status(200).json({ message: 'Connexion réussie', user: userData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
