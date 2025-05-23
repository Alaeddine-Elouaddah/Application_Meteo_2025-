const cron = require("node-cron");
const {
  addNextDayForecast,
} = require("./controllers/donneesCollecteesController");
const alertController = require("./controllers/alertController");

// Exécuter chaque jour à 10h30 du matin pour ajouter le jour suivant
cron.schedule("18 10 * * *", () => {
  console.log("⏰ Exécution du cron job pour ajouter le jour suivant à 10h30");
  addNextDayForecast();
});

// Vérifier les alertes toutes les heures
cron.schedule("0 * * * *", async () => {
  console.log("Vérification des alertes météo...");
  await alertController.checkAndSendAlerts();
});

// Vérifier les alertes au démarrage du serveur
console.log("Démarrage du service d'alertes météo...");
alertController.checkAndSendAlerts();

console.log(
  "🔄 Cron job configuré pour s'exécuter quotidiennement à 10h30 du matin"
);
