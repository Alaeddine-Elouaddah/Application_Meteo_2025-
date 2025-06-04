const cron = require("node-cron");
const {
  addNextDayForecast,
} = require("./controllers/donneesCollecteesController");
const alertController = require("./controllers/alertController");

// Exécuter chaque jour à 10h30 du matin pour ajouter le jour suivant
cron.schedule("17 9 * * *", () => {
  console.log("⏰ Exécution du cron job pour ajouter le jour suivant à 10h30");
  addNextDayForecast();
});

// Vérifier les alertes toutes les heures
cron.schedule("46 16 * * *", async () => {
  console.log("Vérification des alertes météo...");
  await alertController.checkAndSendAlerts();
});

console.log(
  "🔄 Cron job configuré pour s'exécuter quotidiennement à 10h30 du matin"
);
