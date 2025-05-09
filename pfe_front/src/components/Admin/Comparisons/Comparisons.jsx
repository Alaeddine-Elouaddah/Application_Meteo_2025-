import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiStrongWind,
  WiCloudy,
  WiDayCloudyHigh,
  WiHumidity,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiRaindrop,
  WiUmbrella,
  WiDust,
  WiSandstorm,
} from "weather-icons-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const API = "6e601e5bf166b100420a3cf427368540";

const Comparisons = ({ darkMode }) => {
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [discrepancies, setDiscrepancies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fonction pour calculer les écarts en pourcentage
  const calculateDiscrepancies = (current, forecast) => {
    if (!current || !forecast) return {};

    const calcPercentageDiff = (actual, predicted) => {
      if (actual === 0 && predicted === 0) return 0;
      return ((actual - predicted) / ((actual + predicted) / 2)) * 100;
    };

    return {
      temp: calcPercentageDiff(current.temperature, forecast.temp).toFixed(1),
      humidity: calcPercentageDiff(current.humidity, forecast.humidity).toFixed(
        1
      ),
      windSpeed: calcPercentageDiff(
        current.windSpeed,
        forecast.windSpeed
      ).toFixed(1),
      pressure:
        current.pressure && forecast.pressure
          ? calcPercentageDiff(current.pressure, forecast.pressure).toFixed(1)
          : null,
    };
  };

  // Récupérer la localisation de l'utilisateur
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Récupérer le nom de la ville
              const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API}`
              );
              const data = await response.json();
              if (data && data.length > 0) {
                setLocation(data[0].name);
              }
            } catch (err) {
              console.error("Error getting location name:", err);
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            // Définir un emplacement par défaut si la géolocalisation échoue
            setLocation("Paris");
          }
        );
      } else {
        // Définir un emplacement par défaut si la géolocalisation n'est pas disponible
        setLocation("Paris");
      }
    };

    getLocation();
  }, []);

  // Récupérer les suggestions de recherche
  const fetchSearchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API}`
      );
      const data = await response.json();
      setSearchSuggestions(data);
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
    }
  };

  // Gérer le changement de recherche
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSearchSuggestions(query);
  };

  // Gérer la sélection d'une suggestion
  const handleSuggestionSelect = (suggestion) => {
    setLocation(suggestion.name);
    setSearchQuery(`${suggestion.name}, ${suggestion.country}`);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Récupérer les données météo
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      try {
        setLoading(true);

        // 1. Récupérer les données actuelles depuis l'API
        const apiResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API}&lang=fr`
        );
        const apiData = await apiResponse.json();

        // 2. Récupérer les prévisions depuis votre base de données (via votre API)
        const dbResponse = await fetch(
          `http://localhost:8000/api/today/${location}`
        );
        const dbData = await dbResponse.json();

        if (!apiData.main || !dbData.forecast) {
          throw new Error("Données incomplètes");
        }

        // Formater les données actuelles
        const formattedCurrentData = {
          temperature: Math.round(apiData.main.temp),
          feelsLike: Math.round(apiData.main.feels_like),
          humidity: apiData.main.humidity,
          windSpeed: Math.round(apiData.wind.speed * 3.6), // Convertir en km/h
          pressure: apiData.main.pressure,
          condition: apiData.weather[0].main,
          description: apiData.weather[0].description,
          icon: apiData.weather[0].icon,
          city: apiData.name,
          country: apiData.sys.country,
          lastUpdated: new Date(),
        };

        setCurrentData(formattedCurrentData);
        setForecastData(dbData.forecast);

        // Calculer les écarts
        setDiscrepancies(
          calculateDiscrepancies(formattedCurrentData, dbData.forecast)
        );
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  // Fonction pour obtenir l'icône météo
  const getWeatherIcon = (iconCode, size = 48) => {
    const sunnyColor = darkMode ? "#FBBF24" : "#F59E0B";
    const color = darkMode ? "#E5E7EB" : "#4B5563";
    const iconMap = {
      "01d": <WiDaySunny size={size} color={sunnyColor} />,
      "01n": <WiDaySunny size={size} color="#FDE68A" />,
      "02d": <WiDayCloudyHigh size={size} color={color} />,
      "02n": <WiDayCloudyHigh size={size} color={color} />,
      "03d": <WiCloudy size={size} color={color} />,
      "03n": <WiCloudy size={size} color={color} />,
      "04d": <WiCloudy size={size} color={color} />,
      "04n": <WiCloudy size={size} color={color} />,
      "09d": <WiRain size={size} color="#60A5FA" />,
      "09n": <WiRain size={size} color="#60A5FA" />,
      "10d": <WiRain size={size} color="#60A5FA" />,
      "10n": <WiRain size={size} color="#60A5FA" />,
      "11d": <WiThunderstorm size={size} color="#8B5CF6" />,
      "11n": <WiThunderstorm size={size} color="#8B5CF6" />,
      "13d": <WiSnow size={size} color="#BFDBFE" />,
      "13n": <WiSnow size={size} color="#BFDBFE" />,
      "50d": <WiFog size={size} color="#9CA3AF" />,
      "50n": <WiFog size={size} color="#9CA3AF" />,
    };
    return iconMap[iconCode] || <WiDayCloudyHigh size={size} color={color} />;
  };

  // Fonction pour déterminer la couleur en fonction de l'écart
  const getDiscrepancyColor = (value) => {
    const numValue = Math.abs(parseFloat(value));
    if (numValue < 5) return "text-green-500";
    if (numValue < 10) return "text-yellow-500";
    if (numValue < 20) return "text-orange-500";
    return "text-red-500";
  };

  // Formatage des données pour le graphique
  const chartData = {
    labels: ["Température", "Humidité", "Vent", "Pression"],
    datasets: [
      {
        label: "Données actuelles",
        data: [
          currentData?.temperature,
          currentData?.humidity,
          currentData?.windSpeed,
          currentData?.pressure,
        ],
        backgroundColor: darkMode
          ? "rgba(59, 130, 246, 0.7)"
          : "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Prévisions",
        data: [
          forecastData?.temp,
          forecastData?.humidity,
          forecastData?.windSpeed,
          forecastData?.pressure,
        ],
        backgroundColor: darkMode
          ? "rgba(16, 185, 129, 0.7)"
          : "rgba(16, 185, 129, 0.5)",
      },
    ],
  };

  // Options du graphique
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#E5E7EB" : "#4B5563",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              const unit =
                context.label === "Température"
                  ? "°C"
                  : context.label === "Humidité"
                  ? "%"
                  : context.label === "Vent"
                  ? "km/h"
                  : "hPa";
              label += `${context.parsed.y} ${unit}`;

              // Ajouter l'écart pour le deuxième jeu de données
              if (context.datasetIndex === 1 && currentData) {
                const currentValue =
                  context.label === "Température"
                    ? currentData.temperature
                    : context.label === "Humidité"
                    ? currentData.humidity
                    : context.label === "Vent"
                    ? currentData.windSpeed
                    : currentData.pressure;

                const diff = currentValue - context.parsed.y;
                const percentage = (
                  (diff / ((currentValue + context.parsed.y) / 2)) *
                  100
                ).toFixed(1);
                label += ` (${diff > 0 ? "+" : ""}${diff.toFixed(
                  1
                )} ${unit}, ${percentage}%)`;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: darkMode ? "#E5E7EB" : "#4B5563",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#E5E7EB" : "#4B5563",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  // Classes CSS conditionnelles pour le dark mode
  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-800";
  const cardClass = darkMode ? "bg-gray-800" : "bg-white";
  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const inputClass = darkMode
    ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
    : "bg-white text-gray-800 border-gray-300 focus:border-blue-500";

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${bgClass}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${bgClass}`}
      >
        <div
          className={`p-6 rounded-lg ${cardClass} shadow-lg max-w-md text-center`}
        >
          <h2 className={`text-xl font-bold mb-4 ${textClass}`}>Erreur</h2>
          <p className={`mb-4 ${secondaryTextClass}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header avec recherche */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-3xl font-bold ${textClass}`}>
                Comparaison Météo
              </h1>
              <p className={`text-lg ${secondaryTextClass}`}>
                {currentData?.city}, {currentData?.country} -{" "}
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Rechercher une ville..."
                className={`w-full px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <ul
                  className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } border ${
                    darkMode ? "border-gray-600" : "border-gray-200"
                  } max-h-60 overflow-auto`}
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer hover:${
                        darkMode ? "bg-gray-600" : "bg-gray-100"
                      } ${textClass}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion.name}, {suggestion.country}
                      {suggestion.state ? `, ${suggestion.state}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        {/* Current vs Forecast */}
        <section className={`mb-8 p-6 rounded-xl ${cardClass} shadow-lg`}>
          <h2 className={`text-2xl font-semibold mb-6 ${textClass}`}>
            Comparaison des données
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Weather */}
            <div>
              <h3 className={`text-xl font-medium mb-4 ${textClass}`}>
                Conditions actuelles
              </h3>
              <div className="flex items-center mb-4">
                {currentData && getWeatherIcon(currentData.icon, 64)}
                <div className="ml-4">
                  <p className={`text-4xl font-bold ${textClass}`}>
                    {currentData?.temperature}°C
                  </p>
                  <p className={`capitalize ${secondaryTextClass}`}>
                    {currentData?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>Ressenti</p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {currentData?.feelsLike}°C
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>Humidité</p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {currentData?.humidity}%
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>Vent</p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {currentData?.windSpeed} km/h
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>Pression</p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {currentData?.pressure} hPa
                  </p>
                </div>
              </div>
            </div>

            {/* Forecast Comparison */}
            <div>
              <h3 className={`text-xl font-medium mb-4 ${textClass}`}>
                Prévision pour aujourd'hui
              </h3>
              <div className="flex items-center mb-4">
                {forecastData && getWeatherIcon(forecastData.icon, 64)}
                <div className="ml-4">
                  <p className={`text-4xl font-bold ${textClass}`}>
                    {forecastData?.temp}°C
                  </p>
                  <p className={`capitalize ${secondaryTextClass}`}>
                    {forecastData?.condition}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>
                    Humidité prévue
                  </p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {forecastData?.humidity}%
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>Vent prévu</p>
                  <p className={`text-xl font-semibold ${textClass}`}>
                    {forecastData?.windSpeed} km/h
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>
                    Écart température
                  </p>
                  <p
                    className={`text-xl font-semibold ${getDiscrepancyColor(
                      discrepancies.temp
                    )}`}
                  >
                    {discrepancies.temp}%
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className={`text-sm ${secondaryTextClass}`}>
                    Écart humidité
                  </p>
                  <p
                    className={`text-xl font-semibold ${getDiscrepancyColor(
                      discrepancies.humidity
                    )}`}
                  >
                    {discrepancies.humidity}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className={`mb-8 p-6 rounded-xl ${cardClass} shadow-lg`}>
          <h2 className={`text-2xl font-semibold mb-6 ${textClass}`}>
            Visualisation des écarts
          </h2>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Detailed Discrepancies */}
        <section className={`p-6 rounded-xl ${cardClass} shadow-lg`}>
          <h2 className={`text-2xl font-semibold mb-6 ${textClass}`}>
            Analyse des écarts
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <th className={`py-3 text-left ${textClass}`}>Paramètre</th>
                  <th className={`py-3 text-left ${textClass}`}>Actuel</th>
                  <th className={`py-3 text-left ${textClass}`}>Prévision</th>
                  <th className={`py-3 text-left ${textClass}`}>Différence</th>
                  <th className={`py-3 text-left ${textClass}`}>Écart (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className={`py-3 ${textClass}`}>Température</td>
                  <td className={`py-3 ${textClass}`}>
                    {currentData?.temperature}°C
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {forecastData?.temp}°C
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {(currentData?.temperature - forecastData?.temp).toFixed(1)}
                    °C
                  </td>
                  <td
                    className={`py-3 ${getDiscrepancyColor(
                      discrepancies.temp
                    )}`}
                  >
                    {discrepancies.temp}%
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className={`py-3 ${textClass}`}>Humidité</td>
                  <td className={`py-3 ${textClass}`}>
                    {currentData?.humidity}%
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {forecastData?.humidity}%
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {(currentData?.humidity - forecastData?.humidity).toFixed(
                      1
                    )}
                    %
                  </td>
                  <td
                    className={`py-3 ${getDiscrepancyColor(
                      discrepancies.humidity
                    )}`}
                  >
                    {discrepancies.humidity}%
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className={`py-3 ${textClass}`}>Vitesse du vent</td>
                  <td className={`py-3 ${textClass}`}>
                    {currentData?.windSpeed} km/h
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {forecastData?.windSpeed} km/h
                  </td>
                  <td className={`py-3 ${textClass}`}>
                    {(currentData?.windSpeed - forecastData?.windSpeed).toFixed(
                      1
                    )}{" "}
                    km/h
                  </td>
                  <td
                    className={`py-3 ${getDiscrepancyColor(
                      discrepancies.windSpeed
                    )}`}
                  >
                    {discrepancies.windSpeed}%
                  </td>
                </tr>
                {currentData?.pressure && forecastData?.pressure && (
                  <tr>
                    <td className={`py-3 ${textClass}`}>
                      Pression atmosphérique
                    </td>
                    <td className={`py-3 ${textClass}`}>
                      {currentData.pressure} hPa
                    </td>
                    <td className={`py-3 ${textClass}`}>
                      {forecastData.pressure} hPa
                    </td>
                    <td className={`py-3 ${textClass}`}>
                      {(currentData.pressure - forecastData.pressure).toFixed(
                        1
                      )}{" "}
                      hPa
                    </td>
                    <td
                      className={`py-3 ${getDiscrepancyColor(
                        discrepancies.pressure
                      )}`}
                    >
                      {discrepancies.pressure}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className={`mt-8 text-center ${secondaryTextClass}`}>
          <p>
            Dernière mise à jour: {currentData?.lastUpdated?.toLocaleString()}
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Météo Comparateur</p>
        </footer>
      </div>
    </div>
  );
};

export default Comparisons;
