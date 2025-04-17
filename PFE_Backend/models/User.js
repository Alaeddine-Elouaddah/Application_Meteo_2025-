const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Rôles spécifiques à ton application
  role: {
    type: String,
    enum: ["admin", "collaborateur", "stagiaire"], // Tes rôles personnalisés
    default: "stagiaire", // Valeur par défaut
  },

  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);
