import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSave, FiRefreshCw } from "react-icons/fi";

const defaultParams = {
  language: "fr",
  availableLanguages: ["fr", "en", "ar"],
  translations: {
    fr: {
      alerts: {
        temperature: "Température",
        humidity: "Humidité",
        wind: "Vent",
        pressure: "Pression",
        rain: "Pluie",
        thresholds: {
          cold: "Froid",
          hot: "Chaud",
          dry: "Sec",
          humid: "Humide",
          light: "Léger",
          moderate: "Modéré",
          strong: "Fort",
          low: "Basse",
          high: "Haute",
          heavy: "Forte",
        },
      },
    },
    en: {
      alerts: {
        temperature: "Temperature",
        humidity: "Humidity",
        wind: "Wind",
        pressure: "Pressure",
        rain: "Rain",
        thresholds: {
          cold: "Cold",
          hot: "Hot",
          dry: "Dry",
          humid: "Humid",
          light: "Light",
          moderate: "Moderate",
          strong: "Strong",
          low: "Low",
          high: "High",
          heavy: "Heavy",
        },
      },
    },
    ar: {
      alerts: {
        temperature: "درجة الحرارة",
        humidity: "الرطوبة",
        wind: "الرياح",
        pressure: "الضغط",
        rain: "المطر",
        thresholds: {
          cold: "بارد",
          hot: "حار",
          dry: "جاف",
          humid: "رطب",
          light: "خفيف",
          moderate: "معتدل",
          strong: "قوي",
          low: "منخفض",
          high: "مرتفع",
          heavy: "غزير",
        },
      },
    },
  },
};

const Params = ({ darkMode }) => {
  const [params, setParams] = useState(defaultParams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      setLoading(true);
      const response = await api.get("/params");
      if (response.data.data.params) {
        setParams(response.data.data.params);
      }
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des paramètres");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post("/params", params);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors de la sauvegarde des paramètres");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams(defaultParams);
  };

  const handleLanguageChange = (language) => {
    setParams((prev) => ({
      ...prev,
      language,
    }));
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Paramètres de Langue
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className={`flex items-center px-4 py-2 rounded-md ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <FiRefreshCw className="mr-2" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FiSave className="mr-2" />
            Enregistrer
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          Paramètres sauvegardés avec succès
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Langue de l'application
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sélectionner la langue
              </label>
              <select
                value={params.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`mt-1 block w-full rounded-md ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Params;
