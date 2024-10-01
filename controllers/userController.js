// /controllers/userController.js
const bcrypt = require('bcryptjs');
const {User,
    validateRegisterUser,validateLoginUser} = require('../models/user'); // Fonction pour l'inscription (signup)


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

        // Créer un nouvel utilisateur
        const newUser = new User({
            users_name,
            users_password: hashedPassword,
            users_email,
            users_phone,
            users_verify_code: "0"
        });

        // Enregistrer l'utilisateur dans la base de données
        await newUser.save();

        return res.status(201).json({ status: 'success', message: 'User created successfully' });

    } catch (error) {
        return res.status(500).json({ status: 'failure', message: error.message });
    }
};

// Fonction pour la connexion (login)
exports.login = async (req, res) => {
    // Valider les données de connexion
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ status: 'failure', message: error.details[0].message });
    }

    const { users_email, users_password } = req.body;

    try {
        // Vérifier si l'utilisateur existe par email
        const user = await User.findOne({ users_email });
        if (!user) {
            return res.status(404).json({ status: 'failure', message: 'Invalid email or password' });
        }

        // Comparer les mots de passe
        const isMatch = await bcrypt.compare(users_password, user.users_password);
        if (!isMatch) {
            return res.status(400).json({ status: 'failure', message: 'Invalid email or password' });
        }

        // Si tout est correct, renvoyer les informations de l'utilisateur
        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                users_name: user.users_name,
                users_email: user.users_email,
                users_phone: user.users_phone, // Correction ici, utiliser users_phone au lieu de users_password
            }
        });

    } catch (error) {
        return res.status(500).json({ status: 'failure', message: error.message });
    }
};