const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Assure-toi que le bon chemin est utilisé

router.post("/register", authController.register);
router.post("/verify-code", authController.verifyCode);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetPassword);
module.exports = router;
