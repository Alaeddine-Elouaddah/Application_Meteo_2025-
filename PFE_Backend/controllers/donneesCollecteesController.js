const axios = require("axios");
const DonneesCollectees = require("../models/DonneesCollectees");
const cities = require("./cities");
const moment = require("moment");
require("dotenv").config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Fonctions utilitaires
const getAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data.list[0];
  } catch (error) {
    console.error("Erreur qualité air:", error.message);
    return null;
  }
};

const getUVIndex = async (lat, lon) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data.value;
  } catch (error) {
    console.error("Erreur UV:", error.message);
    return null;
  }
};

const getAlerts = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`
    );
    return response.data.alerts || [];
  } catch (error) {
    console.error("Erreur alertes:", error.message);
    return [];
  }
};

const formatHourlyData = (hourlyData) => {
  return hourlyData.map((item) => ({
    dt: item.dt,
    time: moment(item.dt * 1000).format("HH:mm"),
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    pressure: item.main.pressure,
    humidity: item.main.humidity,
    weather: [
      {
        id: item.weather[0].id,
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      },
    ],
    wind_speed: item.wind.speed,
    wind_deg: item.wind.deg,
    clouds: item.clouds.all,
    pop: item.pop,
    rain: item.rain ? item.rain["3h"] || 0 : 0,
    snow: item.snow ? item.snow["3h"] || 0 : 0,
  }));
};

const getDayForecastDetails = (forecastList, targetDate) => {
  const dayForecasts = forecastList.filter((item) =>
    moment(item.dt * 1000).isSame(targetDate, "day")
  );

  if (dayForecasts.length === 0) return null;

  const temps = dayForecasts.map((item) => item.main.temp);
  const middayForecast =
    dayForecasts.find((item) => moment(item.dt * 1000).hour() === 12) ||
    dayForecasts[0];

  return {
    dt: middayForecast.dt,
    date: moment(targetDate).format("DD/MM/YYYY"),
    dayName: moment(targetDate).format("dddd"),
    temp: Math.round(middayForecast.main.temp),
    feels_like: Math.round(middayForecast.main.feels_like),
    temp_min: Math.round(Math.min(...temps)),
    temp_max: Math.round(Math.max(...temps)),
    humidity: middayForecast.main.humidity,
    pressure: middayForecast.main.pressure,
    weather: [
      {
        id: middayForecast.weather[0].id,
        main: middayForecast.weather[0].main,
        description: middayForecast.weather[0].description,
        icon: middayForecast.weather[0].icon,
      },
    ],
    wind: {
      speed: Math.round(middayForecast.wind.speed * 3.6),
      deg: middayForecast.wind.deg,
      gust: middayForecast.wind.gust,
    },
    pop: middayForecast.pop,
    rain: middayForecast.rain ? middayForecast.rain["3h"] || 0 : 0,
    snow: middayForecast.snow ? middayForecast.snow["3h"] || 0 : 0,
    clouds: middayForecast.clouds.all,
    hourly: formatHourlyData(dayForecasts),
  };
};

// Contrôleurs
const insertAllCities = async (req, res) => {
  try {
    const results = [];
    for (const cityData of cities) {
      try {
        const [current, forecast, airQuality, uvIndex] = await Promise.all([
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&units=metric&appid=${API_KEY}&lang=fr`
          ),
          axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.lat}&lon=${cityData.lon}&units=metric&appid=${API_KEY}&cnt=40`
          ),
          getAirQuality(cityData.lat, cityData.lon),
          getUVIndex(cityData.lat, cityData.lon),
        ]);

        const forecastDates = [];
        for (let i = 1; i <= 5; i++) {
          forecastDates.push(moment().add(i, "days").startOf("day").toDate());
        }

        const detailedForecast = forecastDates
          .map((date) => getDayForecastDetails(forecast.data.list, date))
          .filter(Boolean);

        // Création du document avec le nom ORIGINAL du fichier (cityData.city)
        const weatherDoc = {
          city: {
            id: current.data.id,
            name: cityData.city, // <-- Ici on force le nom du fichier (ex: "Azemmour")
            country: current.data.sys.country,
            coord: {
              lat: cityData.lat, // <-- On utilise aussi les coordonnées du fichier
              lon: cityData.lon,
            },
            timezone: current.data.timezone,
            population: current.data.population,
          },
          current: {
            dt: current.data.dt,
            date: moment(current.data.dt * 1000).format("DD/MM/YYYY"),
            timestamp: current.data.dt,
            temp: current.data.main.temp,
            feels_like: current.data.main.feels_like,
            temp_min: current.data.main.temp_min,
            temp_max: current.data.main.temp_max,
            humidity: current.data.main.humidity,
            pressure: current.data.main.pressure,
            weather: {
              id: current.data.weather[0].id,
              main: current.data.weather[0].main,
              description: current.data.weather[0].description,
              icon: current.data.weather[0].icon,
            },
            wind: {
              speed: current.data.wind.speed,
              deg: current.data.wind.deg,
              gust: current.data.wind.gust,
            },
            rain: current.data.rain ? current.data.rain["1h"] || 0 : 0,
            snow: current.data.snow ? current.data.snow["1h"] || 0 : 0,
            clouds: current.data.clouds.all,
            uvi: uvIndex,
            air_quality: airQuality,
            sunrise: current.data.sys.sunrise,
            sunset: current.data.sys.sunset,
          },
          forecast: detailedForecast,
          lastUpdated: new Date(),
        };

        // Upsert pour éviter les doublons (recherche par coordonnées)
        await DonneesCollectees.findOneAndUpdate(
          {
            "city.coord.lat": cityData.lat,
            "city.coord.lon": cityData.lon,
          },
          weatherDoc,
          { upsert: true }
        );

        results.push({ city: cityData.city, status: "success" });
        console.log(`✅ ${cityData.city} insérée (nom original conservé)`);

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`❌ ${cityData.city} : ${error.message}`);
        results.push({
          city: cityData.city,
          status: "failed",
          error: error.message,
        });
      }
    }
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur globale lors de l'insertion",
    });
  }
};

const addNextDayForecast = async (req, res) => {
  try {
    const allCities = await DonneesCollectees.find({});
    const results = [];

    for (const cityDoc of allCities) {
      try {
        const forecast = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${cityDoc.city.coord.lat}&lon=${cityDoc.city.coord.lon}&units=metric&appid=${API_KEY}&cnt=40`
        );

        const nextDayDate = moment().add(6, "days").startOf("day").toDate();

        let nextDayForecast;
        try {
          nextDayForecast = getDayForecastDetails(
            forecast.data.list,
            nextDayDate
          );
        } catch (e) {
          console.log(
            `⚠️ Erreur dans getDayForecastDetails pour ${cityDoc.city.name} : ${e.message}`
          );
        }

        if (nextDayForecast) {
          await DonneesCollectees.updateOne(
            { _id: cityDoc._id },
            { $push: { forecast: nextDayForecast } }
          );

          console.log(`✅ Ville ajoutée avec succès : ${cityDoc.city.name}`);
          results.push({
            city: cityDoc.city.name,
            status: "success",
            forecast: nextDayForecast.date,
          });
        } else {
          console.log(
            `⚠️ Pas de prévision trouvée pour : ${cityDoc.city.name}`
          );
          results.push({
            city: cityDoc.city.name,
            status: "no_forecast_found",
          });
        }

        // Pause pour éviter de trop solliciter l'API
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(
          `❌ Erreur pour la ville ${cityDoc.city.name} : ${error.message}`
        );
        results.push({
          city: cityDoc.city.name,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Filtrer les résultats valides avant envoi
    const filteredResults = results.filter(
      (item) => item !== undefined && item !== null
    );

    res.status(200).json({ success: true, data: filteredResults });

    // Affichage résumé des succès
    console.log("\n📊 Résumé des ajouts réussis :");
    filteredResults
      .filter((item) => item.status === "success")
      .forEach((item) =>
        console.log(
          `✅ ${item.city} => Prévision ajoutée pour ${item.forecast}`
        )
      );
  } catch (error) {
    console.log(`❌ Erreur globale : ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de l'ajout des prévisions",
    });
  }
};

const getTodayForecast = async (req, res) => {
  try {
    const data = await DonneesCollectees.findOne(
      { "city.name": req.params.city },
      { forecast: { $elemMatch: { date: moment().format("DD/MM/YYYY") } } }
    );

    if (!data || !data.forecast || data.forecast.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Données non trouvées pour aujourd'hui",
      });
    }

    res.status(200).json({
      success: true,
      data: data.forecast[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de la récupération des données",
    });
  }
};

const getHourlyData = async (req, res) => {
  try {
    const cityName = req.params.city;
    const date = req.params.date || moment().format("DD/MM/YYYY");

    if (!cityName) {
      return res.status(400).json({
        success: false,
        message: "Le nom de la ville est requis",
      });
    }

    const data = await DonneesCollectees.findOne(
      { "city.name": cityName },
      {
        forecast: {
          $elemMatch: { date: date },
        },
      }
    );

    if (!data || !data.forecast || data.forecast.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucune donnée trouvée pour ${cityName} à la date ${date}`,
      });
    }

    if (!data.forecast[0].hourly) {
      return res.status(404).json({
        success: false,
        message: `Données horaires non disponibles pour ${cityName} à la date ${date}`,
      });
    }

    res.status(200).json({
      success: true,
      data: data.forecast[0].hourly,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de la récupération des données horaires",
    });
  }
};
const insertOneCity = async (req, res) => {
  try {
    const { lat, lon, city, country, population } = req.body;

    if (!lat || !lon || !city) {
      return res.status(400).json({
        success: false,
        message: "Les coordonnées (lat, lon) et le nom de la ville sont requis",
      });
    }

    const [current, forecast, airQuality, uvIndex, alerts] = await Promise.all([
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

    const forecastDates = [];
    for (let i = 1; i <= 5; i++) {
      forecastDates.push(moment().add(i, "days").startOf("day").toDate());
    }

    const detailedForecast = forecastDates
      .map((date) => getDayForecastDetails(forecast.data.list, date))
      .filter(Boolean);

    const weatherDoc = {
      city: {
        id: current.data.id,
        name: city,
        country: country || current.data.sys.country,
        coord: {
          lat: lat,
          lon: lon,
        },
        timezone: current.data.timezone,
        population: population || current.data.population || 0,
      },
      current: {
        dt: current.data.dt,
        date: moment(current.data.dt * 1000).format("DD/MM/YYYY"),
        timestamp: current.data.dt,
        temp: current.data.main.temp,
        feels_like: current.data.main.feels_like,
        temp_min: current.data.main.temp_min,
        temp_max: current.data.main.temp_max,
        humidity: current.data.main.humidity,
        pressure: current.data.main.pressure,
        weather: {
          id: current.data.weather[0].id,
          main: current.data.weather[0].main,
          description: current.data.weather[0].description,
          icon: current.data.weather[0].icon,
        },
        wind: {
          speed: current.data.wind.speed,
          deg: current.data.wind.deg,
          gust: current.data.wind.gust,
        },
        rain: current.data.rain ? current.data.rain["1h"] || 0 : 0,
        snow: current.data.snow ? current.data.snow["1h"] || 0 : 0,
        clouds: current.data.clouds.all,
        uvi: uvIndex,
        air_quality: airQuality,
        sunrise: current.data.sys.sunrise,
        sunset: current.data.sys.sunset,
      },
      forecast: detailedForecast,
      alerts: alerts,
      lastUpdated: new Date(),
    };

    const existingCity = await DonneesCollectees.findOne({ "city.name": city });

    if (existingCity) {
      await DonneesCollectees.updateOne({ _id: existingCity._id }, weatherDoc);
      console.log(`${city} a été mise à jour avec succès`);
      return res.status(200).json({
        success: true,
        message: `${city} a été mise à jour avec succès`,
        data: weatherDoc,
      });
    } else {
      await DonneesCollectees.create(weatherDoc);
      console.log(`${city} a été ajoutée avec succès`);
      return res.status(201).json({
        success: true,
        message: `${city} a été ajoutée avec succès`,
        data: weatherDoc,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'insertion de la ville:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de l'insertion de la ville",
    });
  }
};

module.exports = {
  insertAllCities,
  insertOneCity,
  addNextDayForecast,
  getTodayForecast,
  getHourlyData,
};
