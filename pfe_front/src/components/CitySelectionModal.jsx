import React, { useState, useEffect } from "react";
import { FiNavigation } from "react-icons/fi";

const CitySelectionModal = ({ isOpen, onClose, onCitySelect, darkMode }) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const API_KEY = "6e601e5bf166b100420a3cf427368540";

  const detectLocation = () => {
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              const cityData = {
                name: data[0].name,
                country: data[0].country,
                coordinates: {
                  lat: latitude,
                  lon: longitude,
                },
              };
              onCitySelect(cityData);
            }
          } catch (error) {
            console.error("Erreur lors de la détection de la ville:", error);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setIsDetectingLocation(false);
        }
      );
    }
  };

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

  const handleCitySelect = (city) => {
    const cityData = {
      name: city.name,
      country: city.country,
      coordinates: {
        lat: city.lat,
        lon: city.lon,
      },
    };
    onCitySelect(cityData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Sélectionnez votre ville
        </h2>
        <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Pour une meilleure expérience, veuillez sélectionner votre ville de
          résidence.
        </p>

        <div className="mb-4">
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
              placeholder="Rechercher une ville..."
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    onClick={() => handleCitySelect(city)}
                  >
                    {city.name}, {city.country}
                    {city.state && `, ${city.state}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="relative flex-grow h-px bg-gray-300"></div>
          <span
            className={`px-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            ou
          </span>
          <div className="relative flex-grow h-px bg-gray-300"></div>
        </div>

        <button
          onClick={detectLocation}
          disabled={isDetectingLocation}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors`}
        >
          <FiNavigation className={isDetectingLocation ? "animate-spin" : ""} />
          {isDetectingLocation
            ? "Détection en cours..."
            : "Détecter ma position"}
        </button>
      </div>
    </div>
  );
};

export default CitySelectionModal;
