const mongoose = require("mongoose");

const donneesCollecteesSchema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SourceMeteo",
      required: [true, "La source des données est obligatoire"],
      index: true,
    },
    ville: {
      type: String,
      required: [true, "La ville est obligatoire"],
      trim: true,
      maxlength: 100,
    },
    temperature: {
      type: Number,
      required: true,
      min: -50,
      max: 60,
    },
    humidite: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    vitesseVent: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    directionVent: {
      type: String,
      required: true,
      enum: [
        "Nord",
        "Nord-Est",
        "Est",
        "Sud-Est",
        "Sud",
        "Sud-Ouest",
        "Ouest",
        "Nord-Ouest",
      ],
    },
    indiceUv: {
      type: Number,
      required: true,
      min: 0,
      max: 15,
    },
    qualiteAir: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    niveauPollution: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    pression: {
      type: Number,
      required: true,
      min: 850,
      max: 1100,
    },
    visibilite: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    horodatage: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (v) {
          return v <= new Date();
        },
        message: "L'horodatage ne peut être dans le futur",
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["prevision", "donnee_reelle"],
      index: true,
    },
    localisation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: "Coordonées GPS invalides",
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
donneesCollecteesSchema.index({ localisation: "2dsphere" });
donneesCollecteesSchema.index({ ville: 1, type: 1, horodatage: -1 });

// Virtuals
donneesCollecteesSchema.virtual("niveauQualiteAir").get(function () {
  const aqi = this.qualiteAir;
  if (aqi <= 50) return "Excellent";
  if (aqi <= 100) return "Bon";
  if (aqi <= 150) return "Modéré";
  if (aqi <= 200) return "Mauvais";
  return "Très mauvais";
});

// Pre-save hook
donneesCollecteesSchema.pre("save", function (next) {
  if (
    this.type === "donnee_reelle" &&
    this.horodatage < new Date(Date.now() - 86400000)
  ) {
    throw new Error(
      "Les données réelles doivent être actuelles (moins de 24h)"
    );
  }
  next();
});

const DonneesCollectees = mongoose.model(
  "DonneesCollectees",
  donneesCollecteesSchema
);

module.exports = DonneesCollectees;
