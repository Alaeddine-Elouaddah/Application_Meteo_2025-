const StatistiquesMensuelles = require("../models/StatistiquesMensuelles");

// Fonction pour enregistrer les statistiques mensuelles
async function enregistrerStatistiquesMensuelles(req, res) {
  try {
    const {
      ville,
      mois,
      temperatureMoyenne,
      humiditeMoyenne,
      precipitationTotale,
      vitesseVentMoyenne,
      qualiteAirMoyenne,
      pollutionTotale,
    } = req.body;

    // Vérifier si les données existent déjà
    const statistiquesExistantes = await StatistiquesMensuelles.findOne({
      ville,
      mois,
    });

    if (statistiquesExistantes) {
      return res.status(400).json({
        message: "Les statistiques mensuelles existent déjà pour ce mois.",
      });
    }

    // Créer une nouvelle statistique mensuelle
    const nouvellesStatistiques = new StatistiquesMensuelles({
      ville,
      mois,
      temperatureMoyenne,
      humiditeMoyenne,
      precipitationTotale,
      vitesseVentMoyenne,
      qualiteAirMoyenne,
      pollutionTotale,
    });

    // Enregistrer les données dans la base
    await nouvellesStatistiques.save();

    res.status(201).json({
      message: "Statistiques mensuelles enregistrées avec succès",
      data: nouvellesStatistiques,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'enregistrement des statistiques mensuelles.",
    });
  }
}

module.exports = { enregistrerStatistiquesMensuelles };
