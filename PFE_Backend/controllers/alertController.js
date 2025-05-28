const Alert = require("../models/Alert");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");
const TriggeredAlert = require("../models/TriggeredAlert");

// Créer une nouvelle alerte
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { alert },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

// Obtenir toutes les alertes d'un utilisateur
exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id });
    res.status(200).json({
      status: "success",
      data: { alerts },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

// Mettre à jour une alerte
exports.updateAlert = async (req, res) => {
  try {
    const existingAlert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existingAlert) {
      return res.status(404).json({
        status: "fail",
        message: "Alerte non trouvée",
      });
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    res.status(200).json({
      status: "success",
      data: { alert },
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'alerte:", err);
    res.status(400).json({
      status: "error",
      message: err.message || "Erreur lors de la mise à jour de l'alerte",
      details: err.errors
        ? Object.values(err.errors).map((e) => e.message)
        : undefined,
    });
  }
};

// Supprimer une alerte
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        status: "fail",
        message: "Alerte non trouvée",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

// Vérifier et envoyer les alertes
function checkCondition(condition, currentValue, alertValue) {
  switch (condition) {
    case ">":
      return currentValue > alertValue;
    case "<":
      return currentValue < alertValue;
    case ">=":
      return currentValue >= alertValue;
    case "<=":
      return currentValue <= alertValue;
    case "==":
      return currentValue === alertValue;
    case "!=":
      return currentValue !== alertValue;
    default:
      return false;
  }
}

exports.checkAndSendAlerts = async () => {
  try {
    const alerts = await Alert.find({ isActive: true });
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const BASE_URL = process.env.OPENWEATHER_BASE_URL;

    if (!API_KEY) {
      throw new Error("Clé API OpenWeather manquante");
    }

    // Récupérer tous les utilisateurs
    const usersResponse = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/v1/users`
    );

    if (!usersResponse.data?.data?.users) {
      throw new Error("Format de réponse des utilisateurs invalide");
    }

    const users = usersResponse.data.data.users;

    for (const alert of alerts) {
      for (const user of users) {
        try {
          // Validation des données utilisateur
          if (!user?.email || !user?.city) {
            console.error(`Données incomplètes pour l'utilisateur ${user._id}`);
            continue;
          }

          // Vérification email valide
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            console.error(
              `Email invalide pour l'utilisateur ${user._id}: ${user.email}`
            );
            continue;
          }

          // Construction requête météo
          let locationQuery;
          if (user.city.coordinates) {
            locationQuery = `lat=${user.city.coordinates.lat}&lon=${user.city.coordinates.lon}`;
          } else {
            locationQuery = `q=${encodeURIComponent(
              user.city.name || user.city
            )}`;
          }

          // Appel API météo
          const weatherUrl = `${BASE_URL}/weather?${locationQuery}&appid=${API_KEY}&units=metric`;
          const response = await axios.get(weatherUrl);

          if (response.data.cod !== 200) continue;

          // Vérification condition alerte
          const currentValue = getWeatherValue(alert.type, response.data);
          if (!checkAlertCondition(alert, currentValue)) continue;

          // Envoi email
          await sendEmail(
            user.email,
            `[Alerte Météo] ${alert.type.toUpperCase()} - ${
              user.city.name || user.city
            }`,
            generateAlertEmailContent(alert, currentValue, user.city)
          );

          // Enregistrement alerte déclenchée
          await TriggeredAlert.create({
            userId: user._id,
            alertId: alert._id,
            city: user.city.name || user.city,
            value: currentValue,
            type: alert.type,
            description: alert.description,
            severity: alert.severity,
            frequency: alert.frequency,
            alertValue: alert.value,
            triggeredAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Erreur traitement alerte ${alert._id} pour utilisateur ${user._id}:`,
            error.message
          );
        }
      }
    }
  } catch (globalError) {
    console.error("Erreur globale:", globalError.message);
    await notifyAdmin(`Échec service alertes: ${globalError.message}`);
  }
};

// Fonctions utilitaires
function getWeatherValue(type, weatherData) {
  const values = {
    temperature: weatherData.main?.temp,
    humidity: weatherData.main?.humidity,
    wind: weatherData.wind?.speed,
    pressure: weatherData.main?.pressure,
    rain: weatherData.rain?.["1h"] || weatherData.rain?.["3h"] || 0,
    uv: weatherData.uvi || 0,
  };
  return values[type];
}

function checkAlertCondition(alert, currentValue) {
  if (alert.condition && alert.value !== undefined) {
    return checkCondition(alert.condition, currentValue, alert.value);
  }
  if (alert.threshold) {
    return (
      (alert.threshold.min !== undefined &&
        currentValue < alert.threshold.min) ||
      (alert.threshold.max !== undefined && currentValue > alert.threshold.max)
    );
  }
  return false;
}

function generateAlertEmailContent(alert, currentValue, city) {
  // Icônes par type
  const icons = {
    temperature: "🌡️",
    humidity: "💧",
    wind: "💨",
    pressure: "⚖️",
    rain: "🌧️",
    uv: "☀️",
  };
  const icon = icons[alert.type] || "🔔";
  return `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 12px; max-width: 480px; margin: auto;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 2.2rem;">${icon}</span>
        <h2 style="margin: 0; color: #2563eb;">Alerte ${
          alert.type.charAt(0).toUpperCase() + alert.type.slice(1)
        }</h2>
      </div>
      <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p><strong>Ville :</strong> ${city.name || city}</p>
      <p><strong>Valeur actuelle :</strong> <span style="color: #d97706;">${currentValue} ${getUnit(
    alert.type
  )}</span></p>
      <p><strong>Condition :</strong> ${formatCondition(alert)}</p>
      <p><strong>Date :</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Seuil :</strong> ${
        alert.value ||
        `${alert.threshold?.min ?? "-"}-${alert.threshold?.max ?? "-"}`
      }</p>
      <p><strong>Description :</strong> ${alert.description || "-"}</p>
      <p><strong>Sévérité :</strong> <span style="color: ${
        alert.severity === "Danger"
          ? "#dc2626"
          : alert.severity === "Warning"
          ? "#f59e42"
          : "#2563eb"
      }; font-weight: bold;">${alert.severity || "-"}</span></p>
      <p><strong>Fréquence :</strong> ${alert.frequency || "-"}</p>
    </div>
  `;
}

async function notifyAdmin(message) {
  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: "[CRITIQUE] Échec du service d'alertes",
      text: message,
    });
  }
}

// Fonctions utilitaires
function getUnit(type) {
  const units = {
    temperature: "°C",
    humidity: "%",
    wind: "m/s",
    pressure: "hPa",
    rain: "mm",
    uv: "UVI",
  };
  return units[type] || "";
}

function formatCondition(alert) {
  if (alert.condition) {
    return `${alert.condition} ${alert.value} ${getUnit(alert.type)}`;
  }
  return `Entre ${alert.threshold?.min ?? "-"} et ${
    alert.threshold?.max ?? "-"
  } ${getUnit(alert.type)}`;
}

// Obtenir une alerte par son ID
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        status: "fail",
        message: "Alerte non trouvée",
      });
    }

    res.status(200).json({
      status: "success",
      data: { alert },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

// Vérification manuelle des alertes
exports.manualAlertCheck = async (req, res) => {
  try {
    await exports.checkAndSendAlerts();
    res.status(200).json({
      status: "success",
      message: "Vérification des alertes terminée",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Obtenir les alertes déclenchées
exports.getTriggeredAlerts = async (req, res) => {
  try {
    const triggeredAlerts = await TriggeredAlert.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { triggeredAlerts },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
