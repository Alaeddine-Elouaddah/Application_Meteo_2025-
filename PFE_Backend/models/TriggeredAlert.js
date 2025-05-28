const mongoose = require("mongoose");

const triggeredAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert",
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
  },
  value: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["temperature", "humidity", "wind", "pressure", "rain", "uv"],
  },
  description: {
    type: String,
    required: false,
  },
  severity: {
    type: String,
    required: false,
    enum: ["Danger", "Warning", "Information"],
  },
  alertValue: {
    type: Number,
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("TriggeredAlert", triggeredAlertSchema);
