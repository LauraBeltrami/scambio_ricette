import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeDetails from "./RecipeDetails"; // 👈 importa la pagina dettagli

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ricetta/:id" element={<RecipeDetails />} /> {/* 👈 nuova pagina */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

