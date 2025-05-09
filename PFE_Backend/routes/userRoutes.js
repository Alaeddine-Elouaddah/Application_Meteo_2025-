const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protection et restriction à l'admin
router.use(authController.protect);
router.use(authController.restrictTo("admin")); // Note: "admin" en minuscule pour correspondre à votre modèle
router.patch(
  "/:id/active-status",
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUserActiveStatus
);
// Routes pour la gestion des utilisateurs
router
  .route("/")
  .get(userController.getAllUsers) // GET /api/v1/users
  .post(userController.createUser); // POST /api/v1/users

// Route pour obtenir les utilisateurs normaux (remplace /collaborators)
router.route("/users-list").get(userController.getUsers); // GET /api/v1/users/users-list

router
  .route("/:id")
  .get(userController.getUser) // GET /api/v1/users/:id
  .patch(userController.updateUser) // PATCH /api/v1/users/:id
  .delete(userController.deleteUser); // DELETE /api/v1/users/:id

module.exports = router;
