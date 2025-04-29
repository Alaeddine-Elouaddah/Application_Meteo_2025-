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
import { Line, Bar } from "react-chartjs-2";

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

const Dashboard = ({ darkMode }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = "6e601e5bf166b100420a3cf427368540";
  const CITY = "El jadida";

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Données actuelles
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}&lang=fr`
        );
        const currentData = await currentResponse.json();

        // Prévisions sur 5 jours (3h par 3h)
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}&lang=fr&cnt=40`
        );
        const forecastData = await forecastResponse.json();

        setWeatherData({
          temperature: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          windDirection: getWindDirection(currentData.wind.deg),
          windDeg: currentData.wind.deg,
          condition: currentData.weather[0].main.toLowerCase(),
          description: currentData.weather[0].description,
          pressure: currentData.main.pressure,
          visibility: currentData.visibility / 1000,
          sunrise: new Date(currentData.sys.sunrise * 1000),
          sunset: new Date(currentData.sys.sunset * 1000),
          icon: currentData.weather[0].icon,
          rain: currentData.rain ? currentData.rain["1h"] || 0 : 0,
          clouds: currentData.clouds.all,
        });

        // Traitement des prévisions quotidiennes
        const dailyForecasts = processDailyForecastData(forecastData.list);
        setForecastData(dailyForecasts);
        setSelectedDay(dailyForecasts[0]);

        // Traitement des prévisions horaires
        const hourlyForecasts = processHourlyForecastData(forecastData.list);
        setHourlyData(hourlyForecasts);

        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données météo");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const processDailyForecastData = (forecastList) => {
    const dailyData = {};
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString("fr-FR", { weekday: "long" });
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: date,
          dayName: dayKey,
          temps: [],
          humidities: [],
          pressures: [],
          windSpeeds: [],
          windDegs: [],
          conditions: [],
          icons: [],
          rain: [],
          clouds: [],
        };
      }
      dailyData[dayKey].temps.push(Math.round(item.main.temp));
      dailyData[dayKey].humidities.push(item.main.humidity);
      dailyData[dayKey].pressures.push(item.main.pressure);
      dailyData[dayKey].windSpeeds.push(Math.round(item.wind.speed * 3.6));
      dailyData[dayKey].windDegs.push(item.wind.deg);
      dailyData[dayKey].conditions.push(item.weather[0].main.toLowerCase());
      dailyData[dayKey].icons.push(item.weather[0].icon);
      dailyData[dayKey].rain.push(item.rain ? item.rain["3h"] || 0 : 0);
      dailyData[dayKey].clouds.push(item.clouds.all);
    });
    return Object.values(dailyData).slice(0, 7);
  };

  const processHourlyForecastData = (forecastList) => {
    return forecastList.slice(0, 24).map((item) => ({
      time: new Date(item.dt * 1000),
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6),
      windDeg: item.wind.deg,
      condition: item.weather[0].main.toLowerCase(),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      pressure: item.main.pressure,
      rain: item.rain ? item.rain["3h"] || 0 : 0,
      pop: item.pop ? Math.round(item.pop * 100) : 0, // Probability of precipitation
      clouds: item.clouds.all,
    }));
  };

  const getWindDirection = (degrees) => {
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
    const index = Math.round((degrees % 360) / 45);
    return directions[index % 8];
  };

  const getWeatherIcon = (condition, size = 48) => {
    const color = darkMode ? "#E5E7EB" : "#4B5563";
    const sunnyColor = darkMode ? "#FBBF24" : "#F59E0B";
    switch (condition) {
      case "clear":
        return <WiDaySunny size={size} color={sunnyColor} />;
      case "rain":
        return <WiRain size={size} color="#60A5FA" />;
      case "snow":
        return <WiSnow size={size} color="#BFDBFE" />;
      case "thunderstorm":
        return <WiThunderstorm size={size} color="#8B5CF6" />;
      case "fog":
      case "mist":
      case "haze":
        return <WiFog size={size} color="#9CA3AF" />;
      case "clouds":
        return <WiCloudy size={size} color={color} />;
      case "wind":
        return <WiStrongWind size={size} color={color} />;
      default:
        return <WiDayCloudyHigh size={size} color={color} />;
    }
  };

  const getWeatherIconFromCode = (iconCode, size = 48) => {
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

  // ✅ Correction ici : parenthèse manquante ajoutée
  const getAverage = (arr) =>
    Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const getMin = (arr) => Math.min(...arr);
  const getMax = (arr) => Math.max(...arr);
  const getSum = (arr) => Math.round(arr.reduce((a, b) => a + b, 0));

  const getMostFrequent = (arr) => {
    const counts = {};
    arr.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
  };

  const getWindDirectionIcon = (degrees, size = 24) => {
    const transform = `rotate(${degrees}deg)`;
    return (
      <div style={{ transform, width: size, height: size }}>
        <WiStrongWind size={size} color={darkMode ? "#E5E7EB" : "#4B5563"} />
      </div>
    );
  };

  if (loading)
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        Chargement en cours...
      </div>
    );
  if (error)
    return (
      <div
        className={`flex justify-center items-center min-h-screen text-red-500 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {error}
      </div>
    );
  if (!weatherData || !forecastData || !hourlyData) return null;

  // Configuration des graphiques
  const tempChartData = {
    labels: forecastData.map((day) => day.dayName),
    datasets: [
      {
        label: "Température Max (°C)",
        data: forecastData.map((day) => getMax(day.temps)),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Température Min (°C)",
        data: forecastData.map((day) => getMin(day.temps)),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const precipitationChartData = {
    labels: hourlyData.map((hour) =>
      hour.time.toLocaleTimeString("fr-FR", { hour: "2-digit" })
    ),
    datasets: [
      {
        label: "Chance de pluie (%)",
        data: hourlyData.map((hour) => hour.pop),
        borderColor: "#60A5FA",
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Précipitations (mm)",
        data: hourlyData.map((hour) => hour.rain),
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const windChartData = {
    labels: forecastData.map((day) => day.dayName),
    datasets: [
      {
        label: "Vitesse du vent (km/h)",
        data: forecastData.map((day) => getAverage(day.windSpeeds)),
        backgroundColor: "#10B981",
      },
    ],
  };

  const humidityChartData = {
    labels: hourlyData.map((hour) =>
      hour.time.toLocaleTimeString("fr-FR", { hour: "2-digit" })
    ),
    datasets: [
      {
        label: "Humidité (%)",
        data: hourlyData.map((hour) => hour.humidity),
        borderColor: "#06B6D4",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#E5E7EB" : "#4B5563",
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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

  // Classes CSS pour le dark mode
  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-800";
  const cardClass = darkMode ? "bg-gray-800" : "bg-white";
  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const dividerClass = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`p-4 min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold ${textClass} mb-6`}>
          Météo à {CITY} -{" "}
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h1>

        {/* Section Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Carte Météo Actuelle */}
          <div className={`p-6 rounded-lg shadow col-span-1 ${cardClass}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-xl font-semibold ${textClass}`}>
                Conditions Actuelles
              </h2>
              <span className={`text-sm ${secondaryTextClass}`}>
                Mis à jour: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-5xl font-bold ${textClass}`}>
                {weatherData.temperature}°C
                <div className="text-sm font-normal text-gray-500">
                  Ressenti: {weatherData.feelsLike}°C
                </div>
              </div>
              <div>
                {getWeatherIconFromCode(weatherData.icon, 64)}
                <div className="text-center capitalize">
                  {weatherData.description}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <WiHumidity size={24} color="#3B82F6" />
                  <div className="ml-2">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Humidité
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {weatherData.humidity}%
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  {getWindDirectionIcon(weatherData.windDeg)}
                  <div className="ml-2">
                    <div className={`text-sm ${secondaryTextClass}`}>Vent</div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {weatherData.windSpeed} km/h {weatherData.windDirection}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <WiBarometer size={24} color="#10B981" />
                  <div className="ml-2">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Pression
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {weatherData.pressure} hPa
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <WiUmbrella size={24} color="#3B82F6" />
                  <div className="ml-2">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Pluie (1h)
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {weatherData.rain} mm
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-2 rounded flex items-center ${
                  darkMode ? "bg-blue-900" : "bg-blue-50"
                }`}
              >
                <WiSunrise size={24} color="#F59E0B" />
                <div className="ml-2">
                  <div className={`text-xs ${secondaryTextClass}`}>Lever</div>
                  <div className={`font-medium ${textClass}`}>
                    {weatherData.sunrise.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div
                className={`p-2 rounded flex items-center ${
                  darkMode ? "bg-orange-900" : "bg-orange-50"
                }`}
              >
                <WiSunset size={24} color="#F59E0B" />
                <div className="ml-2">
                  <div className={`text-xs ${secondaryTextClass}`}>Coucher</div>
                  <div className={`font-medium ${textClass}`}>
                    {weatherData.sunset.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prévisions sur 7 jours */}
          <div className={`p-6 rounded-lg shadow col-span-1 ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Prévisions 7 jours
            </h2>
            <div className="space-y-3">
              {forecastData.map((day, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    selectedDay?.dayName === day.dayName
                      ? darkMode
                        ? "bg-blue-900 border border-blue-700"
                        : "bg-blue-50 border border-blue-200"
                      : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className={`${textClass} w-24 font-medium`}>
                    {day.dayName}
                  </span>
                  <div className="flex-1 px-4 flex justify-center">
                    {getWeatherIcon(getMostFrequent(day.conditions), 32)}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`font-medium ${textClass}`}>
                      {getMax(day.temps)}°
                    </span>
                    <span className={secondaryTextClass}>
                      {getMin(day.temps)}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détails du jour sélectionné */}
          <div className={`p-6 rounded-lg shadow col-span-1 ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Détails pour {selectedDay?.dayName}
            </h2>
            {selectedDay && (
              <>
                <div className="flex justify-center mb-4">
                  {getWeatherIcon(getMostFrequent(selectedDay.conditions), 64)}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Température Max
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getMax(selectedDay.temps)}°C
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Température Min
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getMin(selectedDay.temps)}°C
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Humidité Moy.
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getAverage(selectedDay.humidities)}%
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Vent Moy.
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getAverage(selectedDay.windSpeeds)} km/h
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Pluie totale
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getSum(selectedDay.rain)} mm
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Nébulosité
                    </div>
                    <div className={`text-lg font-semibold ${textClass}`}>
                      {getAverage(selectedDay.clouds)}%
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className={`font-medium ${textClass} mb-2`}>
                    Conditions prévues
                  </h3>
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className="capitalize">
                      {getMostFrequent(selectedDay.conditions)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prévisions horaires */}
        <div className={`p-6 rounded-lg shadow mb-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
            Prévisions horaires
          </h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              {hourlyData.map((hour, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-lg min-w-[80px] ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={secondaryTextClass}>
                    {hour.time.toLocaleTimeString("fr-FR", { hour: "2-digit" })}
                  </div>
                  <div className="my-2">
                    {getWeatherIconFromCode(hour.icon, 32)}
                  </div>
                  <div className={`font-semibold ${textClass}`}>
                    {hour.temp}°
                  </div>
                  <div className="text-xs text-blue-500">
                    {hour.pop}% <WiRaindrop size={16} color="#3B82F6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphiques détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`p-6 rounded-lg shadow ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Températures prévues
            </h2>
            <div className="h-64">
              <Line data={tempChartData} options={chartOptions} />
            </div>
          </div>
          <div className={`p-6 rounded-lg shadow ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Précipitations
            </h2>
            <div className="h-64">
              <Line data={precipitationChartData} options={chartOptions} />
            </div>
          </div>
          <div className={`p-6 rounded-lg shadow ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Vent moyen
            </h2>
            <div className="h-64">
              <Bar data={windChartData} options={chartOptions} />
            </div>
          </div>
          <div className={`p-6 rounded-lg shadow ${cardClass}`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
              Humidité
            </h2>
            <div className="h-64">
              <Line data={humidityChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className={`p-6 rounded-lg shadow ${cardClass}`}>
          <h2 className={`text-xl font-semibold ${textClass} mb-4`}>
            Informations complémentaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className={`font-medium ${textClass} mb-2`}>
                Qualité de l'air
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600 mb-2">75</div>
                <div className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  Modérée
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>PM2.5</span>
                  <span>12 µg/m³</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>PM10</span>
                  <span>24 µg/m³</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>NO2</span>
                  <span>18 µg/m³</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>O3</span>
                  <span>45 µg/m³</span>
                </div>
              </div>
            </div>
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className={`font-medium ${textClass} mb-2`}>Indice UV</h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-500 mb-2">5</div>
                <div className="text-sm px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                  Modéré
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-2">
                  Protection recommandée entre 11h et 16h
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full"
                    style={{ width: "50%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className={`font-medium ${textClass} mb-2`}>
                Prévisions pluie
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {Math.max(...hourlyData.map((h) => h.pop))}%
                </div>
                <div className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Risque de pluie
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-2">
                  Heure la plus pluvieuse:{" "}
                  {hourlyData
                    .reduce((max, hour) => (hour.pop > max.pop ? hour : max))
                    .time.toLocaleTimeString("fr-FR", { hour: "2-digit" })}
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.max(...hourlyData.map((h) => h.pop))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sources de données */}
        <div className={`p-6 rounded-lg shadow mt-6 ${cardClass}`}>
          <div className={`text-sm ${secondaryTextClass}`}>
            <p>
              Données météo fournies par OpenWeatherMap - Dernière mise à jour:{" "}
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
