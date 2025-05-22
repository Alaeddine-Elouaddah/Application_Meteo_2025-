import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

const UserAlert = ({ darkMode }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/alerts/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlerts(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des alertes");
      setLoading(false);
      console.error("Erreur:", err);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Bell className="text-blue-500" size={20} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "warning":
        return darkMode ? "bg-yellow-900/50" : "bg-yellow-50";
      case "success":
        return darkMode ? "bg-green-900/50" : "bg-green-50";
      case "error":
        return darkMode ? "bg-red-900/50" : "bg-red-50";
      default:
        return darkMode ? "bg-blue-900/50" : "bg-blue-50";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-red-900/50" : "bg-red-50"
        } text-red-700 dark:text-red-200`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Mes Alertes
        </h2>
        <button
          onClick={fetchAlerts}
          className={`p-2 rounded-lg ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div
          className={`p-6 rounded-lg text-center ${
            darkMode ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <Bell size={40} className="mx-auto mb-4 text-gray-400" />
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Aucune alerte pour le moment
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 rounded-lg ${getAlertColor(alert.type)} ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } border`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {alert.title}
                  </h3>
                  <p
                    className={`mt-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {alert.message}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        alert.read
                          ? darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-600"
                          : darkMode
                          ? "bg-blue-900 text-blue-200"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {alert.read ? "Lu" : "Non lu"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAlert;
