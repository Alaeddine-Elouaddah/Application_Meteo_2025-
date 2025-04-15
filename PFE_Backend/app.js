require("dotenv").config(); // Charger les variables d'environnement en premier

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes"); // Assure-toi que ce fichier existe
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Connexion à MongoDB
const dbURI = process.env.DB_URI;
if (!dbURI) {
  console.error("❌ DB_URI est manquant dans le fichier .env");
  process.exit(1);
}

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connecté");
    // Démarrage du serveur une fois connecté à la base
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ Erreur de connexion à MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);
