const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('./models/admin'); // Importer le modèle Admin
const { admins } = require('./data');
const connectToDB = require('./config/db');

// Connecter à la base de données
connectToDB();

const importAdmins = async () => {
    try {
        for (const adminData of admins) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.admin_password, salt);
            
            const admin = new Admin({
                ...adminData,
                admin_password: hashedPassword // Utiliser le mot de passe haché
            });

            await admin.save();
            console.log(`Admin ajouté: ${admin.admin_name}`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'insertion de l\'admin :', error.message);
        process.exit(1);
    }
};

const removeAdmins = async () => {
    try {
        await Admin.deleteMany();
        console.log("Admins supprimés.");
    } catch (error) {
        console.error('Erreur lors de la suppression des admins :', error.message);
        process.exit(1);
    }
};

// Exécution du script en fonction des arguments
if (process.argv[2] === "-import") {
    importAdmins();
} else if (process.argv[2] === "-remove") {
    removeAdmins();
} else {
    console.log("Utilisation : node seeder.js -import | -remove");
}