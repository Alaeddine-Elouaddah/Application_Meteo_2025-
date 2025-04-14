const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Assure-toi que le bon chemin est utilisé

// Route pour l'enregistrement
router.post("/register", authController.register);

// Route pour la vérification de l'email
router.post("/verify-code", authController.verifyCode); // Assurez-vous que la méthode est bien définie dans le controller

// Route pour la connexion
router.post("/login", authController.login);

module.exports = router;
