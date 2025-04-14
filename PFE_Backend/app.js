require("dotenv").config(); // Assure-toi que les variables d'environnement sont chargées en premier
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
const dbURI = process.env.DB_URI; // Récupère l'URI de MongoDB depuis les variables d'environnement

if (!dbURI) {
  console.error("DB_URI est manquant dans le fichier .env");
  process.exit(1); // Arrête l'application si l'URI est manquante
}

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
