import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiCloudy,
  WiDayCloudyHigh,
} from "weather-icons-react";
import { renderToString } from "react-dom/server";
import {
  FaMapMarkerAlt,
  FaTemperatureHigh,
  FaTemperatureLow,
  FaThermometerHalf,
} from "react-icons/fa";

const API_KEY = "6e601e5bf166b100420a3cf427368540";

// Configuration de l'icône de localisation bleue
const LocationIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Liste réduite des principales villes marocaines pour éviter les surcharges d'API
const moroccoCities = [
  { city: "Agadir", lat: 30.4278, lon: -9.5981 },
  { city: "Agdz", lat: 30.7, lon: -6.5 },
  { city: "Aghbala", lat: 32.5, lon: -6.0 },
  { city: "Aguelmous", lat: 32.0, lon: -5.5 },
  { city: "Ahfir", lat: 34.9, lon: -2.1 },
  { city: "Aïn Harrouda", lat: 33.6167, lon: -7.5 },
  { city: "Aïn Leuh", lat: 33.0, lon: -5.0 },
  { city: "Aït Baha", lat: 30.0, lon: -9.0 },
  { city: "Aït Daoud", lat: 31.25, lon: -9.0 },
  { city: "Aït Ourir", lat: 31.5667, lon: -7.7167 },
  { city: "Ajdir", lat: 35.0, lon: -3.5 },
  { city: "Al Aaroui", lat: 35.0, lon: -3.0 },
  { city: "Al Hoceïma", lat: 35.2517, lon: -3.9372 },
  { city: "Alnif", lat: 31.0, lon: -5.0 },
  { city: "Amizmiz", lat: 31.2, lon: -8.2 },
  { city: "Aoulouz", lat: 30.5, lon: -8.5 },
  { city: "Aoufous", lat: 31.5, lon: -4.5 },
  { city: "Arfoud", lat: 31.5, lon: -4.2 },
  { city: "Assilah", lat: 35.4667, lon: -6.0333 },
  { city: "Azemmour", lat: 33.2833, lon: -8.34 },
  { city: "Azilal", lat: 31.9616, lon: -6.5718 },
  { city: "Azrou", lat: 33.436, lon: -5.221 },
  { city: "Ben Guerir", lat: 32.25, lon: -7.95 },
  { city: "Ben Taïeb", lat: 34.0, lon: -3.0 },
  { city: "Beni Ansar", lat: 35.0, lon: -2.9 },
  { city: "Beni Bouayach", lat: 35.0, lon: -3.5 },
  { city: "Beni Drar", lat: 34.0, lon: -2.0 },
  { city: "Béni Mellal", lat: 32.3373, lon: -6.3498 },
  { city: "Berkane", lat: 34.9167, lon: -2.3167 },
  { city: "Berrechid", lat: 33.2655, lon: -7.587 },
  { city: "Bni Hadifa", lat: 35.0, lon: -5.0 },
  { city: "Bni Tadjite", lat: 32.0, lon: -3.0 },
  { city: "Bouanane", lat: 32.0, lon: -2.0 },
  { city: "Boudnib", lat: 32.0, lon: -4.0 },
  { city: "Boujdour", lat: 26.1333, lon: -14.5 },
  { city: "Boulemane", lat: 33.3633, lon: -4.73 },
  { city: "Bouznika", lat: 33.789, lon: -7.1597 },
  { city: "Bouskoura", lat: 33.5, lon: -7.5 },
  { city: "Brahim", lat: 34.0, lon: -5.0 },
  { city: "Brikcha", lat: 34.0, lon: -5.0 },
  { city: "Bzou", lat: 32.0, lon: -5.5 },
  { city: "Casablanca", lat: 33.5731, lon: -7.5898 },
  { city: "Chefchaouen", lat: 35.1688, lon: -5.2636 },
  { city: "Chtouka Ait Baha", lat: 30.5, lon: -9.5 },
  { city: "Dcheira El Jihadia", lat: 30.4, lon: -9.6 },
  { city: "Dar Bouazza", lat: 33.6, lon: -7.2 },
  { city: "Driouch", lat: 34.0, lon: -3.5 },
  { city: "El Aioun", lat: 32.0, lon: -6.5 },
  { city: "El Hajeb", lat: 33.0, lon: -5.5 },
  { city: "El Hanchane", lat: 32.0, lon: -4.5 },
  { city: "El Jadida", lat: 33.254, lon: -8.5068 },
  { city: "El Kelaa des Sraghna", lat: 32.0, lon: -8.0 },
  { city: "El Menzel", lat: 34.0, lon: -5.5 },
  { city: "El Ouatia", lat: 27.0, lon: -13.5 },
  { city: "Errachidia", lat: 31.9314, lon: -4.424 },
  { city: "Erfoud", lat: 31.5, lon: -4.2 },
  { city: "Essaouira", lat: 31.5125, lon: -9.7699 },
  { city: "Fès", lat: 34.0331, lon: -5.0003 },
  { city: "Fkih Ben Salah", lat: 32.0, lon: -6.5 },
  { city: "Fnideq", lat: 35.849, lon: -5.358 },
  { city: "Goulmima", lat: 31.0, lon: -4.5 },
  { city: "Guercif", lat: 34.0, lon: -2.5 },
  { city: "Had Soualem", lat: 33.0, lon: -7.5 },
  { city: "Hajeb El Ayoun", lat: 33.0, lon: -5.5 },
  { city: "Haut Al Haouz", lat: 31.0, lon: -8.0 },
  { city: "Ifrane", lat: 33.5333, lon: -5.1167 },
  { city: "Imintanoute", lat: 31.0, lon: -8.5 },
  { city: "Imouzzer Kandar", lat: 34.0, lon: -5.5 },
  { city: "Imzouren", lat: 35.0, lon: -3.5 },
  { city: "Jbel Saghro", lat: 31.0, lon: -4.5 },
  { city: "Karia Ba Mohamed", lat: 34.0, lon: -5.5 },
  { city: "Kelaa des Sraghna", lat: 32.0, lon: -8.0 },
  { city: "Kénitra", lat: 34.261, lon: -6.5802 },
  { city: "Khemisset", lat: 33.8245, lon: -6.0663 },
  { city: "Khenifra", lat: 32.934, lon: -5.6619 },
  { city: "Khouribga", lat: 32.8822, lon: -6.9063 },
  { city: "Ksar es Souk", lat: 31.0, lon: -4.5 },
  { city: "Laâyoune", lat: 27.1536, lon: -13.2032 },
  { city: "Larache", lat: 35.1932, lon: -6.1557 },
  { city: "Lalla Mimouna", lat: 34.0, lon: -5.5 },
  { city: "Lalla Takerkoust", lat: 31.0, lon: -8.5 },
  { city: "Marrakech", lat: 31.6295, lon: -7.9811 },
  { city: "Martil", lat: 35.6167, lon: -5.2667 },
  { city: "M'diq", lat: 35.6833, lon: -5.3167 },
  { city: "Meknès", lat: 33.895, lon: -5.5547 },
  { city: "Midar", lat: 35.0, lon: -3.5 },
  { city: "Midelt", lat: 32.685, lon: -4.745 },
  { city: "Missour", lat: 33.0464, lon: -3.9894 },
  { city: "Moulay Abdallah", lat: 33.1947, lon: -8.5333 },
  { city: "Mohammédia", lat: 33.6861, lon: -7.3829 },
  { city: "Moulay Bousselham", lat: 34.0, lon: -6.5 },
  { city: "Moulay Idriss", lat: 34.0, lon: -5.5 },
  { city: "Nador", lat: 35.1688, lon: -2.9335 },
  { city: "Ouarzazate", lat: 30.9335, lon: -6.937 },
  { city: "Ouezzane", lat: 34.7989, lon: -5.5787 },
  { city: "Oujda", lat: 34.6814, lon: -1.9086 },
  { city: "Oulad Teima", lat: 30.0, lon: -8.5 },
  { city: "Ouazzane", lat: 34.0, lon: -5.5 },
  { city: "Rabat", lat: 34.0209, lon: -6.8417 },
  { city: "Rhamna", lat: 32.0, lon: -7.5 },
  { city: "Rissani", lat: 31.0, lon: -4.5 },
  { city: "Safi", lat: 32.2994, lon: -9.2372 },
  { city: "Salé", lat: 34.0333, lon: -6.8 },
  { city: "Sefrou", lat: 33.8333, lon: -4.8333 },
  { city: "Settat", lat: 33.001, lon: -7.6166 },
  { city: "Sidi Bennour", lat: 32.65, lon: -8.4333 },
  { city: "Sidi Ifni", lat: 29.3833, lon: -10.1667 },
  { city: "Sidi Kacem", lat: 34.2266, lon: -5.7073 },
  { city: "Sidi Slimane", lat: 34.2646, lon: -5.9252 },
  { city: "Sidi Yahya El Gharb", lat: 34.0, lon: -6.5 },
  { city: "Skhirat-Témara", lat: 33.9287, lon: -6.9063 },
  { city: "Smara", lat: 26.7333, lon: -11.6833 },
  { city: "Tafraout", lat: 29.7167, lon: -9.0 },
  { city: "Tanger", lat: 35.7595, lon: -5.8339 },
  { city: "Tan-Tan", lat: 28.438, lon: -11.103 },
  { city: "Taourirt", lat: 34.4136, lon: -2.8975 },
  { city: "Taroudant", lat: 30.4703, lon: -8.8769 },
  { city: "Taza", lat: 34.213, lon: -4.0083 },
  { city: "Témara", lat: 33.9287, lon: -6.9063 },
  { city: "Tétouan", lat: 35.5785, lon: -5.3684 },
  { city: "Tiflet", lat: 33.8947, lon: -6.3069 },
  { city: "Tinghir", lat: 31.5147, lon: -5.532 },
  { city: "Tiznit", lat: 29.6974, lon: -9.7323 },
  { city: "Youssoufia", lat: 32.25, lon: -8.5333 },
  { city: "Zagora", lat: 30.3167, lon: -5.8333 },
  { city: "Zaio", lat: 34.9333, lon: -2.7333 },
  { city: "Zemamra", lat: 32.6, lon: -8.7 },
];

const WindArrow = ({ deg, speed }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        style={{ transform: `rotate(${deg}deg)` }}
      >
        <polygon points="18,4 28,32 18,26 8,32" fill="#0a3557" />
      </svg>
      <span style={{ fontWeight: 700, color: "#0a3557", fontSize: 16 }}>
        {Math.round(speed * 3.6)} km/h
      </span>
    </div>
  );
};

const WeatherBadge = ({ temp, condition }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFEB3B",
        borderRadius: "50%",
        width: 48,
        height: 48,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        border: "2px solid #fff",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>
        {temp}°
      </div>
      <div style={{ marginTop: 2 }}>{getWeatherIcon(condition, 22)}</div>
    </div>
  );
};

const getWeatherIcon = (condition, size = 24) => {
  switch (condition) {
    case "Clear":
      return <WiDaySunny size={size} color="#F59E0B" />;
    case "Rain":
      return <WiRain size={size} color="#3B82F6" />;
    case "Snow":
      return <WiSnow size={size} color="#BFDBFE" />;
    case "Thunderstorm":
      return <WiThunderstorm size={size} color="#8B5CF6" />;
    case "Fog":
    case "Mist":
    case "Haze":
      return <WiFog size={size} color="#9CA3AF" />;
    case "Clouds":
      return <WiCloudy size={size} color="#6B7280" />;
    default:
      return <WiDayCloudyHigh size={size} color="#6B7280" />;
  }
};

const getUVLevel = (uv) => {
  if (uv === "-" || uv === undefined || uv === null)
    return {
      level: "Indisponible",
      color: "#bdbdbd",
      advice: "Pas de donnée UV",
    };
  if (uv <= 2)
    return { level: "Faible", color: "#4caf50", advice: "Protection minimale" };
  if (uv <= 5)
    return {
      level: "Modéré",
      color: "#ffeb3b",
      advice: "Protection recommandée",
    };
  if (uv <= 7)
    return {
      level: "Élevé",
      color: "#ff9800",
      advice: "Protection nécessaire",
    };
  if (uv <= 10)
    return {
      level: "Très élevé",
      color: "#f44336",
      advice: "Protection extrême",
    };
  return { level: "Extrême", color: "#6d28d9", advice: "Évitez le soleil" };
};

const UVBadge = ({ uv, city }) => {
  const [hovered, setHovered] = useState(false);
  const { level, color, advice } = getUVLevel(uv);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: color,
          color: uv <= 2 ? "#fff" : uv <= 5 ? "#222" : "#fff",
          borderRadius: 8,
          padding: "2px 12px",
          fontWeight: 700,
          fontSize: 18,
          minWidth: 48,
          textAlign: "center",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        UV {uv ?? "-"}
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            padding: 10,
            minWidth: 180,
            zIndex: 1000,
            color: "#222",
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{city}</div>
          <div>
            <b>UV :</b> {uv ?? "-"}
          </div>
          <div>
            <b>Niveau :</b> {level}
          </div>
          <div>
            <b>Conseil :</b> {advice}
          </div>
        </div>
      )}
    </div>
  );
};

const TempBadge = ({ temp, condition, city }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #FFD700 0%, #FF9800 100%)",
          borderRadius: "50%",
          width: 48,
          height: 48,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          border: "2px solid #fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: "#222",
            lineHeight: 1,
          }}
        >
          {temp}°
        </span>
        <span style={{ marginTop: 2 }}>{getWeatherIcon(condition, 20)}</span>
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 54,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            padding: 10,
            minWidth: 120,
            zIndex: 1000,
            color: "#222",
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700 }}>{city}</div>
          <div>{temp}°C</div>
        </div>
      )}
    </div>
  );
};

const WindBadge = ({ deg, speed, gust, city }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        style={{ transform: `rotate(${deg}deg)` }}
      >
        <polygon points="18,4 28,32 18,26 8,32" fill="#0a3557" />
      </svg>
      <span style={{ fontWeight: 700, color: "#0a3557", fontSize: 16 }}>
        {Math.round(speed * 3.6)}
      </span>
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            padding: 10,
            minWidth: 180,
            zIndex: 1000,
            color: "#222",
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{city}</div>
          <div>
            <b>Vent :</b> {Math.round(speed * 3.6)} km/h
          </div>
          <div>
            <b>Direction :</b> {deg}°
          </div>
          {gust !== undefined && gust !== null && (
            <div>
              <b>Rafale :</b> {Math.round(gust * 3.6)} km/h
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const createTempIcon = (temp, condition, city) => {
  const badge = document.createElement("div");
  badge.innerHTML = renderToString(
    <TempBadge temp={temp} condition={condition} city={city} />
  );
  return L.divIcon({
    html: badge.innerHTML,
    className: "weather-badge-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 41],
    popupAnchor: [0, -24],
  });
};

const createWindIcon = (deg, speed, gust, city) => {
  const badge = document.createElement("div");
  badge.innerHTML = renderToString(
    <WindBadge deg={deg} speed={speed} gust={gust} city={city} />
  );
  return L.divIcon({
    html: badge.innerHTML,
    className: "wind-badge-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 41],
    popupAnchor: [0, -24],
  });
};

const createUVIcon = (uv, city) => {
  const badge = document.createElement("div");
  badge.innerHTML = renderToString(<UVBadge uv={uv} city={city} />);
  return L.divIcon({
    html: badge.innerHTML,
    className: "uv-badge-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 41],
    popupAnchor: [0, -24],
  });
};

const getTodayMinMaxFromForecast = (forecastList) => {
  const today = new Date().getDate();
  const temps = forecastList
    .filter((item) => new Date(item.dt * 1000).getDate() === today)
    .map((item) => item.main.temp);
  if (temps.length === 0) return { min: "-", max: "-" };
  return {
    min: Math.round(Math.min(...temps)),
    max: Math.round(Math.max(...temps)),
  };
};

const MoroccoWeatherMap = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("forecast");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const centerPosition = [31.7917, -7.0926];

  useEffect(() => {
    // Obtenir la position actuelle
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lon: longitude,
          });
          // Récupérer l'adresse à partir des coordonnées
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            setLocationAddress({
              city:
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "Ville inconnue",
              street:
                data.address.road || data.address.pedestrian || "Rue inconnue",
            });
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de l'adresse:",
              error
            );
          }
          // Récupérer la météo pour la position actuelle
          try {
            const weatherResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}&lang=fr`
            );
            const weatherData = await weatherResponse.json();
            const uvResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
            );
            const uvData = await uvResponse.json();
            // Appel à l'API forecast pour min/max fiables
            const forecastResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}&lang=fr`
            );
            const forecastData = await forecastResponse.json();
            const minMax = getTodayMinMaxFromForecast(forecastData.list);
            setCurrentWeather({
              temp: Math.round(weatherData.main.temp),
              temp_min: minMax.min,
              temp_max: minMax.max,
              feels_like: Math.round(weatherData.main.feels_like),
              humidity: weatherData.main.humidity,
              pressure: weatherData.main.pressure,
              wind_speed: weatherData.wind.speed,
              wind_deg: weatherData.wind.deg,
              wind_gust: weatherData.wind.gust,
              description: weatherData.weather[0].description,
              condition: weatherData.weather[0].main,
              uv: uvData.value || 0,
            });
          } catch (error) {
            console.error("Erreur lors de la récupération de la météo:", error);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }

    const fetchWeatherData = async () => {
      try {
        const promises = moroccoCities.map(async (city) => {
          // Appel pour les données météo
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}&lang=fr`
          );
          const weatherData = await weatherResponse.json();

          // Appel pour les données UV
          const uvResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`
          );
          const uvData = await uvResponse.json();

          // Appel pour les prévisions afin d'obtenir min/max fiables
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}&lang=fr`
          );
          const forecastData = await forecastResponse.json();
          const minMax = getTodayMinMaxFromForecast(forecastData.list);

          if (weatherData.cod !== 200) {
            console.error(`Erreur pour ${city.city}:`, weatherData.message);
            return null;
          }

          // Arrondir toutes les températures
          const temp = Math.round(weatherData.main.temp);
          const feels_like = Math.round(weatherData.main.feels_like);

          return {
            ...city,
            weather: weatherData,
            temp,
            temp_min: minMax.min,
            temp_max: minMax.max,
            feels_like,
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            wind_speed: weatherData.wind.speed,
            wind_deg: weatherData.wind.deg,
            wind_gust: weatherData.wind.gust,
            description: weatherData.weather[0].description,
            condition: weatherData.weather[0].main,
            uv: uvData.value || 0,
          };
        });

        const results = await Promise.all(promises);
        setWeatherData(results.filter((result) => result !== null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">Chargement des données météo...</div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white relative">
      {/* Onglets menu - position fixed */}
      <div className="flex flex-row gap-2 p-2 bg-white border-b border-gray-200 z-10 sticky top-0">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedTab === "forecast"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setSelectedTab("forecast")}
        >
          <span role="img" aria-label="Température">
            ☀️
          </span>{" "}
          Température
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedTab === "wind"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setSelectedTab("wind")}
        >
          <span role="img" aria-label="Vent">
            🌀
          </span>{" "}
          Vent
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedTab === "uv"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setSelectedTab("uv")}
        >
          <span role="img" aria-label="UV">
            🌡️
          </span>{" "}
          Indice UV
        </button>
      </div>

      {/* Carte */}
      <div className="h-[calc(100%-56px)]">
        <MapContainer
          center={centerPosition}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          className="rounded-b-xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lon]}
              icon={LocationIcon}
            >
              <Popup>
                <div className="p-3 min-w-[220px] bg-white rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-blue-500 text-xl" />
                    <div className="font-bold text-lg text-gray-800">
                      {locationAddress?.city || "Position actuelle"}
                    </div>
                  </div>
                  {currentWeather && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        {getWeatherIcon(currentWeather.condition, 28)}
                        <span className="text-2xl font-bold text-gray-700">
                          {currentWeather.temp}°C
                        </span>
                      </div>
                      <div className="capitalize text-gray-600 mb-2">
                        {currentWeather.description}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaThermometerHalf className="text-orange-500" />
                          <span>Ressenti: {currentWeather.feels_like}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTemperatureLow className="text-blue-500" />
                          <span>Min: {currentWeather.temp_min}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTemperatureHigh className="text-red-500" />
                          <span>Max: {currentWeather.temp_max}°C</span>
                        </div>
                        <div>Humidité: {currentWeather.humidity}%</div>
                        <div>
                          Vent: {Math.round(currentWeather.wind_speed * 3.6)}{" "}
                          km/h
                        </div>
                        <div>Pression: {currentWeather.pressure} hPa</div>
                        <div>
                          UV: {currentWeather.uv.toFixed(1)} -{" "}
                          {getUVIndexDescription(currentWeather.uv)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {weatherData.map((city, index) => {
            if (!city.weather || !city.weather.main) return null;
            const weather = city.weather;
            const condition = weather.weather[0]?.main || "Clear";
            const temp = Math.round(weather.main.temp);
            const temp_min = Math.round(weather.main.temp_min);
            const temp_max = Math.round(weather.main.temp_max);
            const desc = weather.weather[0]?.description || "-";

            if (selectedTab === "forecast") {
              return (
                <Marker
                  key={index}
                  position={[city.lat, city.lon]}
                  icon={createTempIcon(temp, condition, city.city)}
                >
                  <Popup>
                    <div className="p-3 min-w-[200px] bg-white rounded-lg shadow-lg">
                      <div className="font-bold text-lg text-gray-800 mb-2">
                        {city.city}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {getWeatherIcon(condition, 28)}
                        <span className="text-2xl font-bold text-gray-700">
                          {temp}°C
                        </span>
                      </div>
                      <div className="capitalize text-gray-600 mb-3">
                        {desc}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaThermometerHalf className="text-orange-500" />
                          <span>Ressenti: {city.feels_like}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTemperatureLow className="text-blue-500" />
                          <span>Min: {temp_min}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTemperatureHigh className="text-red-500" />
                          <span>Max: {temp_max}°C</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            } else if (selectedTab === "wind") {
              return (
                <Marker
                  key={index}
                  position={[city.lat, city.lon]}
                  icon={createWindIcon(
                    weather.wind?.deg,
                    weather.wind?.speed,
                    weather.wind?.gust,
                    city.city
                  )}
                >
                  <Popup>
                    <div className="p-2 min-w-[180px]">
                      <div className="font-bold text-lg mb-1">{city.city}</div>
                      <div className="flex items-center mb-2">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 36 36"
                          style={{
                            transform: `rotate(${weather.wind?.deg || 0}deg)`,
                          }}
                        >
                          <polygon
                            points="18,4 28,32 18,26 8,32"
                            fill="#0a3557"
                          />
                        </svg>
                        <span className="ml-2 text-2xl font-bold">
                          {weather.wind?.speed
                            ? Math.round(weather.wind.speed * 3.6)
                            : "-"}
                          km/h
                        </span>
                      </div>
                      <div className="text-gray-700 mb-2">
                        Direction:{" "}
                        {weather.wind?.deg !== undefined
                          ? weather.wind.deg + "°"
                          : "-"}
                      </div>
                      <div className="text-sm">
                        Rafale:{" "}
                        {weather.wind?.gust
                          ? Math.round(weather.wind.gust * 3.6)
                          : "-"}
                        km/h
                      </div>
                      <div className="text-sm">
                        Humidité: {weather.main?.humidity || "-"}
                      </div>
                      <div className="text-sm">
                        Pression: {weather.main?.pressure || "-"} hPa
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            } else if (selectedTab === "uv") {
              return (
                <Marker
                  key={index}
                  position={[city.lat, city.lon]}
                  icon={createUVIcon(city.uv, city.city)}
                >
                  <Popup>
                    <div className="p-2 min-w-[180px]">
                      <div className="font-bold text-lg mb-1">{city.city}</div>
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold">
                          UV {city.uv.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-gray-700 mb-2">
                        {getUVIndexDescription(city.uv)}
                      </div>
                      <div className="text-sm">
                        {getUVProtectionTips(city.uv)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      <style jsx global>{`
        .weather-badge-icon,
        .wind-badge-icon,
        .uv-badge-icon {
          background: none !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 8px !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
};

// Helper functions
const getWindDirection = (deg) => {
  if (deg === undefined) return "N/A";
  if (deg >= 337.5 || deg < 22.5) return "Nord";
  if (deg >= 22.5 && deg < 67.5) return "Nord-Est";
  if (deg >= 67.5 && deg < 112.5) return "Est";
  if (deg >= 112.5 && deg < 157.5) return "Sud-Est";
  if (deg >= 157.5 && deg < 202.5) return "Sud";
  if (deg >= 202.5 && deg < 247.5) return "Sud-Ouest";
  if (deg >= 247.5 && deg < 292.5) return "Ouest";
  if (deg >= 292.5 && deg < 337.5) return "Nord-Ouest";
  return "N/A";
};

const getUVIndexDescription = (uv) => {
  if (uv === undefined || uv === null) return "Données non disponibles";
  if (uv >= 0 && uv <= 2) return "Faible - Protection minimale requise";
  if (uv > 2 && uv <= 5) return "Modéré - Protection recommandée";
  if (uv > 5 && uv <= 7) return "Élevé - Protection nécessaire";
  if (uv > 7 && uv <= 10) return "Très élevé - Protection extra nécessaire";
  if (uv > 10) return "Extrême - Protection absolument nécessaire";
  return "N/A";
};

const getUVProtectionTips = (uv) => {
  if (uv === undefined || uv === null) return "";
  if (uv <= 2) return "Lunettes de soleil par jour ensoleillé.";
  if (uv <= 5)
    return "Crème solaire SPF 15+, chapeau, ombre aux heures chaudes.";
  if (uv <= 7) return "SPF 30+, t-shirt, ombre entre 11h et 16h.";
  if (uv <= 10) return "SPF 50+, éviter le soleil entre 11h et 16h.";
  return "SPF 50+, vêtements couvrants, éviter toute exposition au soleil.";
};

export default MoroccoWeatherMap;
