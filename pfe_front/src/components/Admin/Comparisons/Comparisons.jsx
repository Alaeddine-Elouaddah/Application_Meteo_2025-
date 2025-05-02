import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WiThermometer, WiHumidity, WiStrongWind } from "weather-icons-react";

const Comparisons = ({ darkMode }) => {
  const API_KEY = "6e601e5bf166b100420a3cf427368540";
  const [location, setLocation] = useState("Paris");
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration du thème
  const theme = {
    textColor: darkMode ? "#E5E7EB" : "#374151",
    gridColor: darkMode ? "#4B5563" : "#E5E7EB",
    cardBg: darkMode ? "#1F2937" : "#FFFFFF",
    colors: {
      temp: "#EF4444",
      feelsLike: "#F59E0B",
      humidity: "#3B82F6",
      wind: "#10B981",
      pressure: "#8B5CF6",
      forecast: "#6366F1",
      actual: "#EC4899",
    },
  };

  // Fetch current weather data
  const fetchCurrentWeather = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=fr`
      );
      if (!response.ok) throw new Error("Ville non trouvée");
      const data = await response.json();

      return {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6).toFixed(1), // convert m/s to km/h
        pressure: data.main.pressure,
      };
    } catch (err) {
      throw err;
    }
  };

  // Fetch hourly forecast
  const fetchHourlyForecast = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}&lang=fr`
      );
      if (!response.ok) throw new Error("Prévisions non disponibles");
      const data = await response.json();

      return data.list.slice(0, 6).map((item) => ({
        time: new Date(item.dt * 1000),
        temp: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        windSpeed: (item.wind.speed * 3.6).toFixed(1), // convert m/s to km/h
        pressure: item.main.pressure,
      }));
    } catch (err) {
      throw err;
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, hourly] = await Promise.all([
        fetchCurrentWeather(location),
        fetchHourlyForecast(location),
      ]);

      setWeatherData(current);
      setHourlyData(hourly);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle location change
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Préparation des données pour les graphiques
  const prepareComparisonData = () => {
    if (!hourlyData || !weatherData) return [];

    const recentForecasts = hourlyData.map((forecast) => ({
      time: forecast.time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: forecast.temp,
      feelsLike: forecast.feelsLike,
      humidity: forecast.humidity,
      windSpeed: forecast.windSpeed,
      pressure: forecast.pressure,
      type: "Prévision",
    }));

    const actualData = {
      time: "Maintenant",
      temp: weatherData.temperature,
      feelsLike: weatherData.feelsLike,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      pressure: weatherData.pressure,
      type: "Réel",
    };

    return [...recentForecasts, actualData];
  };

  const chartData = prepareComparisonData();

  // Calcul des métriques d'erreur
  const calculateErrorMetrics = () => {
    if (!hourlyData || !weatherData) return null;

    const latestForecast = hourlyData[0];

    return {
      tempError: latestForecast.temp - weatherData.temperature,
      feelsLikeError: latestForecast.feelsLike - weatherData.feelsLike,
      humidityError: latestForecast.humidity - weatherData.humidity,
      windError: latestForecast.windSpeed - weatherData.windSpeed,
      pressureError: latestForecast.pressure - weatherData.pressure,
      mae: {
        temp: Math.abs(latestForecast.temp - weatherData.temperature).toFixed(
          1
        ),
        humidity: Math.abs(
          latestForecast.humidity - weatherData.humidity
        ).toFixed(1),
      },
      mape: {
        temp: Math.abs(
          ((latestForecast.temp - weatherData.temperature) /
            weatherData.temperature) *
            100
        ).toFixed(1),
        humidity: Math.abs(
          ((latestForecast.humidity - weatherData.humidity) /
            weatherData.humidity) *
            100
        ).toFixed(1),
      },
    };
  };

  const errorMetrics = calculateErrorMetrics();

  // Composant personnalisé pour la légende
  const renderCustomizedLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center space-x-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm" style={{ color: theme.textColor }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-lg shadow-lg ${
            darkMode ? "bg-gray-700" : "bg-white"
          } border ${darkMode ? "border-gray-600" : "border-gray-200"}`}
        >
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.unit || ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-xl shadow-xl ${theme.cardBg}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme.textColor} mb-4 md:mb-0`}>
          Analyse Professionnelle des Prévisions
        </h2>

        <form onSubmit={handleSubmit} className="flex w-full md:w-auto">
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            className={`px-4 py-2 rounded-l-lg border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            } ${theme.textColor}`}
            placeholder="Entrez une ville"
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r-lg ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Rechercher"}
          </button>
        </form>
      </div>

      {error && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            darkMode ? "bg-red-900" : "bg-red-100"
          } text-red-500`}
        >
          Erreur : {error}
        </div>
      )}

      {loading && !weatherData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className={`text-lg ${theme.textColor}`}>
            Chargement des données...
          </p>
        </div>
      ) : weatherData && hourlyData ? (
        <>
          {/* Section des indicateurs clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <WiThermometer size={32} color={theme.colors.temp} />
                <h3 className={`ml-2 font-semibold ${theme.textColor}`}>
                  Température
                </h3>
              </div>
              <div className="mt-2">
                <p className={theme.textColor}>
                  Prévision: {hourlyData[0].temp}°C
                </p>
                <p className={theme.textColor}>
                  Réel: {weatherData.temperature}°C
                </p>
                <p
                  className={`mt-1 ${
                    Math.abs(errorMetrics.tempError) > 2
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  Écart: {errorMetrics.tempError > 0 ? "+" : ""}
                  {errorMetrics.tempError.toFixed(1)}°C
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <WiHumidity size={32} color={theme.colors.humidity} />
                <h3 className={`ml-2 font-semibold ${theme.textColor}`}>
                  Humidité
                </h3>
              </div>
              <div className="mt-2">
                <p className={theme.textColor}>
                  Prévision: {hourlyData[0].humidity}%
                </p>
                <p className={theme.textColor}>Réel: {weatherData.humidity}%</p>
                <p
                  className={`mt-1 ${
                    Math.abs(errorMetrics.humidityError) > 10
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  Écart: {errorMetrics.humidityError > 0 ? "+" : ""}
                  {errorMetrics.humidityError.toFixed(1)}%
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <WiStrongWind size={32} color={theme.colors.wind} />
                <h3 className={`ml-2 font-semibold ${theme.textColor}`}>
                  Vent
                </h3>
              </div>
              <div className="mt-2">
                <p className={theme.textColor}>
                  Prévision: {hourlyData[0].windSpeed} km/h
                </p>
                <p className={theme.textColor}>
                  Réel: {weatherData.windSpeed} km/h
                </p>
                <p
                  className={`mt-1 ${
                    Math.abs(errorMetrics.windError) > 5
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  Écart: {errorMetrics.windError > 0 ? "+" : ""}
                  {errorMetrics.windError.toFixed(1)} km/h
                </p>
              </div>
            </div>
          </div>

          {/* Graphique de comparaison température */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>
              Évolution Température: Prévision vs Réel
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.gridColor}
                  />
                  <XAxis
                    dataKey="time"
                    stroke={theme.textColor}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke={theme.textColor}
                    label={{
                      value: "°C",
                      angle: -90,
                      position: "insideLeft",
                      fill: theme.textColor,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderCustomizedLegend} />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    name="Température"
                    stroke={theme.colors.forecast}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="feelsLike"
                    name="Ressenti"
                    stroke={theme.colors.feelsLike}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <ReferenceLine
                    y={weatherData.temperature}
                    label="Réel"
                    stroke={theme.colors.actual}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique barres pour erreurs */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>
              Analyse des Erreurs de Prévision
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Température",
                      MAE: parseFloat(errorMetrics.mae.temp),
                      MAPE: parseFloat(errorMetrics.mape.temp),
                      Erreur: Math.abs(errorMetrics.tempError),
                    },
                    {
                      name: "Humidité",
                      MAE: parseFloat(errorMetrics.mae.humidity),
                      MAPE: parseFloat(errorMetrics.mape.humidity),
                      Erreur: Math.abs(errorMetrics.humidityError),
                    },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.gridColor}
                  />
                  <XAxis dataKey="name" stroke={theme.textColor} />
                  <YAxis stroke={theme.textColor} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderCustomizedLegend} />
                  <Bar
                    dataKey="MAE"
                    name="Erreur Absolue Moyenne"
                    fill="#F59E0B"
                  />
                  <Bar dataKey="MAPE" name="Erreur % Moyenne" fill="#3B82F6" />
                  <Bar dataKey="Erreur" name="Écart Actuel" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Métriques avancées */}
          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${theme.textColor}`}>
              Métriques de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className={`font-medium ${theme.textColor}`}>
                  Température
                </h4>
                <ul className={`mt-2 space-y-2 ${theme.textColor}`}>
                  <li>MAE: {errorMetrics.mae.temp}°C</li>
                  <li>MAPE: {errorMetrics.mape.temp}%</li>
                  <li>
                    Biais:{" "}
                    {errorMetrics.tempError > 0
                      ? "Surestimation"
                      : "Sous-estimation"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={`font-medium ${theme.textColor}`}>Humidité</h4>
                <ul className={`mt-2 space-y-2 ${theme.textColor}`}>
                  <li>MAE: {errorMetrics.mae.humidity}%</li>
                  <li>MAPE: {errorMetrics.mape.humidity}%</li>
                  <li>
                    Biais:{" "}
                    {errorMetrics.humidityError > 0
                      ? "Surestimation"
                      : "Sous-estimation"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Comparisons;
