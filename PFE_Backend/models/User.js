const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "collaborateur", "stagiaire"],
      default: "stagiaire",
    },

    // Champ pour stocker le superviseur (collaborateur) du stagiaire
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence à un autre document User
      required: function () {
        return this.role === "stagiaire"; // Seulement requis pour les stagiaires
      },
    },

    service: {
      type: String,
      required: false,
    },
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
