const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator"); // Ajout de la librairie de validation

// Création de compte + envoi email de vérification
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé." });
    }

    // Génération du code de vérification (6 chiffres)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Création de l'utilisateur avec le code de vérification
    const user = new User({ username, email, password, verificationCode });
    await user.save();

    // Envoi de l'email avec le code de vérification
    const verificationLink = `http://localhost:8000/api/auth/verify-code`;
    await sendEmail(
      email,
      "Vérification de votre compte",
      `Votre code de vérification est : ${verificationCode}. 
      Cliquez <a href="${verificationLink}">ici</a> pour valider votre compte.`
    );

    res.status(201).json({ message: "Compte créé ! Vérifiez votre email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vérification du code envoyé par email
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body; // Récupère l'email et le code envoyé

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé." });
    }

    // Vérifier si le code est correct
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Code incorrect." });
    }

    // Si le code est correct, marquer l'utilisateur comme vérifié
    user.isVerified = true;
    user.verificationCode = undefined; // On efface le code de vérification
    await user.save();

    res.json({ message: "Email vérifié avec succès !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Connexion + JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Vérifiez votre email d'abord." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
