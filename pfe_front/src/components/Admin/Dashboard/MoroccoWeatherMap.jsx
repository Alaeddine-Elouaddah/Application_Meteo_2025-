import React, { useState, useRef, useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiStrongWind,
  WiHumidity,
  WiBarometer,
  WiSunrise,
  WiSunset,
} from "weather-icons-react";

// City coordinates with altitude data
const cityPositions = [
  { name: "Casablanca", x: 220, y: 520, alt: 50 },
  { name: "Rabat", x: 250, y: 480, alt: 75 },
  { name: "Marrakech", x: 260, y: 650, alt: 450 },
  { name: "Fès", x: 400, y: 420, alt: 410 },
  { name: "Tanger", x: 180, y: 250, alt: 80 },
  { name: "Agadir", x: 180, y: 800, alt: 23 },
  { name: "Meknès", x: 370, y: 470, alt: 560 },
  { name: "Oujda", x: 700, y: 350, alt: 470 },
  { name: "Kénitra", x: 220, y: 430, alt: 15 },
  { name: "Tétouan", x: 210, y: 180, alt: 90 },
  { name: "El Jadida", x: 180, y: 600, alt: 20 },
  { name: "Nador", x: 650, y: 300, alt: 42 },
  { name: "Settat", x: 250, y: 570, alt: 370 },
  { name: "Khouribga", x: 320, y: 570, alt: 786 },
  { name: "Béni Mellal", x: 400, y: 600, alt: 620 },
];

// Color palette
const colors = {
  background: "#f5f9ff",
  border: "#d4e3f7",
  text: "#1a3e72",
  highlight: "#3a6cb3",
  clear: "#f7d56a",
  rain: "#5a9bd5",
  clouds: "#a7b8d1",
  thunderstorm: "#8a6de8",
  snow: "#b8e1ff",
  fog: "#c4cad4",
};

function getWeatherIcon(condition, size = 36) {
  switch (condition) {
    case "clear":
      return <WiDaySunny size={size} color={colors.clear} />;
    case "rain":
      return <WiRain size={size} color={colors.rain} />;
    case "clouds":
      return <WiCloudy size={size} color={colors.clouds} />;
    case "thunderstorm":
      return <WiThunderstorm size={size} color={colors.thunderstorm} />;
    case "snow":
      return <WiSnow size={size} color={colors.snow} />;
    case "fog":
    case "mist":
    case "haze":
      return <WiFog size={size} color={colors.fog} />;
    default:
      return <WiCloudy size={size} color={colors.clouds} />;
  }
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round((degrees % 360) / 45);
  return directions[index % 8];
}

function formatTime(timestamp, timezone) {
  return new Date((timestamp + timezone) * 1000)
    .toUTCString()
    .match(/(\d{2}:\d{2})/)[0];
}

const DetailItem = ({ icon, title, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(240, 245, 255, 0.6)",
      padding: "8px",
      borderRadius: "8px",
    }}
  >
    <div>{icon}</div>
    <div>
      <div style={{ fontSize: "0.8rem", color: "#666" }}>{title}</div>
      <div style={{ fontWeight: "600" }}>{value}</div>
    </div>
  </div>
);

const MoroccoWeatherMap = ({ mapData }) => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapSize, setMapSize] = useState({ width: 800, height: 900 });
  const mapRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        const width = Math.min(800, mapRef.current.offsetWidth);
        const height = (width * 9) / 8;
        setMapSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  function latLonToXY(lat, lon) {
    const minLat = 27.6,
      maxLat = 35.9,
      minLon = -13.5,
      maxLon = -1.0;
    const x = ((lon - minLon) / (maxLon - minLon)) * mapSize.width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapSize.height;
    return { x, y };
  }

  function getCityPosition(city) {
    const scaleX = mapSize.width / 800;
    const scaleY = mapSize.height / 900;
    return {
      x: city.x * scaleX,
      y: city.y * scaleY,
    };
  }

  // Simplified Morocco SVG map
  const MoroccoSVG = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M150,800 L180,780 L200,750 L220,720 L240,700 L260,680 L280,650 L300,620 L320,600 L340,580 L360,550 L380,520 L400,500 L420,480 L440,450 L460,420 L480,400 L500,380 L520,350 L540,320 L560,300 L580,280 L600,250 L620,220 L640,200 L660,180 L680,150 L700,120 L720,100 L740,80 L760,60 L780,40 L800,20 L780,40 L760,60 L740,80 L720,100 L700,120 L680,150 L660,180 L640,200 L620,220 L600,250 L580,280 L560,300 L540,320 L520,350 L500,380 L480,400 L460,420 L440,450 L420,480 L400,500 L380,520 L360,550 L340,580 L320,600 L300,620 L280,650 L260,680 L240,700 L220,720 L200,750 L180,780 L150,800 Z"
        fill="#f0f5ff"
        stroke="#3a6cb3"
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <div
      style={{
        maxWidth: "100%",
        padding: "20px",
        backgroundColor: colors.background,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        ref={mapRef}
        style={{
          position: "relative",
          width: "100%",
          height: mapSize.height,
          maxWidth: mapSize.width,
          margin: "0 auto",
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f0f5ff",
        }}
      >
        <MoroccoSVG />

        {/* Header */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "0",
            right: "0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: colors.text,
              background: "rgba(255,255,255,0.9)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "1.4rem",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            🇲🇦 Météo Maroc - Temps réel
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              background: "rgba(255,255,255,0.9)",
              padding: "6px 12px",
              borderRadius: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {["clear", "clouds", "rain", "thunderstorm"].map((condition) => (
              <div
                key={condition}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                {getWeatherIcon(condition, 20)}
                <span style={{ marginLeft: "4px" }}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User position */}
        {userPos && (
          <div
            style={{
              position: "absolute",
              left: latLonToXY(userPos.lat, userPos.lon).x,
              top: latLonToXY(userPos.lat, userPos.lon).y,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: colors.highlight,
              border: `3px solid white`,
              boxShadow: `0 0 0 2px ${colors.highlight}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setSelectedCity("Votre position")}
            title="Votre position"
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
        )}

        {/* Cities */}
        {cityPositions.map((city) => {
          const data = mapData?.find((c) => c.name === city.name);
          if (!data || !data.weather || !data.weather.weather) return null;

          const w = data.weather;
          const condition = w.weather[0].main.toLowerCase();
          const temp = Math.round(w.main.temp);
          const { x, y } = getCityPosition(city);

          return (
            <div
              key={city.name}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                zIndex: 3,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.2s ease",
                filter:
                  selectedCity === city.name
                    ? "drop-shadow(0 0 8px rgba(58, 108, 179, 0.6))"
                    : "none",
              }}
              onClick={() => setSelectedCity(city.name)}
              onMouseEnter={() => setSelectedCity(city.name)}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                {getWeatherIcon(condition, 32)}
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  marginTop: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: colors.text,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                {temp}°
              </div>
            </div>
          );
        })}

        {/* Weather details panel */}
        {selectedCity &&
          (() => {
            const cityData =
              cityPositions.find((c) => c.name === selectedCity) || {};
            const data = mapData?.find((c) => c.name === selectedCity);

            if (!data) return null;

            const w = data.weather;
            const condition = w.weather[0].main.toLowerCase();
            const sunrise = formatTime(w.sys.sunrise, w.timezone);
            const sunset = formatTime(w.sys.sunset, w.timezone);

            return (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "90%",
                  maxWidth: "600px",
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 20,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: colors.text,
                      fontSize: "1.5rem",
                    }}
                  >
                    {selectedCity}{" "}
                    <span style={{ fontSize: "1rem", color: colors.highlight }}>
                      ({cityData.alt}m)
                    </span>
                  </h3>
                  <button
                    onClick={() => setSelectedCity(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      color: colors.text,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div style={{ fontSize: "3rem" }}>
                      {getWeatherIcon(condition, 64)}
                    </div>
                    <div>
                      <div style={{ fontSize: "2rem", fontWeight: "600" }}>
                        {Math.round(w.main.temp)}°C
                      </div>
                      <div style={{ color: colors.highlight }}>
                        {w.weather[0].description.charAt(0).toUpperCase() +
                          w.weather[0].description.slice(1)}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        Ressenti {Math.round(w.main.feels_like)}°C
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <DetailItem
                      icon={<WiHumidity size={24} color={colors.highlight} />}
                      title="Humidité"
                      value={`${w.main.humidity}%`}
                    />
                    <DetailItem
                      icon={<WiBarometer size={24} color={colors.highlight} />}
                      title="Pression"
                      value={`${w.main.pressure} hPa`}
                    />
                    <DetailItem
                      icon={<WiStrongWind size={24} color={colors.highlight} />}
                      title="Vent"
                      value={`${Math.round(
                        w.wind.speed * 3.6
                      )} km/h ${getWindDirection(w.wind.deg)}`}
                    />
                    <DetailItem
                      icon={<WiSunrise size={24} color={colors.highlight} />}
                      title="Lever"
                      value={sunrise}
                    />
                    <DetailItem
                      icon={<WiSunset size={24} color={colors.highlight} />}
                      title="Coucher"
                      value={sunset}
                    />
                    <DetailItem
                      icon={<span style={{ fontSize: "1rem" }}>🌡️</span>}
                      title="Min/Max"
                      value={`${Math.round(w.main.temp_min)}°/${Math.round(
                        w.main.temp_max
                      )}°`}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default MoroccoWeatherMap;
