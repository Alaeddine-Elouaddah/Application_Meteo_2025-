// src/components/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaComments,
} from "react-icons/fa";
import OCPLogo from "../assets/ocp.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={OCPLogo} alt="OCP Logo" className="h-10" />
            <span className="text-xl font-bold">OCP Plateforme</span>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Se Connecter
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-6">
          Plateforme Collaborative OCP
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Gestion des membres, équipes, projets et partage de documents en un
          seul endroit.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Créer un Compte
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          Nos Fonctionnalités
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<FaUsers size={40} className="text-green-600" />}
            title="Gestion des Membres"
            description="Gérez les profils des stagiaires, collaborateurs et leurs droits d'accès"
          />

          <FeatureCard
            icon={<FaUsers size={40} className="text-green-600" />}
            title="Groupes de Travail"
            description="Créez et gérez des équipes pour vos projets"
          />

          <FeatureCard
            icon={<FaProjectDiagram size={40} className="text-green-600" />}
            title="Suivi des Projets"
            description="Suivez l'avancement de tous vos projets en temps réel"
          />

          <FeatureCard
            icon={<FaComments size={40} className="text-green-600" />}
            title="Messagerie Instantanée"
            description="Communiquez avec vos équipes en temps réel"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default HomePage;
