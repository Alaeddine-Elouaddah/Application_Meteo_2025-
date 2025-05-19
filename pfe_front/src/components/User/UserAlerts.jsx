import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiBell, FiCheck, FiX } from "react-icons/fi";

const translations = {
  fr: {
    title: "Mes Alertes Météo",
    noAlerts: "Aucune alerte configurée",
    configureAlerts:
      "Configurez vos alertes météo pour recevoir des notifications par email.",
    condition: "Condition",
    value: "Valeur",
    city: "Ville",
    frequency: "Fréquence",
    time: "Heure",
    status: "Statut",
    active: "Active",
    inactive: "Inactive",
    minThreshold: "Seuil minimum",
    maxThreshold: "Seuil maximum",
    above: "Supérieur à",
    below: "Inférieur à",
    equals: "Égal à",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    rain: "Pluie",
  },
  en: {
    title: "My Weather Alerts",
    noAlerts: "No alerts configured",
    configureAlerts:
      "Configure your weather alerts to receive email notifications.",
    condition: "Condition",
    value: "Value",
    city: "City",
    frequency: "Frequency",
    time: "Time",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    minThreshold: "Minimum threshold",
    maxThreshold: "Maximum threshold",
    above: "Above",
    below: "Below",
    equals: "Equals",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    rain: "Rain",
  },
};

const UserAlerts = ({ darkMode }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("fr");

  const t = translations[language];

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get("/alerts");
      setAlerts(response.data.data.alerts);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des alertes");
      setLoading(false);
    }
  };

  const toggleAlertStatus = async (alertId, currentStatus) => {
    try {
      await api.patch(`/alerts/${alertId}`, { isActive: !currentStatus });
      fetchAlerts();
    } catch (err) {
      setError("Erreur lors de la modification du statut de l'alerte");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiBell className="w-6 h-6 mr-2" />
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.title}
          </h1>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`rounded-md border ${
            darkMode
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`rounded-lg shadow-md p-6 border-l-4 border-blue-500 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3
                  className={`text-lg font-semibold capitalize ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {alert.type}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {alert.city}
                </p>
              </div>
              <button
                onClick={() => toggleAlertStatus(alert._id, alert.isActive)}
                className={`p-2 rounded-full ${
                  alert.isActive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {alert.isActive ? <FiCheck /> : <FiX />}
              </button>
            </div>

            <div className="space-y-2">
              {alert.threshold ? (
                <>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t.minThreshold}:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {alert.threshold.min || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t.maxThreshold}:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {alert.threshold.max || "-"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t.condition}:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {alert.condition === "above" && t.above}
                      {alert.condition === "below" && t.below}
                      {alert.condition === "equals" && t.equals}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t.value}:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {alert.value}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t.frequency}:
                </span>
                <span
                  className={`text-sm font-medium capitalize ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {alert.frequency === "daily" && t.daily}
                  {alert.frequency === "weekly" && t.weekly}
                  {alert.frequency === "monthly" && t.monthly}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t.time}:
                </span>
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {alert.time}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t.status}:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    alert.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {alert.isActive ? t.active : t.inactive}
                </span>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FiBell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3
              className={`text-lg font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.noAlerts}
            </h3>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              {t.configureAlerts}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAlerts;
