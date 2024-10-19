const mongoose = require('mongoose');
require('dotenv').config(); // Charger les variables d'environnement

async function connectToDB() {
    try {
        // Connecter à MongoDB avec des options
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Connection failed to MongoDB:", error.message);
    }
}

module.exports = connectToDB;
