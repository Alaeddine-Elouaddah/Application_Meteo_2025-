const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protection et restriction à l'admin
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

// Routes pour la gestion des utilisateurs
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

// Route pour vérifier la disponibilité d'un email
router.get("/check-email/:email", userController.checkEmail);

// Route pour obtenir les utilisateurs normaux
router.get("/users-list", userController.getUsers);

// Route pour gérer le statut actif
router.patch("/:id/active-status", userController.updateUserActiveStatus);

// Route pour mettre à jour la ville d'un utilisateur
router.post(
  "/update-city",
  authController.protect,
  userController.updateUserCity
);

// Route corrigée pour toggle-status
router.patch(
  "/:id/toggle-status",
  authController.protect,
  authController.restrictTo("admin"),
  userController.toggleUserStatus
);

// Routes pour un utilisateur spécifique
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
