import React from "react";

const Dashboard = ({ darkMode }) => {
  return (
    <div className={`p-4 min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Hello Dashboards
        </h1>

        {/* Exemple de contenu avec dark mode */}
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-800 dark:text-gray-300">
              Statistiques du jour
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Utilisateurs actifs
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                124
              </p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Alertes
              </h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                3
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
