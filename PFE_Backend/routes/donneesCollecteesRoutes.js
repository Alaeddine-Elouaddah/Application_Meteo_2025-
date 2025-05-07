const express = require("express");
const router = express.Router();
const {
  insertAllCities,
  addNextDayForecast,
} = require("../controllers/donneesCollecteesController");

// Route pour l'insertion initiale
router.get("/init", insertAllCities);

// Route pour tester manuellement le cron job
router.get("/add-next-day", (req, res) => {
  addNextDayForecast()
    .then(() =>
      res.json({ message: "Ajout du jour suivant lancé avec succès" })
    )
    .catch((err) => res.status(500).json({ error: err.message }));
});

module.exports = router;
