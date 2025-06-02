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

// Template d'email commun
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
      html: emailTemplate(`
        <img src="https://cdn-icons-png.flaticon.com/512/3767/3767036.png" alt="Nouveau Message" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 30px; font-weight: 600;">Nouveau Message de Contact</h1>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Nom</strong>
                    <span style="color: #34495e;">${sanitizeHtml(name)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 15px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Email</strong>
                    <span style="color: #34495e;">${sanitizeHtml(email)}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Message</strong>
                    <div style="color: #34495e; line-height: 1.6;">${sanitizedMessage.replace(
                      /\n/g,
                      "<br>"
                    )}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Ce message a été envoyé via le formulaire de contact de votre site.</p>
      `),
    };

    const userMail = {
      from: `"Équipe PFE" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Confirmation de réception",
      html: emailTemplate(`
        <img src="https://cdn-icons-png.flaticon.com/512/3767/3767036.png" alt="Confirmation" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 30px; font-weight: 600;">Message Reçu !</h1>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0;">
                Merci <strong>${sanitizeHtml(name)}</strong>,<br><br>
                Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
              </p>
            </td>
          </tr>
        </table>
        
        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">L'équipe de <strong>Notre Plateforme</strong> reste à votre écoute.</p>
      `),
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
