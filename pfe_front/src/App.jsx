import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Admin from "./components/Admin/Admin"; // Import sans accolades
import Stagiaire from "./components/stagiaire"; // 1. Importez le composant
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stagiaire" element={<Stagiaire />} />{" "}
        {/* 2. Ajoutez la route */}
        <Route
          path="/Admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
