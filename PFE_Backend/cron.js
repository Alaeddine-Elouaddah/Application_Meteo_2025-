const cron = require("node-cron");
const {
  addNextDayForecast,
} = require("./controllers/donneesCollecteesController");

// Exécuter chaque jour à minuit pour ajouter le jour suivant
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Exécution du cron job pour ajouter le jour suivant");
  addNextDayForecast();
});

console.log("🔄 Cron job configuré pour s'exécuter quotidiennement à minuit");
