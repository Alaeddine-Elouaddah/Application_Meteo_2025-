import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiBell,
  FiX,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

// Configuration de Modal pour l'accessibilité
Modal.setAppElement("#root");

const Alert = ({ darkMode }) => {
  const [alerts, setAlerts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [formData, setFormData] = useState({
    type: "temperature",
    condition: ">",
    value: "",
    description: "",
    frequency: "daily",
    severity: "Information",
    isActive: true,
  });
  const [editingAlert, setEditingAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    title: "Gestion des Alertes Météo",
    newAlert: "Nouvelle Alerte",
    editAlert: "Modifier l'alerte",
    type: "Type",
    condition: "Condition",
    value: "Seuil",
    frequency: "Fréquence",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    rain: "Pluie",
    uv: "UV",
    above: "Supérieur à",
    below: "Inférieur à",
    equals: "Égal à",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    status: "Statut",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette alerte ?",
    error: "Erreur lors du chargement des alertes",
    saveError: "Erreur lors de la sauvegarde de l'alerte",
    deleteError: "Erreur lors de la suppression de l'alerte",
    alertCreated: "Alerte créée avec succès",
    alertUpdated: "Alerte mise à jour avec succès",
    alertDeleted: "Alerte supprimée avec succès",
    name: "Nom",
    description: "Description",
    severity: "Sévérité",
    information: "Information",
    warning: "Avertissement",
    danger: "Danger",
    operator: "Opérateur",
    greater: "> (Supérieur)",
    less: "< (Inférieur)",
    equal: "= (Égal)",
    greaterOrEqual: ">= (Supérieur ou égal)",
    lessOrEqual: "<= (Inférieur ou égal)",
  };

  const t = translations;

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
      setError(t.error);
      setLoading(false);
      toast.error(t.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const alertData = {
        ...formData,
        value: Number(formData.value),
      };

      if (editingAlert) {
        const response = await api.patch(
          `/alerts/${editingAlert._id}`,
          alertData
        );
        if (response.data.status === "success") {
          toast.success(t.alertUpdated);
          closeModal();
          fetchAlerts();
        } else {
          toast.error(response.data.message || t.saveError);
        }
      } else {
        const response = await api.post("/alerts", alertData);
        if (response.data.status === "success") {
          toast.success(t.alertCreated);
          closeModal();
          fetchAlerts();
        } else {
          toast.error(response.data.message || t.saveError);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      toast.error(err.response?.data?.message || t.saveError);
    }
  };

  const openDeleteModal = (alert) => {
    setAlertToDelete(alert);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setAlertToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/alerts/${alertToDelete._id}`);
      toast.success(t.alertDeleted);
      closeDeleteModal();
      fetchAlerts();
    } catch (err) {
      setError(t.deleteError);
      toast.error(t.deleteError);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAlert(null);
    setFormData({
      type: "temperature",
      condition: ">",
      value: "",
      frequency: "daily",
      severity: "Information",
      isActive: true,
    });
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      type: alert.type,
      severity: alert.severity || "Information",
      condition: alert.condition,
      value: alert.value,
      frequency: alert.frequency,
      description: alert.description || "",
      isActive: alert.isActive,
    });
    openModal();
  };

  const getUnitForType = (type) => {
    switch (type) {
      case "temperature":
        return "°C";
      case "humidity":
        return "%";
      case "wind":
        return "km/h";
      case "pressure":
        return "hPa";
      case "rain":
        return "mm";
      case "uv":
        return "UV";
      default:
        return "";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "temperature":
        return "Température";
      case "humidity":
        return "Humidité";
      case "wind":
        return "Vent";
      case "pressure":
        return "Pression";
      case "rain":
        return "Pluie";
      case "uv":
        return "UV";
      default:
        return type;
    }
  };

  const getConditionText = (condition) => {
    switch (condition) {
      case ">":
        return "supérieur à";
      case "<":
        return "inférieur à";
      case "=":
        return "égal à";
      case ">=":
        return "supérieur ou égal à";
      case "<=":
        return "inférieur ou égal à";
      default:
        return condition;
    }
  };

  const formatValueWithUnit = (type, value) => {
    const unit = getUnitForType(type);
    return `${value} ${unit}`;
  };

  const formatAlertCondition = (alert) => {
    return `${getTypeLabel(alert.type)} ${getConditionText(
      alert.condition
    )} ${formatValueWithUnit(alert.type, alert.value)}`;
  };

  const getTypeIcon = (type, isActive = true) => {
    const iconSize = 36;

    // Couleurs thématiques pour chaque type d'alerte
    const colors = {
      temperature: "#FF5733", // Orange/rouge pour température
      humidity: "#3498DB", // Bleu pour humidité
      wind: "#2ECC71", // Vert pour vent
      pressure: "#9B59B6", // Violet pour pression
      rain: "#2980B9", // Bleu foncé pour pluie
      uv: "#F1C40F", // Jaune pour UV
      default: darkMode ? "#FFFFFF" : "#000000",
    };

    // Opacité réduite si l'alerte est inactive
    const opacity = isActive ? "opacity-100" : "opacity-60";

    const iconColor = colors[type] || colors.default;

    switch (type) {
      case "temperature":
        return (
          <WiDaySunny size={iconSize} color={iconColor} className={opacity} />
        );
      case "humidity":
        return (
          <WiHumidity size={iconSize} color={iconColor} className={opacity} />
        );
      case "wind":
        return (
          <WiStrongWind size={iconSize} color={iconColor} className={opacity} />
        );
      case "pressure":
        return (
          <WiBarometer size={iconSize} color={iconColor} className={opacity} />
        );
      case "rain":
        return <WiRain size={iconSize} color={iconColor} className={opacity} />;
      case "uv":
        return (
          <WiDaySunny size={iconSize} color={iconColor} className={opacity} />
        );
      default:
        return <FiBell size={iconSize} color={iconColor} className={opacity} />;
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.title}
        </h1>
        <button
          onClick={() => {
            openModal();
            setEditingAlert(null);
            setFormData({
              type: "temperature",
              condition: ">",
              value: "",
              frequency: "daily",
              severity: "Information",
              isActive: true,
            });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="mr-2" /> {t.newAlert}
        </button>
      </div>

      {/* Modal pour créer/modifier une alerte */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={editingAlert ? t.editAlert : t.newAlert}
        className={`fixed inset-0 flex items-center justify-center p-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div
          className={`w-full max-w-2xl p-6 rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingAlert ? t.editAlert : t.newAlert}
            </h2>
            <button
              onClick={closeModal}
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  rows="3"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.type}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value="temperature">{t.temperature}</option>
                  <option value="humidity">{t.humidity}</option>
                  <option value="wind">{t.wind}</option>
                  <option value="pressure">{t.pressure}</option>
                  <option value="rain">{t.rain}</option>
                  <option value="uv">{t.uv}</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.severity}
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value="Danger">{t.danger}</option>
                  <option value="Warning">{t.warning}</option>
                  <option value="Information">{t.information}</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.operator}
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value=">">{t.greater}</option>
                  <option value="<">{t.less}</option>
                  <option value="=">{t.equal}</option>
                  <option value=">=">{t.greaterOrEqual}</option>
                  <option value="<=">{t.lessOrEqual}</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.value}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md pr-12 ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                    required
                  />
                  <span
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {getUnitForType(formData.type)}
                  </span>
                </div>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.frequency}
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className={`w-full p-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value="daily">{t.daily}</option>
                  <option value="weekly">{t.weekly}</option>
                  <option value="monthly">{t.monthly}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  darkMode ? "bg-gray-700" : "bg-white"
                }`}
              />
              <label
                htmlFor="isActive"
                className={`ml-2 block text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {formData.isActive ? t.active : t.inactive}
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } transition-colors`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {editingAlert ? t.save : t.newAlert}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirmer la suppression"
        className={`fixed inset-0 flex items-center justify-center p-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div
          className={`w-full max-w-md p-6 rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Confirmation</h2>
            <button
              onClick={closeDeleteModal}
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <FiX size={24} />
            </button>
          </div>

          <p className="mb-6">{t.confirmDelete}</p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={closeDeleteModal}
              className={`px-4 py-2 border rounded-md ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } transition-colors`}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {t.delete}
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getTypeIcon(alert.type, alert.isActive)}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t[alert.type]}
                    </h3>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full
                    ${
                      alert.severity === "Danger"
                        ? "bg-red-100 text-red-800"
                        : ""
                    }
                    ${
                      alert.severity === "Warning"
                        ? "bg-orange-100 text-orange-800"
                        : ""
                    }
                    ${
                      alert.severity === "Information"
                        ? "bg-blue-100 text-blue-800"
                        : ""
                    }
                  `}
                >
                  {alert.severity === "Danger" && (
                    <FiAlertTriangle className="text-red-500" />
                  )}
                  {alert.severity === "Warning" && (
                    <FiAlertCircle className="text-orange-500" />
                  )}
                  {alert.severity === "Information" && (
                    <FiInfo className="text-blue-500" />
                  )}
                  {alert.severity}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 items-center border-b pb-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Condition :
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {getTypeLabel(alert.type)}{" "}
                    {getConditionText(alert.condition)}{" "}
                    <span className="font-extrabold">{alert.value}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center border-b pb-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Seuil :
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {alert.value} {getUnitForType(alert.type)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center border-b pb-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Sévérité :
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {alert.severity}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center border-b pb-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Fréquence :
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {t[alert.frequency]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-start border-b pb-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Description :
                  </span>
                  <div
                    className="whitespace-pre-line break-words font-medium text-gray-800 dark:text-gray-100 w-full max-h-24 overflow-y-auto pr-2"
                    style={{ minWidth: 0, wordBreak: "break-word" }}
                  >
                    {alert.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Statut :
                  </span>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      alert.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    } justify-self-start`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        alert.isActive ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                    {alert.isActive ? t.active : t.inactive}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(alert)}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "text-blue-400 hover:bg-gray-700"
                      : "text-blue-600 hover:bg-gray-100"
                  } transition-colors`}
                  title={t.edit}
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => openDeleteModal(alert)}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "text-red-400 hover:bg-gray-700"
                      : "text-red-600 hover:bg-gray-100"
                  } transition-colors`}
                  title={t.delete}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alert;
