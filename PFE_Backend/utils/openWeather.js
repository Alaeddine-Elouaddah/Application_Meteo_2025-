const axios = require("axios");
require("dotenv").config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Villes principales du Maroc
const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
];

// Fonction optimisée pour les villes marocaines
async function getMoroccanWeather() {
  try {
    const weatherData = [];

    for (const city of MOROCCAN_CITIES) {
      const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          q: `${city},MA`, // Spécification du pays (MA = Maroc)
          units: "metric",
          lang: "fr",
          appid: OPENWEATHER_API_KEY,
        },
      });

      const data = response.data;
      weatherData.push({
        ville: city,
        temperature: data.main.temp,
        humidite: data.main.humidity,
        vent: {
          vitesse: data.wind.speed,
          direction: degToDirection(data.wind.deg),
        },
        pression: data.main.pressure,
        visibilite: data.visibility / 1000, // en km
        dernierUpdate: new Date(data.dt * 1000),
      });
    }

    return weatherData;
  } catch (error) {
    console.error("Erreur de collecte pour le Maroc:", error.message);
    throw error; // Propager l'erreur pour une gestion ultérieure
  }
}

// Fonction pour récupérer les prévisions horaires
async function getHourlyWeather(city) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: `${city},MA`,
        units: "metric",
        lang: "fr",
        appid: OPENWEATHER_API_KEY,
      },
    });

    return response.data.list.map((item) => ({
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      uvIndex: item.uvi || null, // UV Index n'est pas toujours disponible
      airQuality: item.air_quality || null, // Qualité de l'air (si disponible)
      time: item.dt * 1000, // Convertir en timestamp JavaScript
    }));
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des données horaires pour ${city}:`,
      error.message
    );
    throw error; // Propager l'erreur pour une gestion ultérieure
  }
}

// Fonction pour récupérer les prévisions quotidiennes
async function getDailyWeather(lat, lon) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall`, {
      params: {
        lat,
        lon,
        exclude: "current,minutely,hourly", // Exclure les données inutiles
        units: "metric",
        lang: "fr",
        appid: OPENWEATHER_API_KEY,
      },
    });

    return response.data.daily.map((day) => ({
      temperatureMin: day.temp.min,
      temperatureMax: day.temp.max,
      humidity: day.humidity,
      windSpeed: day.wind_speed,
      uvIndex: day.uvi || null, // UV Index
      airQuality: day.air_quality || null, // Qualité de l'air (si disponible)
      date: day.dt * 1000, // Convertir en timestamp JavaScript
    }));
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des prévisions quotidiennes pour [${lat}, ${lon}]:`,
      error.message
    );
    throw error; // Propager l'erreur pour une gestion ultérieure
  }
}

// Helper: Conversion degrés -> direction cardinale
function degToDirection(deg) {
  const directions = [
    "Nord",
    "Nord-Est",
    "Est",
    "Sud-Est",
    "Sud",
    "Sud-Ouest",
    "Ouest",
    "Nord-Ouest",
  ];
  return directions[Math.round(deg / 45) % 8];
}

module.exports = {
  getMoroccanWeather,
  getHourlyWeather,
  getDailyWeather,
};
