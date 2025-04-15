const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // Code envoyé pour vérifier le compte

  resetCode: { type: String }, // Code envoyé pour réinitialiser le mot de passe
  resetCodeExpires: { type: Date }, // Expiration du code
});

module.exports = mongoose.model("User", UserSchema);
