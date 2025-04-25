import React from "react";
import { useNavigate } from "react-router-dom";

const User = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      // 1. Appel API pour notifier le serveur (optionnel)
      const response = await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 2. Supprime le token côté client QUOI QU'IL ARRIVE
      localStorage.removeItem("token");

      // 3. Redirige vers la page d'accueil
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      // Même en cas d'erreur, on supprime le token et on redirige
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome to User Panel
        </h1>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default User;
