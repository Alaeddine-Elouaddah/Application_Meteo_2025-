const Alert = require("../models/Alert");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");

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
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

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
exports.checkAndSendAlerts = async () => {
  try {
    const alerts = await Alert.find({ isActive: true }).populate("userId");
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    for (const alert of alerts) {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${alert.city}&appid=${API_KEY}&units=metric`
      );

      const weatherData = response.data;
      let shouldSendAlert = false;
      let currentValue;

      switch (alert.type) {
        case "temperature":
          currentValue = weatherData.main.temp;
          break;
        case "humidity":
          currentValue = weatherData.main.humidity;
          break;
        case "wind":
          currentValue = weatherData.wind.speed;
          break;
        case "pressure":
          currentValue = weatherData.main.pressure;
          break;
        case "rain":
          currentValue = weatherData.rain ? weatherData.rain["1h"] || 0 : 0;
          break;
      }

      // Vérifier les seuils
      if (alert.threshold) {
        if (
          alert.threshold.min !== null &&
          currentValue < alert.threshold.min
        ) {
          shouldSendAlert = true;
        }
        if (
          alert.threshold.max !== null &&
          currentValue > alert.threshold.max
        ) {
          shouldSendAlert = true;
        }
      } else {
        // Vérifier la condition normale si pas de seuils
        switch (alert.condition) {
          case "above":
            shouldSendAlert = currentValue > alert.value;
            break;
          case "below":
            shouldSendAlert = currentValue < alert.value;
            break;
          case "equals":
            shouldSendAlert = Math.abs(currentValue - alert.value) < 0.1;
            break;
        }
      }

      if (shouldSendAlert) {
        const user = alert.userId;
        const subject = `Alerte météo pour ${alert.city}`;
        let message = `Bonjour ${user.username},\n\n`;
        message += `Une alerte a été déclenchée pour ${alert.city} :\n\n`;

        if (alert.threshold) {
          if (currentValue < alert.threshold.min) {
            message += `La ${alert.type} est inférieure au seuil minimum (${alert.threshold.min}).\n`;
            message += `Valeur actuelle : ${currentValue}\n`;
          }
          if (currentValue > alert.threshold.max) {
            message += `La ${alert.type} est supérieure au seuil maximum (${alert.threshold.max}).\n`;
            message += `Valeur actuelle : ${currentValue}\n`;
          }
        } else {
          message += `La ${alert.type} est ${alert.condition} ${alert.value}.\n`;
          message += `Valeur actuelle : ${currentValue}\n`;
        }

        message += `\nDate et heure : ${new Date().toLocaleString()}`;

        const html = message.replace(/\n/g, "<br>");

        await sendEmail(user.email, subject, html);
        alert.lastSent = new Date();
        await alert.save();
      }
    }
  } catch (err) {
    console.error("Erreur lors de la vérification des alertes:", err);
  }
};
