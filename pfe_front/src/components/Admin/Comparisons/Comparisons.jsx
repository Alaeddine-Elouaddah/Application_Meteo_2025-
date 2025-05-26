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
  WiSnow,
} from "react-icons/wi";
import axios from "axios";

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

const translations = {
  fr: {
    title: "Comparaisons",
    loading: "Chargement...",
    error: "Erreur lors du chargement des données",
    noData: "Aucune donnée disponible",
    date: "Date",
    city: "Ville",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    rain: "Pluie",
    forecast: "Prévision",
    actual: "Réel",
    difference: "Différence",
    searchPlaceholder: "Rechercher une ville...",
    search: "Rechercher",
    currentCity: "Ville actuelle",
    dailyComparison: "Comparaison journalière",
    hourlyComparison: "Comparaison horaire",
    accuracy: "Précision",
    details: "Détails",
    notifications: "Notifications",
    alerts: "Alertes météo",
    noAlerts: "Aucune alerte",
    refresh: "Actualiser",
    coordinatesPlaceholder: "Latitude, Longitude (ex: 30.42,-9.58)",
    searchByCoordinates: "Rechercher par coordonnées",
  },
  en: {
    title: "Comparisons",
    loading: "Loading...",
    error: "Error loading data",
    noData: "No data available",
    date: "Date",
    city: "City",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    rain: "Rain",
    forecast: "Forecast",
    actual: "Actual",
    difference: "Difference",
    searchPlaceholder: "Search for a city...",
    search: "Search",
    currentCity: "Current City",
    dailyComparison: "Daily Comparison",
    hourlyComparison: "Hourly Comparison",
    accuracy: "Accuracy",
    details: "Details",
    notifications: "Notifications",
    alerts: "Weather Alerts",
    noAlerts: "No alerts",
    refresh: "Refresh",
    coordinatesPlaceholder: "Latitude, Longitude (ex: 30.42,-9.58)",
    searchByCoordinates: "Search by coordinates",
  },
  ar: {
    title: "المقارنات",
    loading: "جاري التحميل...",
    error: "خطأ في تحميل البيانات",
    noData: "لا توجد بيانات متاحة",
    date: "التاريخ",
    city: "المدينة",
    temperature: "درجة الحرارة",
    humidity: "الرطوبة",
    wind: "الرياح",
    pressure: "الضغط",
    rain: "الأمطار",
    forecast: "التنبؤ",
    actual: "الفعلي",
    difference: "الفرق",
    searchPlaceholder: "ابحث عن مدينة...",
    search: "بحث",
    currentCity: "المدينة الحالية",
    dailyComparison: "المقارنة اليومية",
    hourlyComparison: "المقارنة الساعية",
    accuracy: "الدقة",
    details: "التفاصيل",
    notifications: "الإشعارات",
    alerts: "تنبيهات الطقس",
    noAlerts: "لا توجد تنبيهات",
    refresh: "تحديث",
    coordinatesPlaceholder: "خط العرض، خط الطول (مثال: 30.42,-9.58)",
    searchByCoordinates: "البحث بالإحداثيات",
  },
};

const Comparisons = ({ darkMode }) => {
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
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [coordinateInput, setCoordinateInput] = useState("");
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const t = translations[language];

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Récupérer la ville de l'utilisateur depuis la base de données
  const fetchUserCity = async () => {
    if (!token) return null;
    try {
      const response = await fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.data && data.data.city && data.data.city.name) {
        return data.data.city.name;
      }
      return null;
    } catch {
      return null;
    }
  };

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

  // Recherche par coordonnées
  const handleCoordinateSearch = async (e) => {
    e.preventDefault();
    if (!latitudeInput.trim() || !longitudeInput.trim()) {
      setErrorMessage("Veuillez remplir les deux champs de coordonnées");
      setShowErrorModal(true);
      return;
    }

    try {
      const lat = parseFloat(latitudeInput.trim());
      const lon = parseFloat(longitudeInput.trim());

      if (isNaN(lat) || isNaN(lon)) {
        setErrorMessage("Les coordonnées doivent être des nombres valides");
        setShowErrorModal(true);
        return;
      }

      if (lat < -90 || lat > 90) {
        setErrorMessage(
          "La latitude doit être comprise entre -90 et 90 degrés"
        );
        setShowErrorModal(true);
        return;
      }

      if (lon < -180 || lon > 180) {
        setErrorMessage(
          "La longitude doit être comprise entre -180 et 180 degrés"
        );
        setShowErrorModal(true);
        return;
      }

      setLoading(true);

      // Récupérer le nom de la ville à partir des coordonnées
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const cityName = data[0].name;
        setCity(cityName);
        setLatitudeInput("");
        setLongitudeInput("");
        await fetchWeatherData(cityName);
      } else {
        setErrorMessage("Aucune ville trouvée pour ces coordonnées");
        setShowErrorModal(true);
      }
    } catch (err) {
      setErrorMessage(err.message || "Une erreur est survenue");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Détecter la localisation de l'utilisateur
  const detectLocationTemp = () => {
    if (navigator.geolocation) {
      setLoading(true);
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
              await fetchWeatherData(data[0].name);
            } else {
              setCity("El jadida");
              setGeolocationError(
                "Impossible de déterminer votre ville. Utilisation de El jadida par défaut."
              );
              await fetchWeatherData("El jadida");
            }
          } catch (err) {
            console.error("Erreur de récupération du nom de la ville:", err);
            setCity("El jadida");
            setGeolocationError(
              "Erreur lors de la récupération du nom de la ville. Utilisation de El jadida par défaut."
            );
            await fetchWeatherData("El jadida");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Erreur de géolocalisation:", err);
          setCity("El jadida");
          setGeolocationError(
            "Impossible d'obtenir votre position. Utilisation de El jadida par défaut."
          );
          fetchWeatherData("El jadida");
          setLoading(false);
        }
      );
    } else {
      setCity("El jadida");
      setGeolocationError(
        "La géolocalisation n'est pas supportée par votre navigateur. Utilisation de El jadida par défaut."
      );
      fetchWeatherData("El jadida");
      setLoading(false);
    }
  };

  // Récupérer les données météo
  const fetchWeatherData = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données de prévision horaire
      const forecastResponse = await fetch(
        `http://localhost:8000/api/hourly/${cityName}`
      );
      if (!forecastResponse.ok)
        throw new Error("Erreur de récupération des prévisions horaires");
      const forecastJson = await forecastResponse.json();
      setForecastData(forecastJson.data);

      // Récupérer les données du jour
      const todayResponse = await fetch(
        `http://localhost:8000/api/Today/${cityName}`
      );
      if (!todayResponse.ok)
        throw new Error("Erreur de récupération des données du jour");
      const todayJson = await todayResponse.json();
      setTodayData(todayJson.data);

      // Récupérer les données actuelles
      const actualResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
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

  // Sélectionner une ville
  const handleCitySelect = async (selectedCity) => {
    setCity(selectedCity.name);
    setSearchInput(`${selectedCity.name}, ${selectedCity.country}`);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    await fetchWeatherData(selectedCity.name);
  };

  // Rechercher une ville
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim() && searchSuggestions.length > 0) {
      await handleCitySelect(searchSuggestions[0]);
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

  // Basculer les notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Initialiser les données au chargement du composant
  useEffect(() => {
    const init = async () => {
      const cityFromDb = await fetchUserCity();
      if (cityFromDb) {
        setCity(cityFromDb);
        await fetchWeatherData(cityFromDb);
      } else {
        detectLocationTemp();
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-800">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" size={20} />
            <span className="font-bold">{t.error}</span>
          </div>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            {t.refresh}
          </button>
        </div>
      </div>
    );
  }

  if (!forecastData || !todayData || !actualData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          <div className="flex items-center">
            <FiInfo className="mr-2" size={20} />
            <span className="font-bold">{t.noData}</span>
          </div>
          <p className="mt-2">{t.noData}</p>
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
  const todayActual = actualData?.find(
    (item) =>
      new Date(item.dt * 1000).toLocaleDateString() ===
      new Date(todayData.dt * 1000).toLocaleDateString()
  ) || {
    main: {
      temp: 0,
      humidity: 0,
      pressure: 0,
    },
    wind: {
      speed: 0,
    },
  };

  // Calculer les différences journalières avec des valeurs par défaut
  const todayTempDiff = todayActual
    ? (todayForecast.temp - todayActual.main.temp).toFixed(1)
    : "0.0";
  const todayHumidityDiff = todayActual
    ? (todayForecast.humidity - todayActual.main.humidity).toFixed(1)
    : "0.0";
  const todayWindDiff = todayActual
    ? (todayForecast.wind_speed - todayActual.wind.speed).toFixed(1)
    : "0.0";
  const todayPressureDiff = todayActual
    ? (todayForecast.pressure - todayActual.main.pressure).toFixed(1)
    : "0.0";

  // Configurations des graphiques horaires
  const tempChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: `${t.forecast} (${t.temperature}) (°C)`,
        data: forecastTemps,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.actual} (${t.temperature}) (°C)`,
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
        label: `${t.forecast} (${t.humidity}) (%)`,
        data: forecastHumidity,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.actual} (${t.humidity}) (%)`,
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
        label: `${t.forecast} (${t.wind}) (km/h)`,
        data: forecastWind,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.actual} (${t.wind}) (km/h)`,
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
        label: `${t.forecast} (${t.pressure}) (hPa)`,
        data: forecastPressure,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.actual} (${t.pressure}) (hPa)`,
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
        label: `${t.difference} (${t.temperature}) (°C)`,
        data: tempDifferences,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: `${t.difference} (${t.humidity}) (%)`,
        data: humidityDifferences,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: `${t.difference} (${t.wind}) (km/h)`,
        data: windDifferences,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  const accuracyChartData = {
    labels: forecastTimes,
    datasets: [
      {
        label: `${t.accuracy} (${t.temperature}) (%)`,
        data: tempAccuracy,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.accuracy} (${t.humidity}) (%)`,
        data: humidityAccuracy,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: `${t.accuracy} (${t.wind}) (%)`,
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
        text: t.hourlyComparison,
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
        text: t.difference,
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
      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${cardBgClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textClass}`}>Erreur</h3>
              <button
                onClick={() => setShowErrorModal(false)}
                className={`p-1 rounded-full hover:bg-gray-200 ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className={`${textClass} mb-4`}>{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className={`px-4 py-2 rounded-lg ${buttonClass} text-white`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Barre de recherche améliorée */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className={`text-2xl font-bold ${textClass}`}>{t.title}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full justify-end">
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
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder={t.searchPlaceholder}
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
                {t.search}
              </button>
              <button
                type="button"
                className="px-4 py-2 ml-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center"
                onClick={detectLocationTemp}
              >
                <FiNavigation className="inline mr-1" />
                Détecter
              </button>
            </form>

            <form
              onSubmit={handleCoordinateSearch}
              className="flex w-full md:w-auto"
            >
              <div className="relative flex-grow md:flex-grow-0 flex gap-2">
                <input
                  type="number"
                  value={latitudeInput}
                  onChange={(e) => setLatitudeInput(e.target.value)}
                  placeholder="Latitude (ex: 30.42)"
                  min="-90"
                  max="90"
                  step="0.000001"
                  className={`w-32 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  value={longitudeInput}
                  onChange={(e) => setLongitudeInput(e.target.value)}
                  placeholder="Longitude (ex: -9.58)"
                  min="-180"
                  max="180"
                  step="0.000001"
                  className={`w-32 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg ${buttonClass} text-white`}
                >
                  <FiNavigation className="inline mr-1" />
                  {t.searchByCoordinates}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Affichage de la ville actuelle */}
        <div
          className={`${cardBgClass} rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-between`}
        >
          <h2
            className={`text-lg md:text-xl font-semibold ${textClass} flex items-center`}
          >
            <FiMapPin className="mr-2 text-red-500" />
            {t.currentCity}: <span className="text-blue-600 ml-1">{city}</span>
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
            {t.dailyComparison} - {todayForecast.dayName} {todayForecast.date}
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
                {t.temperature}
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
                    ({t.forecast}: {todayForecast.temp_min}°C -{" "}
                    {todayForecast.temp_max}°C)
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayTempDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">{t.difference}</p>
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
                {t.humidity}
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
                    {t.feels_like}: {todayForecast.feels_like}°C
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayHumidityDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">{t.difference}</p>
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
                {t.wind}
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
                    {t.direction}: {todayData.wind.deg}°
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayWindDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">{t.difference}</p>
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
                {t.conditions}
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
                        {t.rain}: {todayForecast.rain}mm
                      </>
                    )}
                    {todayForecast.snow > 0 && (
                      <>
                        <WiSnow className="mr-1" size={20} />
                        {t.snow}: {todayForecast.snow}mm
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={`text-right ${
                    todayPressureDiff > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <p className="text-sm">
                    {t.pressure} {t.difference}
                  </p>
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
              {t.hourlyComparison} - {t.temperature}
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
              {t.hourlyComparison} - {t.humidity}
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
              {t.hourlyComparison} - {t.wind}
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
              {t.hourlyComparison} - {t.pressure}
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
              {t.difference} {t.accuracy}
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
              {t.accuracy} (%)
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
              {t.details}
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
                      {t.time}
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      {t.temperature}
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      {t.humidity}
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      {t.wind}
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      {t.pressure}
                    </th>
                    <th
                      className={`px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      {t.accuracy}
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
        </div>
      </div>
    </div>
  );
};

export default Comparisons;
