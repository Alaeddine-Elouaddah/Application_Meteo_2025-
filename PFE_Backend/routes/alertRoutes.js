const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router
  .route("/")
  .post(alertController.createAlert)
  .get(alertController.getUserAlerts);

router
  .route("/:id")
  .patch(alertController.updateAlert)
  .delete(alertController.deleteAlert);

module.exports = router;
