const mongoose = require("mongoose");

const donneesCollecteesSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SourceMeteo", // Référence à SourceMeteo
    required: true,
  },
  ville: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidite: {
    type: Number,
    required: true,
  },
  vitesseVent: {
    type: Number,
    required: true,
  },
  directionVent: {
    type: String,
    required: true,
  },
  indiceUv: {
    type: Number,
    required: true,
  },
  qualiteAir: {
    type: Number,
    required: true,
  },
  niveauPollution: {
    type: Number,
    required: true,
  },
  pression: {
    type: Number,
    required: true,
  },
  visibilite: {
    type: Number,
    required: true,
  },
  horodatage: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["prevision", "donnee_reelle"],
    required: true,
  },
});

const DonneesCollectees = mongoose.model(
  "DonneesCollectees",
  donneesCollecteesSchema
);

module.exports = DonneesCollectees;
