const DonneesCollectees = require("../models/DonneesCollectees");
const { getHourlyWeather, getDailyWeather } = require("../utils/openWeather");

async function saveWeatherData(city, lat, lon) {
  try {
    const hourlyData = await getHourlyWeather(city);
    if (!hourlyData || hourlyData.length === 0) {
      console.error("Aucune donnée horaire disponible.");
      return;
    }

    const hourlyDocs = hourlyData.map((data) => ({
      source: "OpenWeatherMap",
      ville: city,
      temperature: data.temperature,
      humidite: data.humidity,
      vitesseVent: data.windSpeed,
      directionVent: "N/A",
      indiceUv: data.uvIndex,
      qualiteAir: data.airQuality,
      niveauPollution: 50,
      pression: 1013,
      visibilite: 10000,
      horodatage: new Date(data.time),
      type: "donnee_reelle",
    }));

    await DonneesCollectees.insertMany(hourlyDocs);

    const dailyData = await getDailyWeather(lat, lon);
    if (!dailyData || dailyData.length === 0) {
      console.error("Aucune donnée quotidienne disponible.");
      return;
    }

    const dailyDocs = dailyData.map((data) => ({
      source: "OpenWeatherMap",
      ville: city,
      temperature: (data.temperatureMin + data.temperatureMax) / 2,
      humidite: data.humidity,
      vitesseVent: data.windSpeed,
      directionVent: "N/A",
      indiceUv: data.uvIndex,
      qualiteAir: data.airQuality,
      niveauPollution: 50,
      pression: 1013,
      visibilite: 10000,
      horodatage: new Date(data.date),
      type: "prevision",
    }));

    await DonneesCollectees.insertMany(dailyDocs);

    console.log(`[${city}] Données météo enregistrées avec succès !`);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error.message);
  }
}

module.exports = { saveWeatherData };
