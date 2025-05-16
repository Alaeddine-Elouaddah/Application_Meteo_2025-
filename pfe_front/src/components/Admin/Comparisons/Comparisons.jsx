import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiCloudy,
  WiDayCloudyHigh,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiThermometer,
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
} from "chart.js";
import { Line, Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_KEY = "6e601e5bf166b100420a3cf427368540";

const Comparisons = () => {
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("El Jadida");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Calculate discrepancies between forecast and actual data
  const calculateDiscrepancies = (hourlyData) => {
    return hourlyData
      .map((hour) => {
        if (!hour.forecast_temp) return null;

        const tempDiff = hour.temp - hour.forecast_temp;
        const humidityDiff =
          hour.humidity - (hour.forecast_humidity || hour.humidity);
        const windDiff =
          hour.wind_speed - (hour.forecast_wind || hour.wind_speed);

        return {
          time: hour.time,
          tempDiff: tempDiff.toFixed(1),
          humidityDiff: humidityDiff.toFixed(1),
          windDiff: windDiff.toFixed(1),
          tempAccuracy:
            Math.abs(tempDiff) <= 2
              ? "good"
              : Math.abs(tempDiff) <= 4
              ? "medium"
              : "bad",
          humidityAccuracy:
            Math.abs(humidityDiff) <= 5
              ? "good"
              : Math.abs(humidityDiff) <= 10
              ? "medium"
              : "bad",
          windAccuracy:
            Math.abs(windDiff) <= 2
              ? "good"
              : Math.abs(windDiff) <= 5
              ? "medium"
              : "bad",
        };
      })
      .filter(Boolean);
  };

  // Fetch weather data
  const fetchWeatherData = async (city) => {
    try {
      setLoading(true);
      setError(null);

      // Current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=fr`
      );
      const current = await currentRes.json();

      // Forecast data
      const forecastRes = await fetch(
        `http://localhost:8000/api/today/${city}`
      );
      const forecast = await forecastRes.json();

      // Hourly data
      const hourlyRes = await fetch(`http://localhost:8000/api/hourly/${city}`);
      const hourly = await hourlyRes.json();

      setCurrentData({
        ...current,
        wind_speed: Math.round(current.wind.speed * 3.6), // Convert to km/h
      });
      setForecastData(forecast);
      setHourlyData(hourly.hourly || hourly);
      setDiscrepancies(calculateDiscrepancies(hourly.hourly || hourly));
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      setSearchSuggestions(data);
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSearchSuggestions(query);
  };

  const handleSuggestionSelect = (suggestion) => {
    setLocation(suggestion.name);
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  // Load data when location changes
  useEffect(() => {
    if (location) {
      fetchWeatherData(location);
    }
  }, [location]);

  // Weather icons
  const getWeatherIcon = (iconCode, size = 48) => {
    const iconMap = {
      "01d": <WiDaySunny size={size} className="text-yellow-400" />,
      "01n": <WiDaySunny size={size} className="text-gray-400" />,
      "02d": <WiDayCloudyHigh size={size} className="text-gray-500" />,
      "02n": <WiDayCloudyHigh size={size} className="text-gray-500" />,
      "03d": <WiCloudy size={size} className="text-gray-500" />,
      "03n": <WiCloudy size={size} className="text-gray-500" />,
      "04d": <WiCloudy size={size} className="text-gray-600" />,
      "04n": <WiCloudy size={size} className="text-gray-600" />,
      "09d": <WiRain size={size} className="text-blue-500" />,
      "09n": <WiRain size={size} className="text-blue-500" />,
      "10d": <WiRain size={size} className="text-blue-400" />,
      "10n": <WiRain size={size} className="text-blue-400" />,
      "11d": <WiThunderstorm size={size} className="text-purple-500" />,
      "11n": <WiThunderstorm size={size} className="text-purple-500" />,
      "13d": <WiSnow size={size} className="text-blue-200" />,
      "13n": <WiSnow size={size} className="text-blue-200" />,
      "50d": <WiFog size={size} className="text-gray-400" />,
      "50n": <WiFog size={size} className="text-gray-400" />,
    };
    return (
      iconMap[iconCode] || (
        <WiDayCloudyHigh size={size} className="text-gray-500" />
      )
    );
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy) => {
    switch (accuracy) {
      case "good":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "bad":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Chart data
  const dailyChartData = {
    labels: ["Température", "Humidité", "Vent", "Pression"],
    datasets: [
      {
        label: "Actuel",
        data: [
          currentData?.main?.temp,
          currentData?.main?.humidity,
          currentData?.wind_speed,
          currentData?.main?.pressure,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
      {
        label: "Prévision",
        data: [
          forecastData?.temp,
          forecastData?.humidity,
          forecastData?.wind_speed,
          forecastData?.pressure,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  };

  const hourlyChartData = {
    labels: hourlyData.map((hour) => hour.time),
    datasets: [
      {
        label: "Température réelle",
        data: hourlyData.map((hour) => hour.temp),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
      {
        label: "Température prévue",
        data: hourlyData.map((hour) => hour.forecast_temp || hour.temp),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const scatterChartData = {
    datasets: [
      {
        label: "Prévisions vs Réel",
        data: hourlyData.map((hour) => ({
          x: hour.forecast_temp || hour.temp,
          y: hour.temp,
        })),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        pointRadius: 6,
      },
    ],
  };

  const scatterOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Température prévue (°C)",
        },
        min: Math.min(...hourlyData.map((h) => h.temp)) - 2,
        max: Math.max(...hourlyData.map((h) => h.temp)) + 2,
      },
      y: {
        title: {
          display: true,
          text: "Température réelle (°C)",
        },
        min: Math.min(...hourlyData.map((h) => h.temp)) - 2,
        max: Math.max(...hourlyData.map((h) => h.temp)) + 2,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const point = context.raw;
            const diff = (point.y - point.x).toFixed(1);
            return [
              `Prévu: ${point.x}°C`,
              `Réel: ${point.y}°C`,
              `Écart: ${diff}°C`,
            ];
          },
        },
      },
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
            }
            return label;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg bg-white shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Erreur</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Comparaison Météo
              </h1>
              <p className="text-lg text-gray-600">
                {location}, {currentData?.sys?.country} •{" "}
                {formatDate(currentData?.dt)}
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher une ville..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 rounded-lg shadow-lg bg-white border border-gray-200 max-h-60 overflow-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion.name}, {suggestion.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        {/* Current Weather */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              {currentData && getWeatherIcon(currentData.weather[0].icon, 64)}
              <div className="ml-4">
                <p className="text-4xl font-bold text-gray-800">
                  {Math.round(currentData?.main?.temp)}°C
                </p>
                <p className="capitalize text-gray-600">
                  {currentData?.weather[0]?.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              {forecastData && getWeatherIcon(forecastData.weather[0].icon, 64)}
              <div className="ml-4">
                <p className="text-4xl font-bold text-gray-800">
                  {forecastData?.temp}°C
                </p>
                <p className="capitalize text-gray-600">
                  {forecastData?.weather[0]?.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <WiThermometer size={32} className="text-blue-500" />
              <div className="ml-2">
                <p className="text-sm text-gray-600">Ressenti</p>
                <p className="text-xl font-semibold">
                  {Math.round(currentData?.main?.feels_like)}°C
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <WiHumidity size={32} className="text-blue-500" />
              <div className="ml-2">
                <p className="text-sm text-gray-600">Humidité</p>
                <p className="text-xl font-semibold">
                  {currentData?.main?.humidity}%
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <WiStrongWind size={32} className="text-blue-500" />
              <div className="ml-2">
                <p className="text-sm text-gray-600">Vent</p>
                <p className="text-xl font-semibold">
                  {currentData?.wind_speed} km/h
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <WiBarometer size={32} className="text-blue-500" />
              <div className="ml-2">
                <p className="text-sm text-gray-600">Pression</p>
                <p className="text-xl font-semibold">
                  {currentData?.main?.pressure} hPa
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Comparaison Quotidienne
            </h2>
            <div className="h-80">
              <Bar data={dailyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Prévisions vs Réel (Scatter Plot)
            </h2>
            <div className="h-80">
              <Scatter data={scatterChartData} options={scatterOptions} />
            </div>
          </div>
        </section>

        {/* Discrepancies Table */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Analyse des Écarts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-gray-800">Heure</th>
                  <th className="py-3 text-left text-gray-800">
                    Écart Température
                  </th>
                  <th className="py-3 text-left text-gray-800">Précision</th>
                  <th className="py-3 text-left text-gray-800">
                    Écart Humidité
                  </th>
                  <th className="py-3 text-left text-gray-800">Précision</th>
                  <th className="py-3 text-left text-gray-800">Écart Vent</th>
                  <th className="py-3 text-left text-gray-800">Précision</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 text-gray-800">{item.time}</td>
                    <td className="py-3 text-gray-800">{item.tempDiff}°C</td>
                    <td
                      className={`py-3 ${getAccuracyColor(item.tempAccuracy)}`}
                    >
                      {item.tempAccuracy === "good"
                        ? "Bonne"
                        : item.tempAccuracy === "medium"
                        ? "Moyenne"
                        : "Mauvaise"}
                    </td>
                    <td className="py-3 text-gray-800">{item.humidityDiff}%</td>
                    <td
                      className={`py-3 ${getAccuracyColor(
                        item.humidityAccuracy
                      )}`}
                    >
                      {item.humidityAccuracy === "good"
                        ? "Bonne"
                        : item.humidityAccuracy === "medium"
                        ? "Moyenne"
                        : "Mauvaise"}
                    </td>
                    <td className="py-3 text-gray-800">{item.windDiff} km/h</td>
                    <td
                      className={`py-3 ${getAccuracyColor(item.windAccuracy)}`}
                    >
                      {item.windAccuracy === "good"
                        ? "Bonne"
                        : item.windAccuracy === "medium"
                        ? "Moyenne"
                        : "Mauvaise"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-gray-600 py-4">
          <p>
            Dernière mise à jour:{" "}
            {new Date(currentData?.dt * 1000).toLocaleString()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Comparisons;
