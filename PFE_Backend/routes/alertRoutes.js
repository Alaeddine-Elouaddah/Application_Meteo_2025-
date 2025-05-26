const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");
const { check } = require("express-validator");

// Middleware d'authentification pour toutes les routes
router.use(protect);
router.get("/triggered", alertController.getTriggeredAlerts);

// Routes de base pour les alertes
router
  .route("/")
  .get(alertController.getUserAlerts)
  .post(
    [
      check("type").notEmpty().withMessage("Le type d'alerte est requis"),
      check("condition").optional().isIn([">", "<", ">=", "<=", "==", "!="]),
      check("value").optional().isNumeric(),
      check("threshold").optional().isObject(),
      check("isActive").optional().isBoolean(),
    ],
    alertController.createAlert
  );

// Routes pour une alerte spécifique
router
  .route("/:id")
  .get(alertController.getAlertById)
  .patch(
    [
      check("isActive").optional().isBoolean(),
      check("condition").optional().isIn([">", "<", ">=", "<=", "==", "!="]),
      check("value").optional().isNumeric(),
    ],
    alertController.updateAlert
  )
  .delete(alertController.deleteAlert);

// Route spéciale pour déclencher manuellement la vérification
router.post("/check/now", alertController.manualAlertCheck);

// Route pour obtenir les alertes déclenchées

module.exports = router;
