const mongoose = require("mongoose");

const statistiquesMensuellesSchema = new mongoose.Schema({
  ville: {
    type: String,
    required: true,
  },
  mois: {
    type: String, // Format `YYYY-MM`
    required: true,
  },
  temperatureMoyenne: {
    type: Number,
    required: true,
  },
  humiditeMoyenne: {
    type: Number,
    required: true,
  },
  precipitationTotale: {
    type: Number,
    required: true,
  },
  vitesseVentMoyenne: {
    type: Number,
    required: true,
  },
  qualiteAirMoyenne: {
    type: Number,
    required: true,
  },
  pollutionTotale: {
    type: Number,
    required: true,
  },
  creeLe: {
    type: Date,
    default: Date.now,
  },
});

const StatistiquesMensuelles = mongoose.model(
  "StatistiquesMensuelles",
  statistiquesMensuellesSchema
);

module.exports = StatistiquesMensuelles;
