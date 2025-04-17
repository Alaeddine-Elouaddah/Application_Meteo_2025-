import React from "react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Tableau de Bord Admin
        </h1>
        <p className="text-gray-600 mb-8">
          Vue d'ensemble des utilisateurs, projets et activités sur la
          plateforme.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Utilisateurs total */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Utilisateurs total
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">24</p>
            <p className="text-sm text-gray-500">↑ 12% 24 actifs ce mois</p>
          </div>

          {/* Projets actifs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Projets actifs
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">8</p>
            <p className="text-sm text-gray-500">↑ 20% 3 nouveaux ce mois</p>
          </div>

          {/* Tâches complétées */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Tâches complétées
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">47</p>
            <p className="text-sm text-gray-500">↑ 8% Ce mois</p>
          </div>

          {/* Tâches en attente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Tâches en attente
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">35</p>
            <p className="text-sm text-gray-500">15 urgents</p>
          </div>

          {/* Documents partagés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Documents partagés
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">128</p>
            <p className="text-sm text-gray-500">↑ 15% Ce mois</p>
          </div>

          {/* Messages échangés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Messages échangés
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">1543</p>
            <p className="text-sm text-gray-500">↑ 24% Ce mois</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité des utilisateurs par mois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Activité des utilisateurs par mois
            </h2>
            <div className="flex items-end space-x-2 h-40">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ height: "28px" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">28</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-8 bg-blue-400 rounded-t"
                  style={{ height: "21px" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">21</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-8 bg-blue-300 rounded-t"
                  style={{ height: "14px" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">14</span>
              </div>
            </div>
          </div>

          {/* État des projets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              État des projets
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                <span className="text-gray-700">En attente</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-700">En cours</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-700">Terminés</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
