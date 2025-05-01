import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const cities = [
  { name: "Casablanca", lat: 33.5731, lon: -7.5898 },
  { name: "Rabat", lat: 34.0209, lon: -6.8416 },
  { name: "Marrakech", lat: 31.6295, lon: -7.9811 },
  { name: "Fès", lat: 34.0331, lon: -5.0003 },
  { name: "Agadir", lat: 30.4278, lon: -9.5981 },
  { name: "Oujda", lat: 34.6829, lon: -1.909 },
  { name: "Tanger", lat: 35.7595, lon: -5.83395 },
];

const API_KEY = "6e601e5bf166b100420a3cf427368540";

const Users = () => {
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    const fetchWeather = async () => {
      const newWeatherData = {};
      for (const city of cities) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&lang=fr&appid=${API_KEY}`
          );
          newWeatherData[city.name] = response.data;
        } catch (error) {
          console.error("Erreur pour", city.name);
        }
      }
      setWeatherData(newWeatherData);
    };

    fetchWeather();
  }, []);

  const createIcon = (icon, temp) =>
    L.divIcon({
      className: "weather-icon",
      html: `
        <div style="text-align: center;">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:40px;height:40px;" />
          <div style="font-weight: bold; font-size: 16px; color: black;">${Math.round(
            temp
          )}°</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Météo Maroc</h2>
      <MapContainer
        center={[32, -6.5]}
        zoom={6}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {cities.map((city) => {
          const data = weatherData[city.name];
          if (!data) return null;

          const iconCode = data.weather[0].icon;
          const temp = data.main.temp;

          return (
            <Marker
              key={city.name}
              position={[city.lat, city.lon]}
              icon={createIcon(iconCode, temp)}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Users;
