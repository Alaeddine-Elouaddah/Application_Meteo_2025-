const express = require("express");
const router = express.Router();
const donneesCollecteesController = require("../controllers/donneesCollecteesController");

// Route pour enregistrer des données
router.post("/", donneesCollecteesController.enregistrerDonnees);

// Route pour obtenir des données de comparaison
router.get("/comparaison", donneesCollecteesController.obtenirComparaison);

// Route pour obtenir la dernière donnée d'une ville
router.get(
  "/derniere/:ville",
  donneesCollecteesController.obtenirDerniereDonnee
);

module.exports = router;
