const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// Assurez-vous que ces deux fonctions sont bien exportées depuis authController
router.use(authController.protect); // Middleware d'authentification
router.use(authController.restrictTo("Administrator")); // Restriction de rôle

// Routes pour la gestion des utilisateurs
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route("/collaborators").get(userController.getCollaborators);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
