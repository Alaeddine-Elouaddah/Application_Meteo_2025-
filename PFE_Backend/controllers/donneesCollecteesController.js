const axios = require("axios");
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Récupère les données depuis OpenWeatherMap (sans sauvegarde)
exports.fetchAndSaveWeatherData = async (req, res) => {
  const { city, lat, lon } = req.query;

  try {
    // 1. Appel API pour les données actuelles
    const currentWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city || ""}&lat=${
        lat || ""
      }&lon=${lon || ""}&units=metric&appid=${API_KEY}&lang=fr`
    );

    // 2. Appel pour les prévisions
    const forecast = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${currentWeather.data.coord.lat}&lon=${currentWeather.data.coord.lon}&units=metric&appid=${API_KEY}&cnt=40`
    );

    // 3. Formatage des données pour correspondre au frontend
    const weatherData = {
      city: currentWeather.data.name,
      country: currentWeather.data.sys.country,
      coord: currentWeather.data.coord,
      temperature: Math.round(currentWeather.data.main.temp),
      feelsLike: Math.round(currentWeather.data.main.feels_like),
      humidity: currentWeather.data.main.humidity,
      pressure: currentWeather.data.main.pressure,
      windSpeed: Math.round(currentWeather.data.wind.speed * 3.6), // km/h
      windDeg: currentWeather.data.wind.deg,
      condition: currentWeather.data.weather[0].main.toLowerCase(),
      icon: currentWeather.data.weather[0].icon,
      rain: currentWeather.data.rain ? currentWeather.data.rain["1h"] || 0 : 0,
      snow: currentWeather.data.snow ? currentWeather.data.snow["1h"] || 0 : 0,
      clouds: currentWeather.data.clouds.all,
      forecast: forecast.data.list,
      hourly: forecast.data.list.slice(0, 24), // 24h de données
    };

    // 4. Envoie simplement les données au frontend, sans sauvegarde
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({
      message: error.response?.data?.message || "Erreur serveur",
    });
  }
};

// Cette méthode reste inchangée, mais ne fonctionnera plus sans base de données
exports.getLatestData = async (req, res) => {
  res.status(501).json({
    message: "La récupération de données sauvegardées est désactivée.",
  });
};
