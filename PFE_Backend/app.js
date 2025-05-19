require("dotenv").config();
// server.js ou app.js
require("./cron"); // Importez le fichier cron
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { logRequests, errorHandler } = require("./middlewares/middlewares");
const bodyParser = require("body-parser");
//URL connection with frontend

// Initialisation
const app = express();
app.use(bodyParser.json()); // Utilisation de body-parser pour lire les données POST
// Sécurité & Middlewares
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logRequests);

// Headers globaux
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Powered-By", "Your App Name");
  next();
});

// Import des routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const sourceMeteoRoutes = require("./routes/sourceMeteoRoutes");
const donneesRoutes = require("./routes/donneesCollecteesRoutes");
const alertRoutes = require("./routes/alertRoutes"); // Ajout des routes d'alertes

// Utilisation des routes
app.use("/api", donneesRoutes);
app.use("/api/sources", sourceMeteoRoutes);
app.use("/api/v1/users", userRoutes); // ✅ correctement utilisé
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/alerts", alertRoutes); // Ajout des routes d'alertes
// Route de test
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint non trouvé" });
});
app.use(errorHandler);

// Connexion MongoDB & démarrage du serveur
const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error("❌ DB_URI est manquant dans le fichier .env");
    }
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB:", err.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 Environnement: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
