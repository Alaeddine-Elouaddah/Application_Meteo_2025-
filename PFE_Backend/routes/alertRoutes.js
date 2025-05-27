const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");
const { check } = require("express-validator");

// Middleware d'authentification pour toutes les routes SAUF celles exclues explicitement
router.use((req, res, next) => {
  if (req.path === "/check/now") {
    return next(); // Skip l'authentification pour cette route
  }
  protect(req, res, next); // Applique l'authentification pour les autres routes
});

// Routes protégées (sauf /check/now)
router.get("/triggered", alertController.getTriggeredAlerts);

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

// Route **sans authentification** pour déclencher manuellement la vérification
router.post("/check/now", alertController.manualAlertCheck);

module.exports = router;
