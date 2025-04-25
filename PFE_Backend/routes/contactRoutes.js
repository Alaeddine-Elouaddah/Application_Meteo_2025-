const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

// Transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Middleware de validation
const validateContact = [
  body("name")
    .notEmpty()
    .withMessage("Le nom est requis")
    .isLength({ max: 100 }),
  body("email").notEmpty().isEmail().withMessage("Email invalide"),
  body("message").notEmpty().isLength({ min: 10, max: 2000 }),
];

// Route POST /api/contact
router.post("/", validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, message } = req.body;
  const sanitizedMessage = sanitizeHtml(message);

  try {
    const adminMail = {
      from: `"Formulaire Contact PFE" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Nouveau message de ${name}`,
      html: `
        <p><strong>Nom:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
        <p><strong>Message:</strong><br>${sanitizedMessage.replace(
          /\n/g,
          "<br>"
        )}</p>
      `,
    };

    const userMail = {
      from: `"Équipe PFE" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Confirmation de réception",
      html: `<p>Merci ${sanitizeHtml(
        name
      )}, nous avons bien reçu votre message !</p>`,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.json({ success: true, message: "Message envoyé avec succès" });
  } catch (error) {
    console.error("Erreur d'envoi:", error);
    res.status(500).json({ error: "Échec d'envoi du message" });
  }
});

module.exports = router;
