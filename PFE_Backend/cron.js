const cron = require("node-cron");
const {
  addNextDayForecast,
} = require("./controllers/donneesCollecteesController");

// Exécuter chaque jour à 10h30 du matin pour ajouter le jour suivant
cron.schedule("30 10 * * *", () => {
  console.log("⏰ Exécution du cron job pour ajouter le jour suivant à 10h30");
  addNextDayForecast();
});

console.log(
  "🔄 Cron job configuré pour s'exécuter quotidiennement à 10h30 du matin"
);
