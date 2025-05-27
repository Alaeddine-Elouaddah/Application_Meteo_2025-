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
import { FiNavigation } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MoroccoWeatherMap from "./MoroccoWeatherMap";
import { jwtDecode } from "jwt-decode";

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

// Ajouter après les imports
const customStyles = `
  .weather-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .weather-marker:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .weather-marker.dark {
    background: rgba(31, 41, 55, 0.9);
    color: white;
  }

  .weather-marker .temperature {
    font-weight: bold;
    font-size: 14px;
  }

  .weather-marker .icon {
    margin-top: 2px;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }

  .leaflet-popup-content {
    margin: 0;
  }
`;

const Dashboard = ({ darkMode }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState("temperature");
  const [location, setLocation] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [airQuality, setAirQuality] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [pollenData, setPollenData] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const API_KEY = "6e601e5bf166b100420a3cf427368540";
  const [mapData, setMapData] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  // Fonction pour détecter la localisation et l'enregistrer dans la base de données
  const detectLocationTemp = async () => {
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
              const cityName = `${data[0].name}, ${data[0].country}`;
              setLocation(cityName);

              // Vérifier si l'utilisateur a déjà une ville dans la base de données
              const token = localStorage.getItem("token");
              const userResponse = await fetch(
                "http://localhost:8000/api/auth/me",
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const userData = await userResponse.json();

              // Si l'utilisateur n'a pas de ville ou si la ville est différente
              if (
                !userData.data.city ||
                userData.data.city.name !== data[0].name
              ) {
                // Mettre à jour la ville dans la base de données
                const cityData = {
                  name: data[0].name,
                  country: data[0].country,
                  coordinates: {
                    lat: latitude,
                    lon: longitude,
                  },
                };

                await fetch("http://localhost:8000/api/auth/update-city", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ cityData }),
                });
              }
            } else {
              setLocation("El jadida");
              setGeolocationError(
                "Impossible de déterminer votre ville. Utilisation de El jadida par défaut."
              );
            }
          } catch (err) {
            setLocation("El jadida");
            setGeolocationError(
              "Erreur lors de la récupération du nom de la ville. Utilisation de El jadida par défaut."
            );
          }
        },
        (err) => {
          setLocation("El jadida");
          setGeolocationError(
            "Impossible d'obtenir votre position. Utilisation de El jadida par défaut."
          );
        }
      );
    } else {
      setLocation("El jadida");
      setGeolocationError(
        "La géolocalisation n'est pas supportée par votre navigateur. Utilisation de El jadida par défaut."
      );
    }
  };

  const fetchUserCity = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const response = await fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.data && data.data.city && data.data.city.name) {
        return {
          name: data.data.city.name,
          country: data.data.city.country,
          coordinates: data.data.city.coordinates,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const cityFromDb = await fetchUserCity();
      if (cityFromDb) {
        setLocation(`${cityFromDb.name}, ${cityFromDb.country}`);
        // Si nous avons des coordonnées, nous pouvons les utiliser directement
        if (cityFromDb.coordinates) {
          const { lat, lon } = cityFromDb.coordinates;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=fr`
          );
          const data = await response.json();
          if (data.cod === 200) {
            setWeatherData({
              temperature: Math.round(data.main.temp),
              feelsLike: Math.round(data.main.feels_like),
              humidity: data.main.humidity,
              windSpeed: Math.round(data.wind.speed * 3.6),
              windGust: Math.round(
                (data.wind.gust || data.wind.speed * 1.5) * 3.6
              ),
              windDirection: getWindDirection(data.wind.deg),
              windDeg: data.wind.deg,
              condition: data.weather[0].main.toLowerCase(),
              description: data.weather[0].description,
              pressure: data.main.pressure,
              visibility: data.visibility / 1000,
              sunrise: new Date(data.sys.sunrise * 1000),
              sunset: new Date(data.sys.sunset * 1000),
              icon: data.weather[0].icon,
              rain: data.rain ? data.rain["1h"] || 0 : 0,
              snow: data.snow ? data.snow["1h"] || 0 : 0,
              clouds: data.clouds.all,
              city: data.name,
              country: data.sys.country,
              coord: data.coord,
              dewPoint: Math.round(
                data.main.temp - (100 - data.main.humidity) / 5
              ),
            });
          }
        }
      } else {
        detectLocationTemp();
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (!location) return;
        setLoading(true);
        setError(null);

        // Current weather data
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}&lang=fr`
        );
        const currentData = await currentResponse.json();

        if (currentData.cod !== 200) {
          throw new Error(currentData.message || "Ville non trouvée");
        }

        // 5-day forecast (3-hour intervals)
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}&lang=fr&cnt=40`
        );
        const forecastData = await forecastResponse.json();

        // Air quality data
        const aqResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}`
        );
        const aqData = await aqResponse.json();

        // UV Index data
        const uvResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/uvi?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}`
        );
        const uvData = await uvResponse.json();

        // Mock pollen data
        const mockPollenData = {
          grass: Math.floor(Math.random() * 5),
          tree: Math.floor(Math.random() * 5),
          weed: Math.floor(Math.random() * 5),
          overall: Math.floor(Math.random() * 5),
        };

        setAirQuality(aqData.list[0]);
        setUvIndex(uvData);
        setPollenData(mockPollenData);

        // Update recent locations
        setRecentLocations((prev) => {
          const newLocations = [...prev];
          if (!newLocations.includes(location)) {
            if (newLocations.length >= 5) {
              newLocations.pop();
            }
            newLocations.unshift(location);
          }
          return newLocations;
        });

        setWeatherData({
          temperature: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          windGust: Math.round(
            (currentData.wind.gust || currentData.wind.speed * 1.5) * 3.6
          ),
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
          snow: currentData.snow ? currentData.snow["1h"] || 0 : 0,
          clouds: currentData.clouds.all,
          city: currentData.name,
          country: currentData.sys.country,
          coord: currentData.coord,
          dewPoint: Math.round(
            currentData.main.temp - (100 - currentData.main.humidity) / 5
          ),
        });

        // Process daily forecast data
        const dailyForecasts = processDailyForecastData(forecastData.list);
        setForecastData(dailyForecasts);
        setSelectedDay(dailyForecasts[0]);

        // Process hourly forecast data
        const hourlyForecasts = processHourlyForecastData(forecastData.list);
        setHourlyData(hourlyForecasts);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données météo");
        setLoading(false);
        console.error(err);
      }
    };

    if (location) {
      fetchWeatherData();
    }
  }, [location]);

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
      console.error("Error fetching city suggestions:", err);
      setSearchSuggestions([]);
    }
  };

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
          feelsLike: [],
          humidities: [],
          pressures: [],
          windSpeeds: [],
          windDegs: [],
          conditions: [],
          icons: [],
          rain: [],
          snow: [],
          clouds: [],
          pop: [],
        };
      }
      dailyData[dayKey].temps.push(Math.round(item.main.temp));
      dailyData[dayKey].feelsLike.push(Math.round(item.main.feels_like));
      dailyData[dayKey].humidities.push(item.main.humidity);
      dailyData[dayKey].pressures.push(item.main.pressure);
      dailyData[dayKey].windSpeeds.push(Math.round(item.wind.speed * 3.6));
      dailyData[dayKey].windDegs.push(item.wind.deg);
      dailyData[dayKey].conditions.push(item.weather[0].main.toLowerCase());
      dailyData[dayKey].icons.push(item.weather[0].icon);
      dailyData[dayKey].rain.push(item.rain ? item.rain["3h"] || 0 : 0);
      dailyData[dayKey].snow.push(item.snow ? item.snow["3h"] || 0 : 0);
      dailyData[dayKey].clouds.push(item.clouds.all);
      dailyData[dayKey].pop.push(item.pop ? Math.round(item.pop * 100) : 0);
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
      snow: item.snow ? item.snow["3h"] || 0 : 0,
      pop: item.pop ? Math.round(item.pop * 100) : 0,
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
      case "dust":
      case "sand":
        return <WiDust size={size} color="#D97706" />;
      case "sandstorm":
        return <WiSandstorm size={size} color="#92400E" />;
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

  const getAirQualityIndex = (aqi) => {
    const levels = [
      { level: "Excellent", color: "bg-green-500", text: "text-green-100" },
      { level: "Bon", color: "bg-blue-500", text: "text-blue-100" },
      { level: "Modéré", color: "bg-yellow-500", text: "text-yellow-100" },
      { level: "Mauvais", color: "bg-orange-500", text: "text-orange-100" },
      { level: "Très mauvais", color: "bg-red-500", text: "text-red-100" },
    ];
    return levels[aqi - 1] || levels[0];
  };

  const getPollenLevel = (level) => {
    const levels = [
      { level: "Très bas", color: "bg-green-500" },
      { level: "Bas", color: "bg-blue-500" },
      { level: "Modéré", color: "bg-yellow-500" },
      { level: "Élevé", color: "bg-orange-500" },
      { level: "Très élevé", color: "bg-red-500" },
    ];
    return levels[level] || levels[0];
  };

  const getUvIndexLevel = (uvIndex) => {
    if (uvIndex <= 2) {
      return {
        level: "Faible",
        color: "bg-green-500",
        protection: "Protection minimale",
      };
    } else if (uvIndex <= 5) {
      return {
        level: "Modéré",
        color: "bg-yellow-500",
        protection: "Protection recommandée",
      };
    } else if (uvIndex <= 7) {
      return {
        level: "Élevé",
        color: "bg-orange-500",
        protection: "Protection nécessaire",
      };
    } else if (uvIndex <= 10) {
      return {
        level: "Très élevé",
        color: "bg-red-500",
        protection: "Protection extrême",
      };
    } else {
      return {
        level: "Extrême",
        color: "bg-purple-500",
        protection: "Évitez le soleil",
      };
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput);
      setSearchInput("");
      setSearchSuggestions([]);
    }
  };

  const selectRecentLocation = (loc) => {
    setLocation(loc);
  };

  const tempChartData = {
    labels: forecastData?.map((day) => day.dayName) || [],
    datasets: [
      {
        label: "Température Max (°C)",
        data: forecastData?.map((day) => getMax(day.temps)) || [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Température Min (°C)",
        data: forecastData?.map((day) => getMin(day.temps)) || [],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const feelsLikeChartData = {
    labels: forecastData?.map((day) => day.dayName) || [],
    datasets: [
      {
        label: "Ressenti Max (°C)",
        data: forecastData?.map((day) => getMax(day.feelsLike)) || [],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Ressenti Min (°C)",
        data: forecastData?.map((day) => getMin(day.feelsLike)) || [],
        borderColor: "#F97316",
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const precipitationChartData = {
    labels:
      hourlyData?.map((hour) =>
        hour.time.toLocaleTimeString("fr-FR", { hour: "2-digit" })
      ) || [],
    datasets: [
      {
        label: "Chance de pluie (%)",
        data: hourlyData?.map((hour) => hour.pop) || [],
        borderColor: "#60A5FA",
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Précipitations (mm)",
        data: hourlyData?.map((hour) => hour.rain) || [],
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Neige (cm)",
        data: hourlyData?.map((hour) => hour.snow) || [],
        borderColor: "#BFDBFE",
        backgroundColor: "rgba(191, 219, 254, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const windChartData = {
    labels: forecastData?.map((day) => day.dayName) || [],
    datasets: [
      {
        label: "Vitesse du vent (km/h)",
        data: forecastData?.map((day) => getAverage(day.windSpeeds)) || [],
        backgroundColor: "#10B981",
      },
      {
        label: "Rafales (km/h)",
        data:
          forecastData?.map((day) => getAverage(day.windSpeeds) * 1.3) || [],
        backgroundColor: "#059669",
      },
    ],
  };

  const humidityChartData = {
    labels:
      hourlyData?.map((hour) =>
        hour.time.toLocaleTimeString("fr-FR", { hour: "2-digit" })
      ) || [],
    datasets: [
      {
        label: "Humidité (%)",
        data: hourlyData?.map((hour) => hour.humidity) || [],
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
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        titleColor: darkMode ? "#E5E7EB" : "#111827",
        bodyColor: darkMode ? "#D1D5DB" : "#4B5563",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
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

  // Classes CSS for dark mode
  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-800";
  const cardClass = darkMode ? "bg-gray-800" : "bg-white";
  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const dividerClass = darkMode ? "border-gray-700" : "border-gray-200";
  const inputClass = darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-gray-800 border-gray-300";
  const buttonClass = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";

  // Modifier la fonction handleCoordinateSearch
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
        setLocation(cityName);
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

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const weatherPromises = moroccoCities.map(async (city) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}&lang=fr`
          );
          const data = await response.json();
          return {
            ...city,
            weather: data,
          };
        });

        const results = await Promise.all(weatherPromises);
        setMapData(results);
        setMapLoading(false);
      } catch (error) {
        console.error("Error fetching map data:", error);
        setMapLoading(false);
      }
    };

    fetchMapData();
  }, []);

  useEffect(() => {
    // Ajouter les styles personnalisés
    const styleSheet = document.createElement("style");
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (loading)
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${bgClass} ${textClass}`}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Chargement des données météo...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${bgClass} ${textClass}`}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="mb-4">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded-lg ${buttonClass} text-white`}
            >
              Réessayer
            </button>
            <button
              onClick={() => setLocation("El jadia")}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${textClass}`}
            >
              Retour à El jadida
            </button>
          </div>
        </div>
      </div>
    );

  if (!weatherData || !forecastData || !hourlyData) return null;

  return (
    <div className={`min-h-screen ${bgClass} pb-12`}>
      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${cardClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}
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

      {/* Header */}
      <header
        className={`sticky top-0 z-10 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <h1 className={`text-2xl font-bold ${textClass}`}>
              Dashboard Météo
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
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
                  placeholder="Rechercher une ville..."
                  className={`w-full md:w-64 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                          setLocation(`${city.name}, ${city.country}`);
                          setSearchInput("");
                          setSearchSuggestions([]);
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
                className={`px-4 py-2 rounded-lg ${buttonClass} text-white`}
                onClick={handleSearch}
              >
                Rechercher
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center"
                onClick={detectLocationTemp}
              >
                <FiNavigation className="mr-2" />
                Détecter
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={latitudeInput}
                onChange={(e) => setLatitudeInput(e.target.value)}
                placeholder="Latitude"
                min="-90"
                max="90"
                step="0.000001"
                className={`w-24 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <input
                type="number"
                value={longitudeInput}
                onChange={(e) => setLongitudeInput(e.target.value)}
                placeholder="Longitude"
                min="-180"
                max="180"
                step="0.000001"
                className={`w-24 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${buttonClass} text-white`}
                onClick={handleCoordinateSearch}
              >
                <FiNavigation className="inline mr-1" />
                Coordonnées
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* Geolocation error message */}
        {geolocationError && (
          <div
            className={`my-4 p-3 rounded-lg ${
              darkMode
                ? "bg-yellow-900 text-yellow-200"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <p className="text-sm">{geolocationError}</p>
          </div>
        )}

        {/* Current Location and Date */}
        <div className="my-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-3xl font-bold ${textClass} mb-1`}>
                {weatherData.city}, {weatherData.country}
              </h2>
              <p className={`text-lg ${secondaryTextClass}`}>
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex space-x-2">
              {recentLocations.length > 0 && (
                <div className="hidden md:flex space-x-2">
                  {recentLocations.slice(0, 3).map((loc, index) => (
                    <button
                      key={index}
                      onClick={() => selectRecentLocation(loc)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      } ${textClass}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Weather Section */}
        <section className="mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${cardClass}`}>
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-semibold ${textClass} mb-1`}>
                      Conditions Actuelles
                    </h3>
                    <p className={`text-sm ${secondaryTextClass}`}>
                      Mis à jour: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getWeatherIconFromCode(weatherData.icon, 48)}
                    <span className="ml-2 capitalize text-lg">
                      {weatherData.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className={`text-6xl font-bold ${textClass}`}>
                    {weatherData.temperature}°C
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`text-center ${secondaryTextClass}`}>
                      <div className="text-sm">Ressenti</div>
                      <div className="text-xl font-semibold">
                        {weatherData.feelsLike}°C
                      </div>
                    </div>
                    <div className={`text-center ${secondaryTextClass}`}>
                      <div className="text-sm">Humidité</div>
                      <div className="text-xl font-semibold">
                        {weatherData.humidity}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:ml-8 mt-6 md:mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg flex items-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    {getWindDirectionIcon(weatherData.windDeg)}
                    <div className="ml-3">
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Vent
                      </div>
                      <div className={`text-lg font-semibold ${textClass}`}>
                        {weatherData.windSpeed} km/h
                      </div>
                      <div className="text-xs">{weatherData.windDirection}</div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg flex items-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <WiBarometer size={28} color="#10B981" />
                    <div className="ml-3">
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Pression
                      </div>
                      <div className={`text-lg font-semibold ${textClass}`}>
                        {weatherData.pressure} hPa
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg flex items-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <WiUmbrella size={28} color="#3B82F6" />
                    <div className="ml-3">
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Précipitations
                      </div>
                      <div className={`text-lg font-semibold ${textClass}`}>
                        {weatherData.rain} mm
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg flex items-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <WiCloudy size={28} color="#9CA3AF" />
                    <div className="ml-3">
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Nébulosité
                      </div>
                      <div className={`text-lg font-semibold ${textClass}`}>
                        {weatherData.clouds}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-blue-900" : "bg-blue-50"
                  }`}
                >
                  <WiSunrise size={32} color="#F59E0B" />
                  <div className="ml-3">
                    <div className={`text-sm ${secondaryTextClass}`}>Lever</div>
                    <div className={`font-medium ${textClass}`}>
                      {weatherData.sunrise.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-orange-900" : "bg-orange-50"
                  }`}
                >
                  <WiSunset size={32} color="#F59E0B" />
                  <div className="ml-3">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Coucher
                    </div>
                    <div className={`font-medium ${textClass}`}>
                      {weatherData.sunset.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-purple-900" : "bg-purple-50"
                  }`}
                >
                  <WiHumidity size={32} color="#8B5CF6" />
                  <div className="ml-3">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Point de rosée
                    </div>
                    <div className={`font-medium ${textClass}`}>
                      {weatherData.dewPoint}°C
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-green-900" : "bg-green-50"
                  }`}
                >
                  <WiStrongWind size={32} color="#10B981" />
                  <div className="ml-3">
                    <div className={`text-sm ${secondaryTextClass}`}>
                      Rafales
                    </div>
                    <div className={`font-medium ${textClass}`}>
                      {weatherData.windGust} km/h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forecast Sections */}
        <section className="mb-8">
          {/* Première ligne - Prévisions 6 jours et Détails du jour */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Prévisions 6 jours */}
            <div className={`p-6 rounded-xl shadow ${cardClass}`}>
              <h3 className={`text-xl font-semibold ${textClass} mb-4`}>
                Prévisions 6 jours
              </h3>
              <div className="space-y-3">
                {forecastData.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Détails du jour sélectionné */}
            <div className={`p-6 rounded-xl shadow ${cardClass}`}>
              <h3 className={`text-xl font-semibold ${textClass} mb-4`}>
                Détails pour {selectedDay?.dayName}
              </h3>
              {selectedDay && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    {getWeatherIcon(
                      getMostFrequent(selectedDay.conditions),
                      64
                    )}
                    <p className="mt-2 capitalize text-lg">
                      {getMostFrequent(selectedDay.conditions)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Température Max
                      </div>
                      <div className={`text-xl font-semibold ${textClass}`}>
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
                      <div className={`text-xl font-semibold ${textClass}`}>
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
                      <div className={`text-xl font-semibold ${textClass}`}>
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
                      <div className={`text-xl font-semibold ${textClass}`}>
                        {getAverage(selectedDay.windSpeeds)} km/h
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Pluie totale
                      </div>
                      <div className={`text-xl font-semibold ${textClass}`}>
                        {getSum(selectedDay.rain)} mm
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className={`text-sm ${secondaryTextClass}`}>
                        Neige totale
                      </div>
                      <div className={`text-xl font-semibold ${textClass}`}>
                        {getSum(selectedDay.snow)} cm
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Deuxième ligne - Prévisions horaires détaillées */}
          <div className={`p-6 rounded-xl shadow-lg ${cardClass}`}>
            <h3 className={`text-xl font-semibold ${textClass} mb-4`}>
              Prévisions horaires détaillées
            </h3>

            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {hourlyData.map((hour, index) => (
                  <motion.div
                    key={index}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    className={`flex flex-col items-center p-4 rounded-2xl min-w-[160px] transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-white hover:bg-gray-50"
                    } border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    {/* Heure */}
                    <div
                      className={`text-sm font-medium ${secondaryTextClass} mb-1`}
                    >
                      {hour.time.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Jour */}
                    <div className="text-xs text-gray-500 mb-2">
                      {hour.time.toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </div>

                    {/* Icone météo */}
                    <div className="my-2">
                      {getWeatherIconFromCode(hour.icon, 40)}
                    </div>

                    {/* Température */}
                    <div className={`text-lg font-bold ${textClass} mb-1`}>
                      {hour.temp}°C
                    </div>

                    {/* Description */}
                    <div
                      className={`text-xs ${secondaryTextClass} text-center mb-2`}
                    >
                      {hour.description}
                    </div>

                    {/* Détails : Vent, Humidité, Précipitations, Pression */}
                    <div className="flex flex-col items-center space-y-1 w-full">
                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="flex items-center">
                          <WiStrongWind size={16} className="mr-1" />
                          Vent
                        </span>
                        <span className="font-medium">
                          {hour.windSpeed} km/h
                        </span>
                      </div>

                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="flex items-center">
                          <WiHumidity size={16} className="mr-1" />
                          Humidité
                        </span>
                        <span className="font-medium">{hour.humidity}%</span>
                      </div>

                      {hour.pop > 0 && (
                        <div className="flex items-center justify-between w-full text-xs">
                          <span className="flex items-center">
                            <WiRaindrop size={16} className="mr-1" />
                            Précip.
                          </span>
                          <span className="font-medium text-blue-500">
                            {hour.pop}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="flex items-center">
                          <WiBarometer size={16} className="mr-1" />
                          Pression
                        </span>
                        <span className="font-medium">{hour.pressure} hPa</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-8">
          <div className={`p-6 rounded-xl shadow ${cardClass}`}>
            <h3 className={`text-xl font-semibold ${textClass} mb-4`}>
              Graphiques détaillés
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedChart("temperature")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedChart === "temperature"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Températures
              </button>
              <button
                onClick={() => setSelectedChart("feelsLike")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedChart === "feelsLike"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Température ressentie
              </button>
              <button
                onClick={() => setSelectedChart("precipitation")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedChart === "precipitation"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Précipitations
              </button>
              <button
                onClick={() => setSelectedChart("wind")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedChart === "wind"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Vent
              </button>
              <button
                onClick={() => setSelectedChart("humidity")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedChart === "humidity"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Humidité
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-80"
              >
                {selectedChart === "temperature" && (
                  <Line data={tempChartData} options={chartOptions} />
                )}
                {selectedChart === "feelsLike" && (
                  <Line data={feelsLikeChartData} options={chartOptions} />
                )}
                {selectedChart === "precipitation" && (
                  <Line data={precipitationChartData} options={chartOptions} />
                )}
                {selectedChart === "wind" && (
                  <Bar data={windChartData} options={chartOptions} />
                )}
                {selectedChart === "humidity" && (
                  <Line data={humidityChartData} options={chartOptions} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Additional Information */}
        <section>
          <div className={`p-6 rounded-xl shadow ${cardClass}`}>
            <h3 className={`text-xl font-semibold ${textClass} mb-6`}>
              Informations complémentaires
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Air Quality */}
              <div
                className={`p-5 rounded-xl ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-medium ${textClass}`}>
                    Qualité de l'air
                  </h4>
                  {airQuality && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        getAirQualityIndex(airQuality.main.aqi).text
                      } ${getAirQualityIndex(airQuality.main.aqi).color}`}
                    >
                      {getAirQualityIndex(airQuality.main.aqi).level}
                    </span>
                  )}
                </div>

                {airQuality ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-4xl font-bold ${textClass}`}>
                        {airQuality.main.aqi * 25}/100
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${secondaryTextClass}`}>
                          Indice AQI
                        </div>
                        <div className="text-xs">
                          {airQuality.main.aqi === 1 && "Excellent"}
                          {airQuality.main.aqi === 2 && "Bon"}
                          {airQuality.main.aqi === 3 && "Modéré"}
                          {airQuality.main.aqi === 4 && "Mauvais"}
                          {airQuality.main.aqi === 5 && "Très mauvais"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          PM2.5
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {airQuality.components.pm2_5} µg/m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          PM10
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {airQuality.components.pm10} µg/m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          NO2
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {airQuality.components.no2} µg/m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          O3
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {airQuality.components.o3} µg/m³
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`text-sm ${secondaryTextClass}`}>
                    Données de qualité de l'air non disponibles
                  </div>
                )}
              </div>

              {/* UV Index */}
              <div
                className={`p-5 rounded-xl ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h4 className={`font-medium ${textClass} mb-4`}>Indice UV</h4>
                {uvIndex ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-4xl font-bold ${textClass}`}>
                        {uvIndex.value.toFixed(1)}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${secondaryTextClass}`}>
                          {getUvIndexLevel(uvIndex.value).level}
                        </div>
                        <div className="text-xs">
                          {getUvIndexLevel(uvIndex.value).protection}
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>0-2</span>
                        <span>3-5</span>
                        <span>6-7</span>
                        <span>8-10</span>
                        <span>11+</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-600">
                        <div
                          className={`h-2.5 rounded-full ${
                            getUvIndexLevel(uvIndex.value).color
                          }`}
                          style={{
                            width: `${Math.min(
                              (uvIndex.value / 11) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className={`text-sm ${secondaryTextClass}`}>
                      L'indice UV atteint son maximum à 13h
                    </div>
                  </>
                ) : (
                  <div className={`text-sm ${secondaryTextClass}`}>
                    Données UV non disponibles
                  </div>
                )}
              </div>

              {/* Pollen Count */}
              <div
                className={`p-5 rounded-xl ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h4 className={`font-medium ${textClass} mb-4`}>
                  Risque allergique
                </h4>
                {pollenData ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-4xl font-bold ${textClass}`}>
                        {pollenData.overall + 1}/5
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${secondaryTextClass}`}>
                          Risque global
                        </div>
                        <div className="text-xs">
                          {getPollenLevel(pollenData.overall).level}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          Arbres
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            getPollenLevel(pollenData.tree).color
                          } text-white`}
                        >
                          {getPollenLevel(pollenData.tree).level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          Graminées
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            getPollenLevel(pollenData.grass).color
                          } text-white`}
                        >
                          {getPollenLevel(pollenData.grass).level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${secondaryTextClass}`}>
                          Mauvaises herbes
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            getPollenLevel(pollenData.weed).color
                          } text-white`}
                        >
                          {getPollenLevel(pollenData.weed).level}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`text-sm ${secondaryTextClass}`}>
                    Données pollens non disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Carte météo du Maroc */}
        <section className="mb-8">
          <div className={`p-6 rounded-xl shadow ${cardClass}`}>
            <h3 className={`text-xl font-semibold ${textClass} mb-4`}>
              Carte météo du Maroc
            </h3>
            <div className="w-full flex justify-center">
              <MoroccoWeatherMap mapData={mapData} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className={`text-sm ${secondaryTextClass}`}>
            <p>
              Données météo fournies par OpenWeatherMap - Dernière mise à jour:{" "}
              {new Date().toLocaleString()}
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} Dashboard Météo - Tous droits
              réservés
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
