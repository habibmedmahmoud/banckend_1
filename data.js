// Données des admins à insérer
const admins = [

    {
        admin_name: "habib ",
        admin_email: "bibbrahimsalem@gmail.com",
        admin_phone: "41863676",
        admin_role: 1, // 1 = Admin
        admin_verify_code: "12345",
        admin_approve: 0, // 1 = Approuvé
        admin_password: "123456" // Mot de passe
    },
    {
        admin_name: "Admin Principal",
        admin_email: "admin@example.com",
        admin_phone: "0123456789",
        admin_role: 1, // 1 = Admin
        admin_verify_code: "12345",
        admin_approve: 1, // 1 = Approuvé
        admin_password: "admin123" // Mot de passe
    },
    {
        admin_name: "Admin Secondaire",
        admin_email: "admin2@example.com",
        admin_phone: "0123456788",
        admin_role: 1, // 1 = Admin
        admin_verify_code: "65432",
        admin_approve: 1, // 1 = Approuvé
        admin_password: "admin123" // Mot de passe
    },
    {
        admin_name: "Super Admin",
        admin_email: "superadmin@example.com",
        admin_phone: "0123456787",
        admin_role: 2, // 2 = Super Admin
        admin_verify_code: "abcde",
        admin_approve: 1, // 1 = Approuvé
        admin_password: "superadmin123" // Mot de passe
    },
    {
        admin_name: "Admin Test",
        admin_email: "testadmin@example.com",
        admin_phone: "0123456786",
        admin_role: 1, // 1 = Admin
        admin_verify_code: "xyz12",
        admin_approve: 0, // 0 = Non approuvé
        admin_password: "testadmin123" // Mot de passe
    }
];

module.exports = {
    admins // Exporter la liste des admins
};
