const mongoose = require("mongoose");

const sourceMeteoSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
  },
  urlApi: {
    type: String,
    required: true,
  },
  cleApi: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  creeLe: {
    type: Date,
    default: Date.now,
  },
});

const SourceMeteo = mongoose.model("SourceMeteo", sourceMeteoSchema);

module.exports = SourceMeteo;
