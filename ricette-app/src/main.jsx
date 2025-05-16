import React from "react";
import './App.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeDetails from "./RecipeDetails";
import Registrazione from "./Registrazione"; 
import Login from "./Login";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ricetta/:id" element={<RecipeDetails />} />
        <Route path="/registrazione" element={<Registrazione />} /> 
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
