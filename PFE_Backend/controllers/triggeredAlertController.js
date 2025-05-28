const TriggeredAlert = require("../models/TriggeredAlert");

// Récupérer toutes les alertes déclenchées non lues pour un utilisateur
exports.getTriggeredAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching alerts for user:", userId); // Debug log

    const alerts = await TriggeredAlert.find({
      userId,
      isRead: { $ne: true }, // Récupérer les alertes non lues ou sans statut isRead
    })
      .sort({ triggeredAt: -1 })
      .populate("alertId", "name type threshold condition")
      .limit(50);

    console.log("Found alerts:", alerts.length); // Debug log

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error in getTriggeredAlerts:", error); // Debug log
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des alertes",
      error: error.message,
    });
  }
};

// Marquer une alerte comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    console.log("Marking alert as read:", { alertId, userId }); // Debug log

    const alert = await TriggeredAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!alert) {
      console.log("Alert not found"); // Debug log
      return res.status(404).json({
        success: false,
        message: "Alerte non trouvée",
      });
    }

    console.log("Alert marked as read successfully"); // Debug log

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Error in markAsRead:", error); // Debug log
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'alerte",
      error: error.message,
    });
  }
};
