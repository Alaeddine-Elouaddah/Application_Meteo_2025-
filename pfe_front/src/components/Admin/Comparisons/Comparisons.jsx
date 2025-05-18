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
} from "react-icons/fi";
import {
  WiDaySunny,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
} from "react-icons/wi";

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

const Comparisons = () => {
  const API_KEY = "6e601e5bf166b100420a3cf427368540";
  const [city, setCity] = useState("Agadir");
  const [forecastData, setForecastData] = useState(null);
  const [actualData, setActualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);

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
  };

  // Rechercher une ville
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() && searchSuggestions.length > 0) {
      setCity(searchSuggestions[0].name);
      setSearchInput("");
      setSearchSuggestions([]);
    }
  };

  // Récupérer les données météo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données de prévision
        const forecastResponse = await fetch(
          `http://localhost:8000/api/hourly/${city}`
        );
        if (!forecastResponse.ok) {
          throw new Error("Erreur de récupération des prévisions");
        }
        const forecastJson = await forecastResponse.json();
        setForecastData(forecastJson.data);

        // Récupérer les données actuelles
        const actualResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!actualResponse.ok) {
          throw new Error("Erreur de récupération des données actuelles");
        }
        const actualJson = await actualResponse.json();
        setActualData(actualJson.list);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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

  if (!forecastData || !actualData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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

  // Préparer les données pour les graphiques
  const forecastTimes = forecastData.map((item) => item.time);
  const forecastTemps = forecastData.map((item) => item.temp);
  const forecastHumidity = forecastData.map((item) => item.humidity);
  const forecastWind = forecastData.map((item) => item.wind_speed);
  const forecastPressure = forecastData.map((item) => item.pressure || 0);

  // Correspondre les données actuelles avec les prévisions
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

  // Calculer les différences
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

  // Calculer les pourcentages de précision
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

  // Configurations des graphiques
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
      },
      title: {
        display: true,
        text: "Comparaison des données météorologiques",
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
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Différences entre prévisions et réalité",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
          <WiDaySunny className="mr-2 text-yellow-500" size={36} />
          Tableau de bord de comparaison météorologique
        </h1>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row w-full gap-2"
          >
            <div className="relative flex-grow">
              <div className="flex items-center">
                <FiSearch className="absolute left-3 text-gray-400" />
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
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-300 max-h-60 overflow-auto">
                  {searchSuggestions.map((city, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={() => handleCitySelect(city)}
                    >
                      <FiMapPin className="mr-2 text-blue-500" />
                      {city.name}, {city.country}
                      {city.state && `, ${city.state}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <FiSearch className="mr-2" />
              Rechercher
            </button>
            <button
              type="button"
              onClick={detectLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            >
              <FiNavigation className="mr-2" />
              Ma position
            </button>
          </form>
        </div>

        {/* Affichage de la ville actuelle */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
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

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Comparaison de température */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <WiDaySunny className="mr-2 text-yellow-500" size={24} />
              Comparaison de température
            </h2>
            <div className="h-64 md:h-80">
              <Line data={tempChartData} options={options} />
            </div>
          </div>

          {/* Comparaison d'humidité */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <WiHumidity className="mr-2 text-blue-500" size={24} />
              Comparaison d'humidité
            </h2>
            <div className="h-64 md:h-80">
              <Line data={humidityChartData} options={options} />
            </div>
          </div>

          {/* Comparaison de vent */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <WiStrongWind className="mr-2 text-gray-500" size={24} />
              Comparaison de vitesse du vent
            </h2>
            <div className="h-64 md:h-80">
              <Line data={windChartData} options={options} />
            </div>
          </div>

          {/* Comparaison de pression */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <WiBarometer className="mr-2 text-purple-500" size={24} />
              Comparaison de pression atmosphérique
            </h2>
            <div className="h-64 md:h-80">
              <Line data={pressureChartData} options={options} />
            </div>
          </div>

          {/* Différences */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
              Différences de précision des prévisions
            </h2>
            <div className="h-64 md:h-80">
              <Bar data={differenceChartData} options={barOptions} />
            </div>
          </div>

          {/* Précision */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
              Pourcentage de précision des prévisions
            </h2>
            <div className="h-64 md:h-80">
              <Line data={accuracyChartData} options={options} />
            </div>
          </div>

          {/* Tableau de données */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2 overflow-x-auto">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
              Données détaillées de comparaison
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Heure
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Température
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Humidité
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Vent
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Pression
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Précision
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        {item.time}
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                      <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-blue-600">
                            {tempAccuracy[index]}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
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
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
              Résumé statistique
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 flex items-center">
                  <WiDaySunny className="mr-2" size={20} />
                  Température moyenne
                </h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {(
                    forecastTemps.reduce((a, b) => a + b, 0) /
                    forecastTemps.length
                  ).toFixed(1)}
                  °C
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  vs{" "}
                  {(
                    actualTemps.reduce((a, b) => a + b, 0) / actualTemps.length
                  ).toFixed(1)}
                  °C réel
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 flex items-center">
                  <WiHumidity className="mr-2" size={20} />
                  Humidité moyenne
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {(
                    forecastHumidity.reduce((a, b) => a + b, 0) /
                    forecastHumidity.length
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  vs{" "}
                  {(
                    actualHumidity.reduce((a, b) => a + b, 0) /
                    actualHumidity.length
                  ).toFixed(1)}
                  % réel
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800 flex items-center">
                  <WiStrongWind className="mr-2" size={20} />
                  Vent moyen
                </h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {(
                    forecastWind.reduce((a, b) => a + b, 0) /
                    forecastWind.length
                  ).toFixed(1)}
                  km/h
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  vs{" "}
                  {(
                    actualWind.reduce((a, b) => a + b, 0) / actualWind.length
                  ).toFixed(1)}
                  km/h réel
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 flex items-center">
                  <WiBarometer className="mr-2" size={20} />
                  Précision moyenne
                </h3>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {(
                    tempAccuracy.reduce((a, b) => a + parseFloat(b), 0) /
                    tempAccuracy.length
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Sur {tempAccuracy.length} mesures
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparisons;
