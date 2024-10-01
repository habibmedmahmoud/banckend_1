const nodemailer = require('nodemailer');

// Créer une fonction pour envoyer un e-mail
function sendEmail(to, subject, text) {
    // Configurer le transporteur (transporter)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Utilise Gmail, tu peux changer pour un autre service comme Outlook, Yahoo, etc.
        auth: {
            user: 'bibbrahimsalem@gmail.com', // Ton email
            pass: 'ctmy eukz hlxk uzff' // Le mot de passe ou le mot de passe d'application si tu utilises Gmail
        }
    });

    // Détails de l'e-mail
    const mailOptions = {
        from: 'bibbrahimsalem@gmail.com', // De qui provient l'e-mail
        to: to, // L'adresse e-mail du destinataire (passée comme argument)
        subject: subject, // Sujet de l'e-mail (passé comme argument)
        text: text, // Contenu du message (passé comme argument)
        cc: 'habibmedmahmoud5@gmail.com' // CC optionnel
    };

    // Envoyer l'e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erreur lors de l\'envoi de l\'e-mail:', error);
        } else {
            console.log('E-mail envoyé: ' + info.response);
        }
    });
}

module.exports = {
    sendEmail
};
