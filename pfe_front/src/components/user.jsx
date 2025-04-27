import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplet,
  Wind,
  Sun,
  CloudRain,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  RefreshCw,
  Locate,
  Navigation,
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
          <AlertTriangle className="inline mr-2" />
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
  if (!location) return null;

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

  const OPENWEATHER_API_KEY = "6e601e5bf166b100420a3cf427368540";
  const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!OPENWEATHER_API_KEY) {
        throw new Error("Clé API manquante");
      }

      let currentUrl, forecastUrl;

      if (userLocation) {
        currentUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;
        forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=40`;
      } else {
        currentUrl = `${OPENWEATHER_BASE_URL}/weather?q=${city},MA&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;
        forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${city},MA&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=40`;
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
          let errorMessage =
            "Localisation refusée. Utilisation de la ville par défaut.";
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

  return (
    <ErrorBoundary>
      <div
        className={`flex flex-col md:flex-row min-h-screen ${
          darkMode
            ? "bg-gray-900 text-gray-100"
            : "bg-gradient-to-br from-blue-50 to-gray-100"
        }`}
      >
        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 p-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-blue-500 flex items-center gap-2">
                <MapPin size={20} /> Météo Pro
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 text-yellow-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <CloudRain size={18} />}
              </button>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={inputCity}
                  onChange={(e) => setInputCity(e.target.value)}
                  placeholder="Rechercher une ville..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? "bg-gray-700 text-white" : "bg-white border"
                  }`}
                />
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition"
                >
                  Rechercher
                </button>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isFetchingLocation}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <Locate
                    size={18}
                    className={isFetchingLocation ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </form>

            {locationError && (
              <div
                className={`p-3 mb-4 rounded ${
                  darkMode
                    ? "bg-yellow-900 text-yellow-200"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {locationError}
              </div>
            )}

            {locationAccuracy && (
              <div
                className={`p-3 mb-4 rounded text-xs ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Précision de localisation: ±{Math.round(locationAccuracy)}{" "}
                mètres
              </div>
            )}

            <div
              className={`p-4 rounded-lg mb-6 ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} /> Ville actuelle
              </h2>
              <p className="text-blue-500 font-medium">{city}</p>
              {userLocation && (
                <p className="text-xs mt-1">
                  {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)}
                </p>
              )}
            </div>

            {/* Carte Interactive */}
            {userLocation && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  darkMode ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Navigation size={16} /> Carte de localisation
                </h2>
                <InteractiveMap location={userLocation} darkMode={darkMode} />
                <div className="mt-2 text-center">
                  <a
                    href={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    } hover:underline`}
                  >
                    Ouvrir dans Google Maps
                  </a>
                </div>
              </div>
            )}

            <div
              className={`p-4 rounded-lg flex-grow ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} /> Prévisions 7 jours
              </h2>
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, index) => {
                  const forecastDay = getForecastForDay(index);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between py-2 ${
                        darkMode ? "border-gray-600" : "border-gray-200"
                      } border-b`}
                    >
                      <span>
                        {new Date(
                          new Date().getTime() + index * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                        })}
                      </span>
                      {forecastDay ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getWeatherIcon(forecastDay.weather[0].icon)}
                            alt={forecastDay.weather[0].description}
                            className="w-8 h-8"
                          />
                          <span className="font-medium">
                            {Math.round(forecastDay.main.temp)}°C
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
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
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Rafraîchir</span>
            </button>
          </div>

          {error && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                darkMode ? "bg-red-900 text-red-100" : "bg-red-100 text-red-700"
              }`}
            >
              <AlertTriangle className="inline mr-2" />
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
                      src={getWeatherIcon(weatherData.weather[0].icon)}
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
                            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(
                              new Date().getTime() + index * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img
                                src={getWeatherIcon(
                                  forecastDay.weather[0].icon
                                )}
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
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default User;
