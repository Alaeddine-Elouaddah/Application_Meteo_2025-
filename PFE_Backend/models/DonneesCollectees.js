const mongoose = require("mongoose");

const DonneesCollecteesSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true },
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
    forecast: {
      type: [
        {
          date: String, // Format "DD/MM/YYYY"
          dayName: String, // "Lundi", "Mardi", etc.
          temp: Number,
          tempMin: Number,
          tempMax: Number,
          condition: String,
          icon: String,
          humidity: Number,
          windSpeed: Number,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    lastUpdated: Date,
  },
  { timestamps: true }
);

// Index pour les recherches fréquentes
DonneesCollecteesSchema.index({ city: 1 });
DonneesCollecteesSchema.index({ "forecast.date": 1 });

module.exports = mongoose.model("DonneesCollectees", DonneesCollecteesSchema);
