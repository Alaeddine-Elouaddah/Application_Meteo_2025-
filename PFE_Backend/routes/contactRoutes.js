const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === "465", // true pour 465, false pour autres
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // À n'utiliser qu'en développement
  },
});

// Middleware de validation
const validateContact = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis")
    .isLength({ max: 100 })
    .withMessage("Le nom ne doit pas dépasser 100 caractères"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Le message est requis")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Le message doit contenir entre 10 et 2000 caractères"),
];

// Route POST /api/contact
router.post("/", validateContact, async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Nettoyage des entrées
  const { name, email, message } = req.body;
  const sanitizedMessage = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {},
  });

  try {
    // 1. Email à l'administrateur
    const adminMail = {
      from: `"Formulaire Contact PFE" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER, // Envoi à vous-même
      replyTo: email,
      subject: `Nouveau message de ${name} (PFE)`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Envoyé depuis le formulaire de contact PFE</p>
      `,
    };

    // 2. Email de confirmation à l'utilisateur
    const userMail = {
      from: `"Équipe PFE" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Confirmation de réception - PFE",
      html: `
        <h2>Merci pour votre message, ${sanitizeHtml(name)} !</h2>
        <p>Nous avons bien reçu votre message et vous répondrons dès que possible.</p>
        <p><strong>Récapitulatif :</strong></p>
        <blockquote>${sanitizedMessage
          .substring(0, 500)
          .replace(/\n/g, "<br>")}</blockquote>
        <hr>
          <p>Cordialement,<br>L'équipe CollabPro</p>
      `,
    };

    // Envoi des emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.json({
      success: true,
      message: "Message envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      error: "Échec d'envoi",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

module.exports = router;
