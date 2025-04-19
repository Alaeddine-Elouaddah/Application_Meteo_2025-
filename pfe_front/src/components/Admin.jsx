// src/App.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Données pour les graphiques
const activityData = {
  labels: ["Jan", "Fév", "Mars", "Avr", "Mai"],
  datasets: [
    {
      label: "Admins",
      data: [10, 15, 20, 12, 21],
      backgroundColor: "#34D399",
    },
    {
      label: "Collaborateurs",
      data: [5, 8, 15, 10, 8],
      backgroundColor: "#FBBF24",
    },
    {
      label: "Stagiaires",
      data: [3, 5, 10, 7, 5],
      backgroundColor: "#F87171",
    },
  ],
};

const projectStatusData = {
  labels: ["En cours", "Terminés", "En retard"],
  datasets: [
    {
      label: "Projets",
      data: [8, 5, 2],
      backgroundColor: "#34D399",
    },
  ],
};

const Admin = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-lg font-bold">CCP Collab Nexus</h1>
        </div>
        <nav className="mt-4">
          <a href="#" className="block p-4 text-blue-600 bg-blue-50">
            Tableau de bord
          </a>
          <a href="#" className="block p-4">
            Utilisateurs
          </a>
          <a href="#" className="block p-4">
            Projets
          </a>
          <a href="#" className="block p-4">
            Équipes
          </a>
          <a href="#" className="block p-4">
            Paramètres
          </a>
        </nav>
        <div className="p-4 mt-auto">
          <button className="w-full p-2 text-white bg-red-500 rounded">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Admin</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Utilisateurs totaux</h2>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-green-500">+24% ce mois</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Projets</h2>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-red-500">+20% ce mois</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Tâches complètes</h2>
            <p className="text-2xl font-bold">47</p>
            <p className="text-sm text-green-500">+1% ce mois</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Tâches en attente</h2>
            <p className="text-2xl font-bold">35</p>
            <p className="text-sm text-red-500">+15% ce mois</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Messages échangés</h2>
            <p className="text-2xl font-bold">15843</p>
            <p className="text-sm text-green-500">+12% ce mois</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Activité des utilisateurs par mois
            </h2>
            <Bar data={activityData} />
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">État des projets</h2>
            <Bar data={projectStatusData} />
          </div>
        </div>

        {/* Activités et Projets */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Projets récents</h2>
            <div className="mb-4">
              <h3 className="font-medium">
                Optimisation des processus d'extraction
              </h3>
              <p className="text-sm text-gray-500">
                Projet visant à améliorer l'efficacité...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">75%</p>
            </div>
            <div>
              <h3 className="font-medium">Digitalisation des rapports de...</h3>
              <p className="text-sm text-gray-500">
                Mise en place d'un système...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">30%</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Système de surveillance
            </h2>
            <p className="text-sm text-gray-500">
              Mise en place d'un système de surveillance...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">45%</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="user"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm">Fatima Zahra a modifié...</p>
                  <p className="text-xs text-gray-500">Il y a 10 min</p>
                </div>
              </div>
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="user"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm">Youssef Amrani a créé...</p>
                  <p className="text-xs text-gray-500">Il y a 45 min</p>
                </div>
              </div>
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="user"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm">Karim Idrissi a ajouté...</p>
                  <p className="text-xs text-gray-500">Il y a 2h</p>
                </div>
              </div>
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="user"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm">Leila Mansouri a partagé...</p>
                  <p className="text-xs text-gray-500">Il y a 3h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
