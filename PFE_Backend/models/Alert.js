const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["temperature", "humidity", "wind", "pressure", "rain", "uv"],
  },
  description: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    enum: [">", "<", "=", ">=", "<="],
  },
  value: {
    type: Number,
    required: true,
  },
  threshold: {
    min: Number,
    max: Number,
  },
  severity: {
    type: String,
    required: true,
    enum: ["Danger", "Avertissement", "Information"],
    default: "Information",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
