const mongoose = require("mongoose");

const DonneesCollecteesSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coord: {
      lat: { type: Number },
      lon: { type: Number },
    },
    temperature: { type: Number },
    feelsLike: { type: Number },
    humidity: { type: Number },
    pressure: { type: Number },
    windSpeed: { type: Number },
    windDeg: { type: Number },
    condition: { type: String },
    icon: { type: String },
    rain: { type: Number, default: 0 },
    snow: { type: Number, default: 0 },
    clouds: { type: Number },
    airQuality: { type: Object },
    uvIndex: { type: Number },
    alerts: { type: Array },
    forecast: { type: Array }, // Stocke les données de prévision
    hourly: { type: Array }, // Données horaires
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonneesCollectees", DonneesCollecteesSchema);
