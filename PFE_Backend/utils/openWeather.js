// utils/openWeather.js

const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // Charger depuis .env
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL; // Charger depuis .env

// Fonction pour récupérer les prévisions horaires (24 heures)
async function getHourlyWeather(city) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: city, // Ville
        units: "metric", // Unité des données (Celsius)
        lang: "fr", // Langue des données
        appid: OPENWEATHER_API_KEY, // Clé API
      },
    });

    // Retourner les données horaires
    return response.data.list.map((item) => ({
      time: item.dt_txt, // Date et heure
      temperature: item.main.temp, // Température en °C
      humidity: item.main.humidity, // Humidité en %
      windSpeed: item.wind.speed, // Vitesse du vent
      uvIndex: item.uvi || 0, // Indice UV (si disponible)
      airQuality: 50, // Valeur fictive de la qualité de l'air (à remplacer avec une API spécifique)
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des prévisions horaires:",
      error
    );
    return [];
  }
}

// Fonction pour récupérer les prévisions quotidiennes (7 jours)
async function getDailyWeather(lat, lon) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall`, {
      params: {
        lat, // Latitude
        lon, // Longitude
        units: "metric", // Unité des données (Celsius)
        lang: "fr", // Langue des données
        appid: OPENWEATHER_API_KEY, // Clé API
      },
    });

    // Retourner les données quotidiennes
    return response.data.daily.map((item) => ({
      date: new Date(item.dt * 1000).toISOString().split("T")[0], // Date
      temperatureMin: item.temp.min, // Température minimum
      temperatureMax: item.temp.max, // Température maximum
      humidity: item.humidity, // Humidité en %
      windSpeed: item.wind_speed, // Vitesse du vent
      uvIndex: item.uvi, // Indice UV
      airQuality: 50, // Valeur fictive de la qualité de l'air (à remplacer avec une API spécifique)
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des prévisions quotidiennes:",
      error
    );
    return [];
  }
}

module.exports = { getHourlyWeather, getDailyWeather };
