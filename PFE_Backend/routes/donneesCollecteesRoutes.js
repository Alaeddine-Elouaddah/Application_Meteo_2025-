const express = require("express");
const router = express.Router();
const {
  fetchAndSaveWeatherData,
  getLatestData,
} = require("../controllers/donneesCollecteesController");

router.get("/fetch-weather", fetchAndSaveWeatherData);
router.get("/latest-data", getLatestData);

module.exports = router;
