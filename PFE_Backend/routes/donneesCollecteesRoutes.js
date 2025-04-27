// routes/donneesCollecteesRoutes.js

const express = require("express");
const {
  saveWeatherData,
} = require("../controllers/donneesCollecteesController");
const router = express.Router();

// Route pour récupérer et enregistrer les données météo pour une ville donnée
router.post("/collecter", async (req, res) => {
  const { city, lat, lon } = req.body;

  if (!city || !lat || !lon) {
    return res
      .status(400)
      .json({ message: "Ville, latitude et longitude sont nécessaires." });
  }

  await saveWeatherData(city, lat, lon);
  res
    .status(200)
    .json({ message: "Données météo récupérées et enregistrées avec succès." });
});

module.exports = router;
