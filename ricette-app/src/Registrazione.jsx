// src/Registrazione.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";

function Registrazione() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const navigate = useNavigate();

  const registrati = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Registrazione completata!");
      navigate("/"); // Torna alla home o pagina principale
    } catch (err) {
      console.error("Errore registrazione:", err);
      setErrore(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Registrazione</h1>
      <form onSubmit={registrati} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        {errore && <p className="text-red-500 text-sm">{errore}</p>}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl">
          Registrati
        </button>
      </form>
      <p className="mt-4 text-sm">
        Hai già un account?{" "}
        <Link to="/login" className="text-blue-600 underline">Accedi</Link>
      </p>
    </div>
  );
}

export default Registrazione;
