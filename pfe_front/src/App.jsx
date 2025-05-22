import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Admin from "./components/Admin/Admin";
import User from "./components/user"; // Corrigé : le U majuscule
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Route protégée pour USER */}
        <Route
          path="/user/*"
          element={
            <PrivateRoute role="user">
              <User />
            </PrivateRoute>
          }
        />

        {/* Route protégée pour ADMIN */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
