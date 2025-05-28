const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getTriggeredAlerts,
  markAsRead,
} = require("../controllers/triggeredAlertController");

// Routes protégées par l'authentification
router.get("/", protect, getTriggeredAlerts);
router.put("/:alertId/read", protect, markAsRead);

module.exports = router;
