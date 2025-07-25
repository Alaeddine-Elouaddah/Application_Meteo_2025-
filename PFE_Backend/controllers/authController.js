const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

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
      verificationCodeExpires: Date.now() + 3600000, // Expire dans 1 heure
      isVerified: false,
    });

    // Sauvegarde l'utilisateur
    await user.save();

    // Envoi de l'email de vérification
    const imageBase64 = fs
      .readFileSync(path.join(__dirname, "../Alert_base64.txt"), "utf8")
      .replace(/(\r\n|\n|\r)/gm, "");
    const htmlWelcome = `
      <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; box-shadow: 0 2px 8px #e0e0e0;">
        <div style="text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/3767/3767036.png" alt="Bienvenue" style="width: 120px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 8px #d1e7dd;" />
          <h2 style="color: #2d7a2d; margin-bottom: 10px;">Bienvenue chez <span style='color:#007bff'>Notre Plateforme</span> !</h2>
          <p style="font-size: 1.1em; color: #333;">Bonjour <b>${username}</b>,<br>Merci de vous être inscrit !</p>
          <div style="background: #fff; border-radius: 8px; padding: 18px 10px; margin: 18px 0; border: 1px solid #e0e0e0;">
            <span style="font-size: 1.1em; color: #555;">Votre code de vérification :</span><br>
            <span style="font-size: 2em; color: #007bff; font-weight: bold; letter-spacing: 2px;">${verificationCode}</span>
            <div style="margin-top: 10px; color: #b94a48; font-size: 0.95em;">Ce code expirera dans <b>1 heure</b>.</div>
          </div>
          <p style="color: #555;">Nous sommes ravis de vous compter parmi nous.<br>Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.</p>
          <p style="margin-top: 30px; color: #888; font-size: 0.9em;">L'équipe de <b>Notre Plateforme</b> vous souhaite la bienvenue !</p>
        </div>
      </div>
    `;
    await sendEmail(email, "Vérification de votre compte", htmlWelcome);

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

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ error: "Code incorrect ou expiré." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
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
        error: " Compte désactivé — contactez l'administrateur.",
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
        user.verificationCodeExpires = Date.now() + 3600000; // Expire dans 1 heure
        await user.save();
        await sendEmail(
          user.email,
          "Vérification de votre compte",
          `Votre nouveau code de vérification est : ${user.verificationCode}\nCe code expirera dans 1 heure.`
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

    const imageUrl = "https://cdn-icons-png.flaticon.com/512/3767/3767036.png";
    const htmlReset = `
      <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; box-shadow: 0 2px 8px #e0e0e0;">
        <div style="text-align: center;">
          <img src="${imageUrl}" alt="Réinitialisation" style="width: 120px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 8px #d1e7dd;" />
          <h2 style="color: #2d7a2d; margin-bottom: 10px;">Réinitialisation du mot de passe</h2>
          <p style="font-size: 1.1em; color: #333;">Bonjour <b>${user.username}</b>,<br>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <div style="background: #fff; border-radius: 8px; padding: 18px 10px; margin: 18px 0; border: 1px solid #e0e0e0;">
            <span style="font-size: 1.1em; color: #555;">Votre code de réinitialisation :</span><br>
            <span style="font-size: 2em; color: #007bff; font-weight: bold; letter-spacing: 2px;">${resetCode}</span>
            <div style="margin-top: 10px; color: #b94a48; font-size: 0.95em;">Ce code expirera dans <b>1 heure</b>.</div>
          </div>
          <p style="color: #555;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.<br>Votre mot de passe actuel reste inchangé.</p>
          <p style="margin-top: 30px; color: #888; font-size: 0.9em;">L'équipe de <b>Notre Plateforme</b> reste à votre écoute.</p>
        </div>
      </div>
    `;
    await sendEmail(email, "Réinitialisation de mot de passe", htmlReset);

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

// Mettre à jour la ville de l'utilisateur
exports.updateUserCity = async (req, res) => {
  try {
    const { cityData } = req.body;
    const userId = req.user.id; // Récupéré du token JWT

    console.log("Received city data:", cityData); // Debug log

    if (!cityData || !cityData.name || !cityData.coordinates) {
      return res.status(400).json({
        error: "Données de ville invalides",
        details: "Le nom de la ville et les coordonnées sont requis",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Mise à jour de la ville avec la nouvelle structure
    user.city = {
      name: cityData.name,
      country: cityData.country,
      coordinates: {
        lat: cityData.coordinates.lat,
        lon: cityData.coordinates.lon,
      },
      lastUpdated: new Date(),
    };

    console.log("Updating user with city data:", user.city); // Debug log

    await user.save();

    res.json({
      success: true,
      message: "Ville mise à jour avec succès",
      data: {
        user: {
          city: user.city,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la ville:", error);
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
