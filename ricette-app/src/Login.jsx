import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const accedi = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Accesso effettuato!");
      navigate("/"); // torna alla home
    } catch (err) {
      alert("❌ Errore: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <form
        onSubmit={accedi}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold text-orange-700 text-center">🔐 Login</h2>

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded-xl">
          Accedi
        </button>

        <Link to="/registrazione" className="text-sm text-center text-blue-500 underline">
          Non hai un account? Registrati
        </Link>
      </form>
    </div>
  );
}

export default Login;
