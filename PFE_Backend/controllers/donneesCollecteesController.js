const axios = require("axios");
const DonneesCollectees = require("../models/DonneesCollectees");
const cities = require("./cities");
const moment = require("moment");
require("dotenv").config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error(
    "ERREUR : La clé API OpenWeatherMap est manquante dans le fichier .env"
  );
  process.exit(1);
}

// Fonction pour obtenir les données de qualité de l'air
const getAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data.list[0];
  } catch (error) {
    console.error("Erreur récupération qualité air:", error.message);
    return null;
  }
};

// Fonction pour obtenir l'indice UV
const getUVIndex = async (lat, lon) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data.value;
  } catch (error) {
    console.error("Erreur récupération UV:", error.message);
    return null;
  }
};

// Fonction pour obtenir les alertes météo
const getAlerts = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`
    );
    return response.data.alerts || [];
  } catch (error) {
    console.error("Erreur récupération alertes:", error.message);
    return [];
  }
};

// Fonction pour obtenir les prévisions détaillées d'une journée
const getDayForecastDetails = (forecastList, targetDate) => {
  const dayForecasts = forecastList.filter((item) => {
    return moment(item.dt * 1000).isSame(targetDate, "day");
  });

  if (dayForecasts.length === 0) return null;

  // Calcul des températures min/max
  const temps = dayForecasts.map((item) => item.main.temp);
  const tempMin = Math.round(Math.min(...temps));
  const tempMax = Math.round(Math.max(...temps));

  // Prévision de midi (pour les données principales)
  const middayForecast =
    dayForecasts.find((item) => moment(item.dt * 1000).hour() === 12) ||
    dayForecasts[Math.floor(dayForecasts.length / 2)];

  return {
    date: moment(targetDate).format("DD/MM/YYYY"),
    dayName: moment(targetDate).format("dddd"),
    temp: Math.round(middayForecast.main.temp),
    tempMin,
    tempMax,
    condition: middayForecast.weather[0].main,
    icon: middayForecast.weather[0].icon,
    humidity: middayForecast.main.humidity,
    windSpeed: Math.round(middayForecast.wind.speed * 3.6),
    rain: middayForecast.rain ? middayForecast.rain["3h"] || 0 : 0,
    snow: middayForecast.snow ? middayForecast.snow["3h"] || 0 : 0,
    clouds: middayForecast.clouds.all,
    createdAt: new Date(),
  };
};

// Insertion initiale des données complètes
module.exports.insertAllCities = async (req, res) => {
  try {
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        error: "Aucune ville à traiter ou format invalide",
        solution: "Vérifiez le fichier cities.js",
      });
    }

    const results = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const cityData of cities) {
      // Validation des données de la ville
      if (!cityData || typeof cityData !== "object") {
        errorCount++;
        results.push({
          status: "failed",
          error: "Données de ville invalides",
          rawData: cityData,
        });
        continue;
      }

      const { city, lat, lon } = cityData || {};

      if (!city || lat === undefined || lon === undefined) {
        errorCount++;
        results.push({
          status: "failed",
          error: "Données de ville incomplètes (manque city, lat ou lon)",
          rawData: cityData,
        });
        continue;
      }

      try {
        // Vérifier si la ville existe déjà
        const exists = await DonneesCollectees.findOne({ city });
        if (exists) {
          console.log(`⏩ ${city} existe déjà - ignorée`);
          skipCount++;
          results.push({
            city,
            status: "skipped",
            reason: "Existe déjà en base de données",
          });
          continue;
        }

        // Récupérer toutes les données en parallèle
        const [current, forecast, airQuality, uvIndex, alerts] =
          await Promise.all([
            axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=fr`
            ),
            axios.get(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&cnt=40`
            ),
            getAirQuality(lat, lon),
            getUVIndex(lat, lon),
            getAlerts(lat, lon),
          ]);

        // Validation des réponses principales
        if (!current?.data || !forecast?.data) {
          throw new Error("Données API incomplètes");
        }

        // Préparer les prévisions pour les 5 prochains jours
        const forecastDates = [];
        for (let i = 1; i <= 5; i++) {
          forecastDates.push(moment().add(i, "days").startOf("day").toDate());
        }

        const detailedForecast = forecastDates
          .map((date) => getDayForecastDetails(forecast.data.list, date))
          .filter(Boolean);

        // Construction du document complet
        const weatherDoc = {
          city: current.data.name,
          country: current.data.sys?.country || "Inconnu",
          date: new Date().toLocaleDateString("fr-FR"),
          coord: {
            lat: current.data.coord?.lat || lat,
            lon: current.data.coord?.lon || lon,
          },
          temperature: Math.round(current.data.main?.temp || 0),
          feelsLike: Math.round(current.data.main?.feels_like || 0),
          humidity: current.data.main?.humidity || 0,
          pressure: current.data.main?.pressure || 0,
          windSpeed: Math.round((current.data.wind?.speed || 0) * 3.6),
          windDeg: current.data.wind?.deg || 0,
          condition: current.data.weather?.[0]?.main || "Inconnu",
          icon: current.data.weather?.[0]?.icon || "01d",
          rain: current.data.rain ? current.data.rain["1h"] || 0 : 0,
          snow: current.data.snow ? current.data.snow["1h"] || 0 : 0,
          clouds: current.data.clouds?.all || 0,
          airQuality: airQuality,
          uvIndex: uvIndex,
          alerts: alerts,
          forecast: detailedForecast,
          lastUpdated: new Date(),
        };

        // Insertion dans la base de données
        await DonneesCollectees.create(weatherDoc);

        successCount++;
        results.push({
          city,
          status: "success",
          insertedAt: new Date().toISOString(),
        });
        console.log(
          `✅ ${city} insérée avec succès (${detailedForecast.length} jours de prévisions)`
        );

        // Pause pour éviter le rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur sur ${city}:`, error.message);
        results.push({
          city,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.json({
      summary: {
        totalCities: cities.length,
        success: successCount,
        skipped: skipCount,
        errors: errorCount,
      },
      details: results,
      message: `Insertion terminée. ${successCount} villes ajoutées avec données complètes.`,
    });
  } catch (error) {
    console.error("ERREUR GLOBALE:", error);
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Fonction pour obtenir les prévisions du jour suivant
const getNextDayForecast = async (cityData) => {
  const { city, lat, lon } = cityData;

  try {
    const [forecast, airQuality] = await Promise.all([
      axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&cnt=40`
      ),
      getAirQuality(lat, lon),
    ]);

    if (!forecast?.data) {
      throw new Error("Données API incomplètes");
    }

    // Date du 6ème jour
    const nextDayDate = moment().add(6, "days").startOf("day").toDate();
    const nextDayForecast = getDayForecastDetails(
      forecast.data.list,
      nextDayDate
    );

    if (!nextDayForecast) {
      throw new Error("Prévision pour le 6ème jour non disponible");
    }

    return {
      ...nextDayForecast,
      airQuality: airQuality,
    };
  } catch (error) {
    console.error(`❌ Erreur pour ${city}:`, error.message);
    throw error;
  }
};

// Tâche cron pour ajouter le jour suivant
module.exports.addNextDayForecast = async () => {
  try {
    console.log(
      "⏳ Début de l'ajout du jour suivant pour toutes les villes..."
    );

    const allCities = await DonneesCollectees.find({});
    let successCount = 0;
    let errorCount = 0;

    for (const cityDoc of allCities) {
      try {
        const nextDayForecast = await getNextDayForecast({
          city: cityDoc.city,
          lat: cityDoc.coord.lat,
          lon: cityDoc.coord.lon,
        });

        // Vérifier si cette date existe déjà
        const exists = cityDoc.forecast.some(
          (f) => f.date === nextDayForecast.date
        );

        if (!exists) {
          await DonneesCollectees.updateOne(
            { _id: cityDoc._id },
            {
              $push: { forecast: nextDayForecast },
              $set: {
                lastUpdated: new Date(),
                airQuality: nextDayForecast.airQuality,
              },
            }
          );
          console.log(
            `➕ ${cityDoc.city}: ajout prévision pour ${nextDayForecast.date}`
          );
          successCount++;
        } else {
          console.log(
            `⏩ ${cityDoc.city}: prévision existe déjà pour ${nextDayForecast.date}`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${cityDoc.city}:`, error.message);
      }
    }

    console.log(
      `✅ Ajout terminé: ${successCount} réussites, ${errorCount} échecs`
    );
  } catch (error) {
    console.error("ERREUR GLOBALE DANS LA TÂCHE CRON:", error);
  }
};

module.exports.getTodayForecast = async (req, res) => {
  try {
    const { city } = req.params;
    const todayDate = moment().format("DD/MM/YYYY");

    const data = await DonneesCollectees.findOne(
      {
        city,
        "forecast.date": todayDate,
      },
      {
        "forecast.$": 1,
        city: 1,
        country: 1,
        lastUpdated: 1,
      }
    );

    if (!data || !data.forecast || data.forecast.length === 0) {
      return res.status(404).json({
        error: "Aucune donnée trouvée pour aujourd'hui",
        date: todayDate,
      });
    }

    res.json({
      city: data.city,
      country: data.country,
      lastUpdated: data.lastUpdated,
      forecast: data.forecast[0],
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    });
  }
};

module.exports.getTodayData = async (req, res) => {
  try {
    const { city } = req.params;
    const todayDate = moment().format("DD/MM/YYYY");

    const data = await DonneesCollectees.findOne({
      city,
      date: todayDate,
    });

    if (!data) {
      return res.status(404).json({
        error: "Aucune donnée trouvée pour aujourd'hui",
        date: todayDate,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    });
  }
};
