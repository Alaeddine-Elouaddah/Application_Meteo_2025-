import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // récupère le rôle stocké

  // 🚫 Si pas connecté ➔ redirige vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Si un rôle est exigé ET que le rôle de l'utilisateur ne correspond pas
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />; // tu peux rediriger vers une page "accès refusé"
  }

  // ✅ Accès autorisé
  return children;
};

export default PrivateRoute;
