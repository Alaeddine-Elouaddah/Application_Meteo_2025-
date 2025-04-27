const express = require("express");
const router = express.Router();
const {
  enregistrerStatistiquesMensuelles,
} = require("../controllers/statistiquesMensuellesController");

// Route pour enregistrer les statistiques mensuelles
router.post("/", enregistrerStatistiquesMensuelles);

module.exports = router;
