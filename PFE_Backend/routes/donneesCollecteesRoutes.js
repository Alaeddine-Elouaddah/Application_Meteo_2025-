const express = require("express");
const router = express.Router();
const controller = require("../controllers/donneesCollecteesController");

// Initialisation des données
router.get("/init", controller.insertAllCities);

// Ajout du jour suivant (pour cron job)
router.get("/add-next-day", async (req, res) => {
  try {
    await controller.addNextDayForecast();
    res.json({ message: "Jour suivant ajouté avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prévisions du jour
router.get("/today/:city", controller.getTodayForecast);

// Données horaires
router.get("/hourly/:city", controller.getHourlyData);
router.get("/hourly/:city/:date", controller.getHourlyData);

module.exports = router;
