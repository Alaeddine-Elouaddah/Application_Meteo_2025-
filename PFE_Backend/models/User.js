const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: {
      name: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lon: { type: Number },
      },
      lastUpdated: { type: Date },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true }, // Champ pour activer/désactiver le compte
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
