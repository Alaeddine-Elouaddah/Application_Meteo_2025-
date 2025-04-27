// controllers/donneesCollecteesController.js

const DonneesCollectees = require("../models/DonneesCollectees"); // Vérifie que le chemin est correctconst { getHourlyWeather, getDailyWeather } = require("../utils/openWeather");

// Fonction pour enregistrer les données météo dans la base de données
async function saveWeatherData(city, lat, lon) {
  try {
    // Récupérer les données horaires
    const hourlyData = await getHourlyWeather(city);

    // Enregistrer les données horaires
    for (let data of hourlyData) {
      const newWeatherData = new DonneesCollectees({
        source: "OpenWeatherMap", // Référence à la source
        ville: city,
        temperature: data.temperature,
        humidite: data.humidity,
        vitesseVent: data.windSpeed,
        directionVent: "N/A", // Direction du vent (si disponible)
        indiceUv: data.uvIndex,
        qualiteAir: data.airQuality,
        niveauPollution: 50, // Valeur fictive pour la pollution
        pression: 1013, // Valeur fictive pour la pression
        visibilite: 10000, // Valeur fictive pour la visibilité
        horodatage: new Date(data.time),
        type: "donnee_reelle",
      });

      await newWeatherData.save();
    }

    // Récupérer les prévisions quotidiennes sur 7 jours
    const dailyData = await getDailyWeather(lat, lon);

    // Enregistrer les données quotidiennes
    for (let data of dailyData) {
      const newWeatherData = new DonneesCollectees({
        source: "OpenWeatherMap", // Référence à la source
        ville: city,
        temperature: (data.temperatureMin + data.temperatureMax) / 2, // Température moyenne
        humidite: data.humidity,
        vitesseVent: data.windSpeed,
        directionVent: "N/A", // Direction du vent (si disponible)
        indiceUv: data.uvIndex,
        qualiteAir: data.airQuality,
        niveauPollution: 50, // Valeur fictive pour la pollution
        pression: 1013, // Valeur fictive pour la pression
        visibilite: 10000, // Valeur fictive pour la visibilité
        horodatage: new Date(data.date),
        type: "prevision",
      });

      await newWeatherData.save();
    }

    console.log("Les données météo ont été enregistrées avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données météo:", error);
  }
}

module.exports = { saveWeatherData };
