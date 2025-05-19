const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["temperature", "humidity", "wind", "pressure", "rain"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["above", "below", "equals"],
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: {
      min: {
        type: Number,
        default: null,
      },
      max: {
        type: Number,
        default: null,
      },
    },

    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);
