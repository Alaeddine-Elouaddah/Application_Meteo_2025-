import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
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
import {
  FiSearch,
  FiMapPin,
  FiNavigation,
  FiAlertCircle,
  FiInfo,
  FiBell,
} from "react-icons/fi";
import {
  WiDaySunny,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiRain,
} from "react-icons/wi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  -Legend
);

const Comparisons = () => {
  const API_KEY = "6e601e5bf166b100420a3cf427368540";
  const [city, setCity] = useState("Agadir");
  const [forecastData, setForecastData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [actualData, setActualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Classes dynamiques pour le dark mode
  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-800";
  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const cardBgClass = darkMode ? "bg-gray-800" : "bg-white";
  const inputClass = darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-gray-800 border-gray-300";
  const buttonClass = darkMode
    ? "bg-blue-700 hover:bg-blue-800"
    : "bg-blue-600 hover:bg-blue-700";

  // Détecter la localisation de l'utilisateur
  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Récupérer le nom de la ville à partir des coordonnées
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              setCity(data[0].name);
              setSearchInput(`${data[0].name}, ${data[0].country}`);
              fetchWeatherAlerts(latitude, longitude);
            } else {
              setCity("Agadir");
              setGeolocationError(
                "Impossible de déterminer votre ville. Utilisation de Agadir par défaut."
              );
            }
          } catch (err) {
            console.error("Erreur de récupération du nom de la ville:", err);
            setCity("Agadir");
            setGeolocationError(
              "Erreur lors de la récupération du nom de la ville. Utilisation de Agadir par défaut."
            );
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Erreur de géolocalisation:", err);
          setCity("Agadir");
          setGeolocationError(
            "Impossible d'obtenir votre position. Utilisation de Agadir par défaut."
          );
          setLoading(false);
        }
      );
    } else {
      setCity("Agadir");
      setGeolocationError(
        "La géolocalisation n'est pas supportée par votre navigateur. Utilisation de Agadir par défaut."
      );
      setLoading(false);
    }
  };

  // Récupérer les alertes météo
  const fetchWeatherAlerts = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Erreur de récupération des alertes:", err);
    }
  };

  // Récupérer les suggestions de villes
  const fetchCitySuggestions = async (query) => {
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
      console.error("Erreur de récupération des suggestions:", err);
      setSearchSuggestions([]);
    }
  };

  // Sélectionner une ville
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setSearchInput(`${selectedCity.name}, ${selectedCity.country}`);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    fetchWeatherAlerts(selectedCity.lat, selectedCity.lon);
  };

  // Rechercher une ville
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() && searchSuggestions.length > 0) {
      handleCitySelect(searchSuggestions[0]);
    }
  };

  // Basculer les notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Récupérer les données météo
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Détecter la localisation automatiquement au chargement
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                  `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
                );
                const data = await response.json();
                if (data && data.length > 0) {
                  setCity(data[0].name);
                  setSearchInput(`${data[0].name}, ${data[0].country}`);
                } else {
                  // Si la localisation échoue, utiliser El Jadida par défaut
                  setCity("Agadir");
                }
              } catch (err) {
                console.error(
                  "Erreur de récupération du nom de la ville:",
                  err
                );
                setCity("Agadir");
              } finally {
                // Charger les données météo après avoir défini la ville
                fetchWeatherData();
              }
            },
            (err) => {
              console.error("Erreur de géolocalisation:", err);
              setCity("Agadir");
              fetchWeatherData();
            }
          );
        } else {
          // Si la géolocalisation n'est pas supportée, utiliser El Jadida par défaut
          setCity("Agadir");
          fetchWeatherData();
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // Fonction pour charger les données météo
    const fetchWeatherData = async () => {
      try {
        // Récupérer les données de prévision horaire
        const forecastResponse = await fetch(
          `http://localhost:8000/api/hourly/${city}`
        );
        if (!forecastResponse.ok)
          throw new Error("Erreur de récupération des prévisions horaires");
        const forecastJson = await forecastResponse.json();
        setForecastData(forecastJson.data);

        // Récupérer les données du jour
        const todayResponse = await fetch(
          `http://localhost:8000/api/Today/${city}`
        );
        if (!todayResponse.ok)
          throw new Error("Erreur de récupération des données du jour");
        const todayJson = await todayResponse.json();
        setTodayData(todayJson.data);

        // Récupérer les données actuelles
        const actualResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!actualResponse.ok)
          throw new Error("Erreur de récupération des données actuelles");
        const actualJson = await actualResponse.json();
        setActualData(actualJson.list);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen ${bgClass}`}
      >
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className={`text-lg ${textClass}`}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen ${bgClass}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" size={20} />
            <span className="font-bold">Erreur :</span>
          </div>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!forecastData || !todayData || !actualData) {
    return (
      <div className={`flex items-center justify-center h-screen ${bgClass}`}>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          <div className="flex items-center">
            <FiInfo className="mr-2" size={20} />
            <span className="font-bold">Information :</span>
          </div>
          <p className="mt-2">Aucune donnée disponible pour cette ville.</p>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques horaires
  const forecastTimes = forecastData.map((item) => item.time);
  const forecastTemps = forecastData.map((item) => item.temp);
  const forecastHumidity = forecastData.map((item) => item.humidity);
  const forecastWind = forecastData.map((item) => item.wind_speed);
  const forecastPressure = forecastData.map((item) => item.pressure || 0);

  // Correspondre les données actuelles avec les prévisions horaires
  const actualTemps = actualData
    .slice(0, forecastData.length)
    .map((item) => item.main.temp);
  const actualHumidity = actualData
    .slice(0, forecastData.length)
    .map((item) => item.main.humidity);
  const actualWind = actualData
    .slice(0, forecastData.length)
    .map((item) => item.wind.speed);
  const actualPressure = actualData
    .slice(0, forecastData.length)
    .map((item) => item.main.pressure);

  // Calculer les différences horaires
  const tempDifferences = forecastTemps.map((temp, index) =>
    (temp - actualTemps[index]).toFixed(2)
  );
  const humidityDifferences = forecastHumidity.map((hum, index) =>
    (hum - actualHumidity[index]).toFixed(2)
  );
  const windDifferences = forecastWind.map((wind, index) =>
    (wind - actualWind[index]).toFixed(2)
  );
  const pressureDifferences = forecastPressure.map((pressure, index) =>
    (pressure - actualPressure[index]).toFixed(2)
  );

  // Calculer les pourcentages de précision horaires
  const tempAccuracy = forecastTemps.map((temp, index) =>
    Math.max(
      0,
      100 - Math.abs(((temp - actualTemps[index]) / actualTemps[index]) * 100)
    ).toFixed(1)
  );
  const humidityAccuracy = forecastHumidity.map((hum, index) =>
    Math.max(
      0,
      100 -
        Math.abs(((hum - actualHumidity[index]) / actualHumidity[index]) * 100)
    ).toFixed(1)
  );
  const windAccuracy = forecastWind.map((wind, index) =>
    Math.max(
      0,
      100 - Math.abs(((wind - actualWind[index]) / actualWind[index]) * 100)
    ).toFixed(1)
  );

  // Données journalières
  const todayForecast = {
    temp: todayData.temp,
    feels_like: todayData.feels_like,
    temp_min: todayData.temp_min,
    temp_max: todayData.temp_max,
    humidity: todayData.humidity,
    pressure: todayData.pressure,
    wind_speed: todayData.wind.speed,
    rain: todayData.rain || 0,
    snow: todayData.snow || 0,
    clouds: todayData.clouds,
    weather: todayData.weather[0].main,
    date: todayData.date,
    dayName: todayData.dayName,
  };

  // Trouver les données actuelles pour aujourd'hui
  const todayActual = actualData.find(
    (item) =>
      new Date(item.dt * 1000).toLocaleDateString() ===
      new Date(todayData.dt * 1000).toLocaleDateString()
  );

  // Calculer les différences journalières
  const todayTempDiff = (todayForecast.temp - todayActual.main.temp).toFixed(1);
  const todayHumidityDiff = (
    todayForecast.humidity - todayActual.main.humidity
  ).toFixed(1);
  const todayWindDiff = (
    todayForecast.wind_speed - todayActual.wind.speed
  ).toFixed(1);
  const todayPressureDiff = (
    todayForecast.pressure - todayActual.main.pressure
  ).toFixed(1);

  // Configurations des graphiques horaires
  const tempChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Température prévue (°C)",
        data: forecastTemps,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Température réelle (°C)",
        data: actualTemps,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const humidityChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Humidité prévue (%)",
        data: forecastHumidity,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Humidité réelle (%)",
        data: actualHumidity,
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const windChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Vitesse du vent prévue (km/h)",
        data: forecastWind,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Vitesse du vent réelle (km/h)",
        data: actualWind,
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const pressureChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Pression prévue (hPa)",
        data: forecastPressure,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Pression réelle (hPa)",
        data: actualPressure,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const differenceChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Différence de température (°C)",
        data: tempDifferences,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Différence d'humidité (%)",
        data: humidityDifferences,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Différence de vent (km/h)",
        data: windDifferences,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  const accuracyChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: "Précision température (%)",
        data: tempAccuracy,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Précision humidité (%)",
        data: humidityAccuracy,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Précision vent (%)",
        data: windAccuracy,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#fff" : "#333",
        },
      },
      title: {
        display: true,
        text: "Comparaison des données météorologiques",
        color: darkMode ? "#fff" : "#333",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}${
              context.dataset.label.includes("°C")
                ? "°C"
                : context.dataset.label.includes("%")
                ? "%"
                : context.dataset.label.includes("km/h")
                ? " km/h"
                : context.dataset.label.includes("hPa")
                ? " hPa"
                : ""
            }`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: darkMode ? "#fff" : "#333",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#333",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#fff" : "#333",
        },
      },
      title: {
        display: true,
        text: "Différences entre prévisions et réalité",
        color: darkMode ? "#fff" : "#333",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: darkMode ? "#fff" : "#333",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#333",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Barre de recherche améliorée */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className={`text-2xl font-bold ${textClass}`}>
              Dashboard Météo Comparaison
            </h1>
            {alerts.length > 0 && (
              <div className="relative ml-4">
                <button
                  onClick={toggleNotifications}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  } relative`}
                >
                  <FiBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {alerts.length}
                  </span>
                </button>
                {showNotifications && (
                  <div
                    className={`absolute right-0 mt-2 w-72 rounded-md shadow-lg ${
                      darkMode ? "bg-gray-700" : "bg-white"
                    } ring-1 ring-black ring-opacity-5 z-20`}
                  >
                    <div
                      className={`p-4 ${
                        darkMode ? "bg-gray-700" : "bg-white"
                      } rounded-md`}
                    >
                      <h3 className={`text-lg font-medium ${textClass} mb-2`}>
                        Alertes Météo
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {alerts.map((alert, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded ${
                              darkMode ? "bg-gray-600" : "bg-yellow-50"
                            }`}
                          >
                            <h4 className={`font-bold ${textClass}`}>
                              {alert.event}
                            </h4>
                            <p className={`text-sm ${secondaryTextClass}`}>
                              {alert.description}
                            </p>
                            <p className="text-xs mt-1 text-gray-500">
                              Du {new Date(alert.start * 1000).toLocaleString()}{" "}
                              au {new Date(alert.end * 1000).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  fetchCitySuggestions(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Rechercher une ville..."
                className={`w-full md:w-64 px-4 py-2 rounded-l-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />

              {showSuggestions && searchSuggestions.length > 0 && (
                <div
                  className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } border ${
                    darkMode ? "border-gray-600" : "border-gray-300"
                  } max-h-60 overflow-auto`}
                >
                  {searchSuggestions.map((city, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${
                        darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        handleCitySelect(city);
                      }}
                    >
                      {city.name}, {city.country}
                      {city.state && `, ${city.state}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`px-4 py-2 rounded-r-lg ${buttonClass} text-white`}
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Affichage de la ville actuelle */}
        <div
          className={`${cardBgClass} rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-between`}
        >
          <h2
            className={`text-lg md:text-xl font-semibold ${textClass} flex items-center`}
          >
            <FiMapPin className="mr-2 text-red-500" />
            Ville actuelle: <span className="text-blue-600 ml-1">{city}</span>
          </h2>
          {geolocationError && (
            <div className="text-sm text-yellow-600 flex items-center">
              <FiAlertCircle className="mr-1" />
              {geolocationError}
            </div>
          )}
        </div>

        {/* Comparaison journalière */}
        <div
          className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6`}
        >
          <h2
            className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4 flex items-center`}
          >
            <WiDaySunny className="mr-2 text-yellow-500" size={24} />
            Comparaison journalière - {todayForecast.dayName}{" "}
            {todayForecast.date}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <h3
                className={`text-sm font-medium ${
                  darkMode ? "text-blue-300" : "text-blue-800"
                } flex items-center`}
              >
                <WiDaySunny className="mr-2" size={20} />
                Température
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {todayForecast.temp}°C
                  </p>
                  <p className={`text-sm ${secondaryTextClass}`}>
                    (Prévu: {todayForecast.temp_min}°C -{" "}
                    {todayForecast.temp_max}°C)
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayTempDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">Différence</p>
                  <p className="text-xl font-bold">{todayTempDiff}°C</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-green-50"
              }`}
            >
              <h3
                className={`text-sm font-medium ${
                  darkMode ? "text-green-300" : "text-green-800"
                } flex items-center`}
              >
                <WiHumidity className="mr-2" size={20} />
                Humidité
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {todayForecast.humidity}%
                  </p>
                  <p className={`text-sm ${secondaryTextClass}`}>
                    Ressenti: {todayForecast.feels_like}°C
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayHumidityDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">Différence</p>
                  <p className="text-xl font-bold">{todayHumidityDiff}%</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-purple-50"
              }`}
            >
              <h3
                className={`text-sm font-medium ${
                  darkMode ? "text-purple-300" : "text-purple-800"
                } flex items-center`}
              >
                <WiStrongWind className="mr-2" size={20} />
                Vent
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  >
                    {todayForecast.wind_speed} km/h
                  </p>
                  <p className={`text-sm ${secondaryTextClass}`}>
                    Direction: {todayData.wind.deg}°
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayWindDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">Différence</p>
                  <p className="text-xl font-bold">{todayWindDiff} km/h</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-yellow-50"
              }`}
            >
              <h3
                className={`text-sm font-medium ${
                  darkMode ? "text-yellow-300" : "text-yellow-800"
                } flex items-center`}
              >
                <WiBarometer className="mr-2" size={20} />
                Conditions
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p
                    className={`text-xl font-bold ${
                      darkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    {todayForecast.weather}
                  </p>
                  <p
                    className={`text-sm ${secondaryTextClass} flex items-center`}
                  >
                    {todayForecast.rain > 0 && (
                      <>
                        <WiRain className="mr-1" size={20} />
                        Pluie: {todayForecast.rain}mm
                      </>
                    )}
                    {todayForecast.snow > 0 && (
                      <>
                        <WiSnow className="mr-1" size={20} />
                        Neige: {todayForecast.snow}mm
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayPressureDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">Pression diff.</p>
                  <p className="text-xl font-bold">{todayPressureDiff} hPa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille principale pour les comparaisons horaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Comparaison de température */}
          <div className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6`}>
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4 flex items-center`}
            >
              <WiDaySunny className="mr-2 text-yellow-500" size={24} />
              Comparaison horaire de température
            </h2>
            <div className="h-64 md:h-80">
              <Line data={tempChartData} options={options} />
            </div>
          </div>

          {/* Comparaison d'humidité */}
          <div className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6`}>
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4 flex items-center`}
            >
              <WiHumidity className="mr-2 text-blue-500" size={24} />
              Comparaison horaire d'humidité
            </h2>
            <div className="h-64 md:h-80">
              <Line data={humidityChartData} options={options} />
            </div>
          </div>

          {/* Comparaison de vent */}
          <div className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6`}>
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4 flex items-center`}
            >
              <WiStrongWind className="mr-2 text-gray-500" size={24} />
              Comparaison horaire de vitesse du vent
            </h2>
            <div className="h-64 md:h-80">
              <Line data={windChartData} options={options} />
            </div>
          </div>

          {/* Comparaison de pression */}
          <div className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6`}>
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4 flex items-center`}
            >
              <WiBarometer className="mr-2 text-purple-500" size={24} />
              Comparaison horaire de pression atmosphérique
            </h2>
            <div className="h-64 md:h-80">
              <Line data={pressureChartData} options={options} />
            </div>
          </div>

          {/* Différences */}
          <div
            className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6 lg:col-span-2`}
          >
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4`}
            >
              Différences de précision des prévisions horaires
            </h2>
            <div className="h-64 md:h-80">
              <Bar data={differenceChartData} options={barOptions} />
            </div>
          </div>

          {/* Précision */}
          <div
            className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6 lg:col-span-2`}
          >
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4`}
            >
              Pourcentage de précision des prévisions horaires
            </h2>
            <div className="h-64 md:h-80">
              <Line data={accuracyChartData} options={options} />
            </div>
          </div>

          {/* Tableau de données */}
          <div
            className={`${cardBgClass} rounded-lg shadow-md p-4 md:p-6 lg:col-span-2 overflow-x-auto`}
          >
            <h2
              className={`text-lg md:text-xl font-semibold ${textClass} mb-3 md:mb-4`}
            >
              Données détaillées de comparaison horaire
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <tr>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Heure
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Température
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Humidité
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Vent
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Pression
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Précision
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={`${
                    darkMode
                      ? "bg-gray-800 divide-gray-700"
                      : "bg-white divide-gray-200"
                  }`}
                >
                  {forecastData.map((item, index) => (
                    <tr key={index}>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {item.time}
                      </td>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">P: {item.temp}°C</span>
                        <br />
                        <span className="font-medium">
                          R: {actualTemps[index]}°C
                        </span>
                        <br />
                        <span
                          className={`${
                            tempDifferences[index] > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          Δ: {tempDifferences[index]}°C
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">P: {item.humidity}%</span>
                        <br />
                        <span className="font-medium">
                          R: {actualHumidity[index]}%
                        </span>
                        <br />
                        <span
                          className={`${
                            humidityDifferences[index] > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          Δ: {humidityDifferences[index]}%
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">
                          P: {item.wind_speed} km/h
                        </span>
                        <br />
                        <span className="font-medium">
                          R: {actualWind[index]} km/h
                        </span>
                        <br />
                        <span
                          className={`${
                            windDifferences[index] > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          Δ: {windDifferences[index]} km/h
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">
                          P: {item.pressure || "N/A"} hPa
                        </span>
                        <br />
                        <span className="font-medium">
                          R: {actualPressure[index]} hPa
                        </span>
                        <br />
                        <span
                          className={`${
                            pressureDifferences[index] > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          Δ: {pressureDifferences[index]} hPa
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-blue-600">
                            {tempAccuracy[index]}%
                          </span>
                          <div
                            className={`w-full ${
                              darkMode ? "bg-gray-600" : "bg-gray-200"
                            } rounded-full h-2 mt-1`}
                          >
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${tempAccuracy[index]}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé statistique */}
        </div>
      </div>
    </div>
  );
};

export default Comparisons;
