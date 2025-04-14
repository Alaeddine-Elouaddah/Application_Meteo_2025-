// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />{" "}
        {/* Route pour la page d'accueil */}
        <Route path="/login" element={<Login />} />{" "}
        {/* Route pour la page de connexion */}
      </Routes>
    </Router>
  );
};

export default App;
