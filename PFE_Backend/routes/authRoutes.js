const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Assure-toi que le bon chemin est utilisé
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/verify-code", authController.verifyCode);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout); // Nouvelle route de déconnexion
router.put("/update-city", protect, authController.updateUserCity); // Nouvelle route protégée
router.get("/me", protect, authController.getMe);

module.exports = router;
