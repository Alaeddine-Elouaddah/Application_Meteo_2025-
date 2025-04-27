// routes/sourceMeteoRoutes.js
const express = require("express");
const router = express.Router();
const {
  ajouterSourceMeteo,
  obtenirSourcesMeteo,
  desactiverSourceMeteo,
  activerSourceMeteo,
  supprimerSourceMeteo,
} = require("../controllers/sourceMeteoController");

// Route pour ajouter une nouvelle source météo
router.post("/ajouter", ajouterSourceMeteo);

// Route pour obtenir toutes les sources météo
router.get("/sources", obtenirSourcesMeteo);

// Route pour désactiver une source météo
router.put("/desactiver/:id", desactiverSourceMeteo);

// Route pour activer une source météo
router.put("/activer/:id", activerSourceMeteo);

// Route pour supprimer une source météo
router.delete("/supprimer/:id", supprimerSourceMeteo);

module.exports = router;
