const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// 🔐 Créer un compte + envoyer un code de vérification
exports.register = async (req, res) => {
  try {
    const { username, email, password, service } = req.body;

    // Validation des champs
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Tous les champs sont obligatoires." });
    }

    // Vérifie si l'email est déjà utilisé (insensible à la casse)
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé." });
    }

    // Vérification de la force du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    // Génère un code de vérification unique (6 chiffres)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Hash du mot de passe avec un salt généré automatiquement
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crée un nouvel utilisateur
    const user = new User({
      username,
      email: email.toLowerCase(), // Normalise l'email en minuscules
      password: hashedPassword,

      verificationCode,
      isVerified: false,
    });

    // Sauvegarde l'utilisateur
    await user.save();

    // Envoi de l'email de vérification
    await sendEmail(
      email,
      "Vérification de votre compte",
      `Votre code de vérification est : ${verificationCode}`
    );

    // Génération du token (comme dans le deuxième code)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    const { password: userPassword, ...userWithoutPassword } = user._doc;

    res.status(201).json({
      ...userWithoutPassword,
      token,
      message: "Compte créé ! Vérifiez votre email.",
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      error: "Erreur serveur lors de l'inscription.",
      details: error.message,
    });
  }
};

// ✅ Vérifier le code de vérification
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email et code requis." });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Code incorrect." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // Générer un nouveau token après vérification
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    const { password, ...userWithoutPassword } = user._doc;

    res.json({
      ...userWithoutPassword,
      token,
      message: "Email vérifié avec succès !",
    });
  } catch (error) {
    console.error("Erreur vérification code:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la vérification.",
      details: error.message,
    });
  }
};

// 🔐 Connexion + JWT
// 🔐 Connexion + JWT - Version améliorée
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation plus détaillée
    if (!email || !password) {
      return res.status(400).json({
        error: "Champs requis",
        details: "L'email et le mot de passe sont obligatoires",
      });
    }

    // Vérification format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Format email invalide",
        details: "Veuillez entrer une adresse email valide",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Messages d'erreur plus précis
    if (!user) {
      return res.status(401).json({
        error: "Authentification échouée",
        details: "Aucun compte trouvé avec cet email",
      });
    }

    // Vérification si le compte est désactivé
    if (user.isActive === false) {
      return res.status(403).json({
        error: " Compte désactivé — contactez l’administrateur.",
        details:
          "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Authentification échouée",
        details: "Mot de passe incorrect",
      });
    }

    if (!user.isVerified) {
      // Envoyer un nouveau code de vérification si nécessaire
      if (!user.verificationCode) {
        user.verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        await user.save();
        await sendEmail(
          user.email,
          "Vérification de votre compte",
          `Votre nouveau code de vérification est : ${user.verificationCode}`
        );
      }

      return res.status(403).json({
        error: "Compte non vérifié",
        details: "Veuillez vérifier votre email",
        verificationRequired: true,
        email: user.email,
      });
    }

    // Génération token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    // Mise à jour de la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Réponse réussie
    const { password: _, ...userData } = user.toObject();
    return res.json({
      success: true,
      user: userData,
      token,
      message: "Connexion réussie",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      details: "Une erreur est survenue lors de la connexion",
    });
  }
};
// 🔑 Mot de passe oublié - Envoi code de réinitialisation
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis." });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Aucun utilisateur avec cet email." });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000; // 1 heure

    await user.save();

    await sendEmail(
      email,
      "Réinitialisation de mot de passe",
      `Votre code de réinitialisation est : ${resetCode} (valide 1 heure)`
    );

    res.json({
      message: "Code envoyé avec succès.",
      email: email,
    });
  } catch (error) {
    console.error("Erreur mot de passe oublié:", error);
    res.status(500).json({
      error: "Erreur serveur lors de l'envoi du code.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ Vérification du code de réinitialisation
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email et code requis." });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (user.resetCode !== code || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    res.json({
      message: "Code vérifié avec succès.",
      email: email,
      resetToken: jwt.sign(
        { userId: user._id, email: user.email, resetCode: code },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      ),
    });
  } catch (error) {
    console.error("Erreur vérification code reset:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la vérification.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔄 Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ error: "Tous les champs sont obligatoires." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (user.resetCode !== code || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    // Vérifier si le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        error: "Le nouveau mot de passe doit être différent de l'ancien.",
      });
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    // Envoyer un email de confirmation
    await sendEmail(
      email,
      "Mot de passe modifié",
      "Votre mot de passe a été modifié avec succès."
    );

    res.json({
      message: "Mot de passe réinitialisé avec succès !",
      email: email,
    });
  } catch (error) {
    console.error("Erreur reset password:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la réinitialisation.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.protect = (req, res, next) => {
  // logique d'auth
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // logique de restriction de rôle
    next();
  };
};
// authController.js
exports.protect = (req, res, next) => {
  // logique d'auth
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // logique de restriction de rôle
    next();
  };
};
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Mettre à jour la date de déconnexion
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
