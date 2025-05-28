import React, { useState, useEffect } from "react";
import {
  NavLink,
  Route,
  Routes,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  FaCheck,
  FaTemperatureHigh,
  FaTint,
  FaWind,
  FaMapMarkerAlt,
  FaBell,
  FaRegBell,
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import Comparisons from "../components/Admin/Comparisons/Comparisons";
import Dashboard from "../components/Admin/Dashboard/Dashboard";
import ProfileEdit from "../components/Admin/Profile/ProfileEdit";

import {
  Thermometer,
  Droplet,
  Wind,
  Sun,
  CloudRain,
  Search,
  MapPin,
  Calendar,
  RefreshCw,
  Locate,
  Navigation,
  Settings,
  BarChart2,
  Home,
  User as UserIcon,
  LogOut,
  Bell,
  Check,
  Menu,
  X,
} from "lucide-react";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

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
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configuration de l'icône personnalisée pour Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Composant ErrorBoundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Une erreur est survenue. Veuillez recharger la page.
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant DashboardCard
const DashboardCard = ({
  title,
  value,
  icon,
  description,
  darkMode = false,
}) => (
  <div
    className={`p-4 rounded-lg ${
      darkMode ? "bg-gray-700" : "bg-blue-50"
    } border ${darkMode ? "border-gray-600" : "border-blue-100"}`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`p-2 rounded-full ${
          darkMode ? "bg-gray-600" : "bg-blue-100"
        }`}
      >
        {icon}
      </div>
      <div>
        <h4
          className={`text-sm font-medium ${
            darkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {title}
        </h4>
        <p
          className={`text-xl font-bold mt-1 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {value}
        </p>
        {description && (
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Composant Carte Interactive
const InteractiveMap = ({ location, darkMode }) => {
  if (!location || !location.lat || !location.lon) return null;

  const mapStyle = {
    height: "300px",
    width: "100%",
    borderRadius: "0.5rem",
    zIndex: 0,
  };

  return (
    <div className="mt-4">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={13}
        style={mapStyle}
      >
        <TileLayer
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[location.lat, location.lon]}>
          <Popup>Votre position actuelle</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// Composant principal Admin
const User = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [city, setCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const OPENWEATHER_API_KEY = "6e601e5bf166b100420a3cf427368540";
  const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!OPENWEATHER_API_KEY) {
        throw new Error("Clé API manquante");
      }

      // Vérifier si nous avons une ville ou une localisation valide
      if (!city && (!userLocation || !userLocation.lat || !userLocation.lon)) {
        setLoading(false);
        return;
      }

      let currentUrl, forecastUrl;

      if (userLocation && userLocation.lat && userLocation.lon) {
        currentUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;
        forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=40`;
      } else if (city) {
        currentUrl = `${OPENWEATHER_BASE_URL}/weather?q=${city},MA&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;
        forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${city},MA&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=40`;
      } else {
        setLoading(false);
        return;
      }

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      if (!currentResponse.ok)
        throw new Error(`Erreur HTTP: ${currentResponse.status}`);
      if (!forecastResponse.ok)
        throw new Error(`Erreur HTTP: ${forecastResponse.status}`);

      const [currentData, forecastData] = await Promise.all([
        currentResponse.json(),
        forecastResponse.json(),
      ]);

      if (currentData.cod !== 200)
        throw new Error(currentData.message || "Erreur inconnue");
      if (forecastData.cod !== "200")
        throw new Error(forecastData.message || "Erreur inconnue");

      setWeatherData(currentData);
      setForecastData(forecastData);
      setLastUpdated(new Date().toLocaleTimeString());

      if (userLocation && currentData.name) {
        setCity(currentData.name);
      }
    } catch (err) {
      console.error("Erreur fetchWeatherData:", err);
      setError(
        err.message || "Erreur lors de la récupération des données météo"
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    setLocationAccuracy(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationAccuracy(position.coords.accuracy);
          setIsFetchingLocation(false);
        },
        (err) => {
          let errorMessage = "Localisation refusée.";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "L'accès à la géolocalisation a été refusé.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage =
                "Les informations de localisation ne sont pas disponibles.";
              break;
            case err.TIMEOUT:
              errorMessage = "La demande de localisation a expiré.";
              break;
            default:
              errorMessage =
                "Une erreur inconnue s'est produite lors de la géolocalisation.";
          }
          setLocationError(errorMessage);
          setIsFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Géolocalisation non supportée par votre navigateur.");
      setIsFetchingLocation(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity);
      setUserLocation(null);
      setInputCity("");
      setLocationAccuracy(null);
    }
  };

  const handleLocateMe = () => {
    getUserLocation();
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 600000);
    return () => clearInterval(interval);
  }, [city, userLocation]);

  const prepareChartData = () => {
    if (!forecastData?.list) return [];

    return forecastData.list.slice(0, 24).map((item) => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString("fr-FR", { hour: "2-digit" }),
        temp: Math.round(item.main.temp),
        humidity: item.main.humidity,
        wind: Math.round(item.wind.speed * 3.6),
        feels_like: Math.round(item.main.feels_like),
      };
    });
  };

  const chartData = prepareChartData();

  const getForecastForDay = (index) => {
    if (!forecastData?.list) return null;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + index);
    const targetDateString = targetDate.toLocaleDateString("fr-FR");

    return forecastData.list.find((item) => {
      const itemDate = new Date(item.dt * 1000).toLocaleDateString("fr-FR");
      return itemDate === targetDateString;
    });
  };

  const fetchTriggeredAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await fetch(
        "http://localhost:8000/api/triggered-alerts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTriggeredAlerts(data.data);
        setUnreadAlertsCount(data.data.length);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/triggered-alerts/${alertId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTriggeredAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert._id !== alertId)
        );
        setUnreadAlertsCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'alerte:", error);
    }
  };

  useEffect(() => {
    fetchTriggeredAlerts();
    const interval = setInterval(fetchTriggeredAlerts, 60000);
    return () => clearInterval(interval);
  }, []);
  const renderAlertsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {triggeredAlerts.map((alert) => {
        // Icônes par type
        const typeIcons = {
          temperature: <FaTemperatureHigh className="text-red-500 text-2xl" />,
          humidity: <FaTint className="text-blue-500 text-2xl" />,
          wind: <FaWind className="text-green-500 text-2xl" />,
          pressure: <FaMapMarkerAlt className="text-purple-500 text-2xl" />,
          rain: <CloudRain className="text-blue-400 text-2xl" />,
          uv: <Sun className="text-yellow-400 text-2xl" />,
        };

        const icon = typeIcons[alert.type] || (
          <FaBell className="text-blue-500 text-2xl" />
        );

        // Couleurs selon la sévérité
        const severityColors = {
          Danger: "bg-red-100 text-red-800",
          Warning: "bg-orange-100 text-orange-800",
          Info: "bg-blue-100 text-blue-800",
        };

        return (
          <div
            key={alert._id}
            className={`rounded-xl shadow-md overflow-hidden border-l-4 ${
              alert.severity === "Danger"
                ? "border-red-500"
                : alert.severity === "Warning"
                ? "border-orange-500"
                : "border-blue-500"
            } ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {icon}
                  <h3 className="text-lg font-bold capitalize">{alert.type}</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    severityColors[alert.severity]
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Condition
                  </p>
                  <p className="font-medium">
                    {(() => {
                      let unit = "";
                      switch (alert.type) {
                        case "temperature":
                          unit = "°C";
                          break;
                        case "humidity":
                          unit = "%";
                          break;
                        case "wind":
                          unit = "km/h";
                          break;
                        case "pressure":
                          unit = "hPa";
                          break;
                        case "rain":
                          unit = "mm";
                          break;
                        case "uv":
                          unit = "UVI";
                          break;
                        default:
                          unit = "";
                      }
                      const op =
                        alert.alertId?.condition || alert.condition || ">";
                      const seuil =
                        alert.alertValue !== undefined
                          ? alert.alertValue
                          : alert.alertId?.value !== undefined
                          ? alert.alertId.value
                          : "-";
                      return (
                        <span>
                          <span className="font-bold">
                            {alert.value}
                            {unit}
                          </span>
                          <span className="mx-1">{op}</span>
                          <span className="font-bold">
                            {seuil}
                            {unit}
                          </span>
                        </span>
                      );
                    })()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fréquence
                  </p>
                  <p className="font-medium capitalize">{alert.frequency}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Localisation
                  </p>
                  <p className="font-medium">{alert.city}</p>
                </div>

                {alert.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Description
                    </p>
                    <p className="font-medium">{alert.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Déclenchée le
                  </p>
                  <p className="font-medium">
                    {new Date(alert.triggeredAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400"></span>
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert._id)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {renderAlertsSection()}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {weatherData?.name || city}
                </h2>
                <p className="text-sm md:text-base">
                  {lastUpdated && `Dernière mise à jour: ${lastUpdated}`}
                </p>
                {userLocation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordonnées: {userLocation.lat.toFixed(6)},{" "}
                    {userLocation.lon.toFixed(6)}
                  </p>
                )}
              </div>
              <button
                onClick={fetchWeatherData}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Rafraîchir</span>
              </button>
            </div>

            {error && (
              <div
                className={`p-4 mb-6 rounded-lg ${
                  darkMode
                    ? "bg-red-900 text-red-100"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            {/* Current Weather */}
            {weatherData && (
              <div
                className={`p-4 md:p-6 rounded-xl shadow-md mb-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
                  <h3 className="text-lg md:text-xl font-semibold">
                    Conditions actuelles
                  </h3>
                  {weatherData.weather[0] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                        alt={weatherData.weather[0].description}
                        className="w-10 h-10"
                      />
                      <span className="text-base md:text-lg capitalize">
                        {weatherData.weather[0].description}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DashboardCard
                    title="Température"
                    value={`${Math.round(weatherData.main.temp)}°C`}
                    icon={<Thermometer className="text-red-500" size={20} />}
                    description={`Ressentie: ${Math.round(
                      weatherData.main.feels_like
                    )}°C`}
                    darkMode={darkMode}
                  />
                  <DashboardCard
                    title="Humidité"
                    value={`${weatherData.main.humidity}%`}
                    icon={<Droplet className="text-blue-400" size={20} />}
                    description="Niveau d'humidité"
                    darkMode={darkMode}
                  />
                  <DashboardCard
                    title="Vent"
                    value={`${Math.round(weatherData.wind.speed * 3.6)} km/h`}
                    icon={<Wind className="text-gray-500" size={20} />}
                    description={`Direction: ${weatherData.wind.deg}°`}
                    darkMode={darkMode}
                  />
                  <DashboardCard
                    title="Pression"
                    value={`${weatherData.main.pressure} hPa`}
                    icon={<CloudRain className="text-indigo-500" size={20} />}
                    description="Pression atmosphérique"
                    darkMode={darkMode}
                  />
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div
                className={`p-4 rounded-xl shadow ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-lg font-semibold mb-3">
                  Température sur 24h
                </h3>
                <div className="h-64 md:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? "#4b5563" : "#e5e7eb"}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={darkMode ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <Tooltip
                        contentStyle={
                          darkMode
                            ? {
                                backgroundColor: "#1f2937",
                                borderColor: "#374151",
                                color: "#f3f4f6",
                              }
                            : {}
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        name="Température (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl shadow ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-lg font-semibold mb-3">Vent et Humidité</h3>
                <div className="h-64 md:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? "#4b5563" : "#e5e7eb"}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={darkMode ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke={darkMode ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={darkMode ? "#9ca3af" : "#6b7280"}
                      />
                      <Tooltip
                        contentStyle={
                          darkMode
                            ? {
                                backgroundColor: "#1f2937",
                                borderColor: "#374151",
                                color: "#f3f4f6",
                              }
                            : {}
                        }
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="wind"
                        name="Vent (km/h)"
                        fill="#6b7280"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="humidity"
                        name="Humidité (%)"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Forecast */}
            {forecastData && (
              <div
                className={`p-4 rounded-xl shadow ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-lg font-semibold mb-3">
                  Détails des prévisions
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Jour
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Conditions
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Température
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Humidité
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Vent
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        darkMode ? "divide-gray-700" : "divide-gray-200"
                      }`}
                    >
                      {Array.from({ length: 7 }).map((_, index) => {
                        const forecastDay = getForecastForDay(index);
                        return forecastDay ? (
                          <tr
                            key={index}
                            className={
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              {new Date(
                                new Date().getTime() +
                                  index * 24 * 60 * 60 * 1000
                              ).toLocaleDateString("fr-FR", {
                                weekday: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <img
                                  src={`https://openweathermap.org/img/wn/${forecastDay.weather[0].icon}@2x.png`}
                                  alt={forecastDay.weather[0].description}
                                  className="w-8 h-8"
                                />
                                <span className="capitalize">
                                  {forecastDay.weather[0].description}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {Math.round(forecastDay.main.temp)}°C
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {forecastDay.main.humidity}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {Math.round(forecastDay.wind.speed * 3.6)} km/h
                            </td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );

      case "comparisons":
        return <Comparisons darkMode={darkMode} />;

      case "profile":
        return <ProfileEdit darkMode={darkMode} />;

      case "alerts":
        return (
          <div
            className={`p-4 rounded-xl shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Alertes</h2>
            {renderAlertsSection()}
          </div>
        );

      default:
        return <Dashboard darkMode={darkMode} />;
    }
  };

  return (
    <ErrorBoundary>
      <div
        className={`flex flex-col md:flex-row min-h-screen ${
          darkMode
            ? "bg-gray-900 text-gray-100"
            : "bg-gradient-to-br from-blue-50 to-gray-100"
        }`}
      >
        {/* Mobile Header */}
        <header
          className={`md:hidden flex items-center justify-between p-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md`}
        >
          <h1 className="text-xl font-bold text-blue-500 flex items-center gap-2">
            <MapPin size={20} /> Météo Pro
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {darkMode ? <Sun size={18} /> : <CloudRain size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Sidebar avec animation et transition */}
        <aside
          className={`w-full md:w-64 p-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-blue-500 flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
                <MapPin size={20} /> Météo Pro
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <CloudRain size={18} />}
              </button>
            </div>

            {/* Navigation avec animation au survol */}
            <nav className="mb-6">
              <ul className="space-y-1">
                {[
                  {
                    to: "/user/dashboard",
                    icon: <Home size={18} />,
                    label: "Dashboard",
                  },
                  {
                    to: "/user/comparisons",
                    icon: <BarChart2 size={18} />,
                    label: "Comparaisons",
                  },
                  {
                    to: "/user/alerts",
                    icon: <Bell size={18} />,
                    label: "Alertes",
                    badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
                  },
                  {
                    to: "/user/profile",
                    icon: <UserIcon size={18} />,
                    label: "Profil",
                  },
                ].map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? darkMode
                              ? "bg-gray-700 text-white"
                              : "bg-blue-100 text-blue-600"
                            : darkMode
                            ? "hover:bg-gray-700 hover:translate-x-1"
                            : "hover:bg-gray-100 hover:translate-x-1"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
                {/* Bouton de déconnexion */}
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center transition-colors duration-200"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "http://localhost:8000/api/auth/logout",
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (response.ok) {
                          localStorage.removeItem("token");
                          window.location.href = "/";
                        } else {
                          console.error("Échec de la déconnexion");
                        }
                      } catch (error) {
                        console.error("Erreur lors de la déconnexion:", error);
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content avec animation */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto transition-all duration-200">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-red-900/50" : "bg-red-50"
              } text-red-700 dark:text-red-200`}
            >
              {error}
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/user/dashboard" replace />}
              />
              <Route
                path="/dashboard"
                element={<Dashboard darkMode={darkMode} />}
              />
              <Route
                path="/comparisons"
                element={<Comparisons darkMode={darkMode} />}
              />
              <Route
                path="/alerts"
                element={
                  <div
                    className={`p-4 rounded-xl shadow ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h2 className="text-2xl font-bold mb-6">Alertes</h2>
                    {renderAlertsSection()}
                  </div>
                }
              />
              <Route
                path="/profile"
                element={<ProfileEdit darkMode={darkMode} />}
              />
            </Routes>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default User;
