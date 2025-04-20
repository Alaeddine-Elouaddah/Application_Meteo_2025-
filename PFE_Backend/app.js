require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { logRequests, errorHandler } = require("./middlewares/middlewares");

// Initialisation de l'application
const app = express(); // Doit être placé avant tout app.use()

// Configuration de la limite de taux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
});

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logRequests);

// Headers par défaut
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Powered-By", "Your App Name");
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoutes"); // Renommé pour cohérence

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes); // Changé pour garder la même structure d'URL

// Route de test
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Connexion à MongoDB
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

// Gestion des erreurs
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint non trouvé" });
});

app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 Environnement: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
