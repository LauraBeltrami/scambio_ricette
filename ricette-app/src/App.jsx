import "./App.css";
import DOMPurify from 'dompurify';
import { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

function App() {
  const [utente, setUtente] = useState(null);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [passaggi, setPassaggi] = useState("");
  const [immagine, setImmagine] = useState(null);
  const [anteprima, setAnteprima] = useState(null);
  const [ricette, setRicette] = useState([]);
  const [ricercaIngrediente, setRicercaIngrediente] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (utenteLoggato) => {
      if (utenteLoggato) setUtente(utenteLoggato);
    });
    return () => unsubscribe();
  }, []);

  const loginConGoogle = () => {
    signInWithPopup(auth, provider)
      .then((res) => setUtente(res.user))
      .catch((err) => console.error("Errore login:", err));
  };

  const esci = () => {
    signOut(auth).then(() => setUtente(null));
  };

  const caricaImmagine = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImmagine(reader.result);
      setAnteprima(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const inviaRicetta = async (e) => {
    e.preventDefault();
    if (!titolo || !descrizione) return alert("Compila tutti i campi!");

    // Valutazione base
    if (/<|>|script/.test(titolo + descrizione + passaggi)) {
      return alert("⚠️ Il testo non può contenere tag HTML o script.");
    }

    // Sanificazione
    const titoloPulito = DOMPurify.sanitize(titolo);
    const descrizionePulita = DOMPurify.sanitize(descrizione);
    const passaggiPuliti = DOMPurify.sanitize(passaggi);

    try {
      await addDoc(collection(db, "ricette"), {
        titolo: titoloPulito,
        descrizione: descrizionePulita,
        passaggi: passaggiPuliti,
        immagine,
        autore: utente.displayName,
        uid: utente.uid,
        data: serverTimestamp(),
        likes: 0,
      });

      setTitolo("");
      setDescrizione("");
      setPassaggi("");
      setImmagine(null);
      setAnteprima(null);
      alert("✅ Ricetta salvata!");
    } catch (err) {
      console.error("Errore salvataggio:", err);
    }
  };

  const mettiLike = async (id, currentLikes) => {
    try {
      const docRef = doc(db, "ricette", id);
      await updateDoc(docRef, { likes: currentLikes + 1 });
    } catch (err) {
      console.error("Errore like:", err);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "ricette"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRicette(lista);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-600">🍝 Scambio Ricette</h1>
        {utente && (
          <div className="flex items-center gap-4">
            <span className="text-gray-800">👋 {utente.displayName}</span>
            <button
              onClick={esci}
              className="px-4 py-2 bg-red-500 text-white rounded-xl"
            >
              Esci
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto p-6 w-full max-w-5xl">
        {utente ? (
          <>
            <form
              onSubmit={inviaRicetta}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 mb-8"
            >
              <h2 className="text-xl font-semibold">➕ Nuova ricetta</h2>
              <input
                type="text"
                placeholder="Titolo ricetta"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={caricaImmagine}
                className="border p-2 rounded"
              />
              {anteprima && (
                <img
                  src={anteprima}
                  alt="Anteprima"
                  className="w-full max-h-60 object-cover rounded"
                />
              )}
              <textarea
                placeholder="Descrizione della ricetta..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="border p-2 rounded resize-none"
                required
              />
              <textarea
                placeholder="Passaggi dettagliati"
                value={passaggi}
                onChange={(e) => setPassaggi(e.target.value)}
                className="border p-2 rounded resize-none"
                rows={4}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                Salva ricetta
              </button>
            </form>

            <h2 className="text-2xl font-bold mb-4">🍽️ Le ricette</h2>

            <input
              type="text"
              placeholder="Cerca per ingrediente..."
              value={ricercaIngrediente}
              onChange={(e) => setRicercaIngrediente(e.target.value.toLowerCase())}
              className="mb-4 p-2 border rounded w-full"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ricette
                .filter((r) =>
                  r.descrizione?.toLowerCase().includes(ricercaIngrediente)
                )
                .map((r) => (
                  <Link
                    to={`/ricetta/${r.id}`}
                    key={r.id}
                    className="card bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
                  >
                    {r.immagine && (
                      <img
                        src={r.immagine}
                        alt={r.titolo}
                        className="w-full h-40 object-cover rounded"
                      />
                    )}
                    <h3 className="text-lg font-semibold mt-2">{r.titolo}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{r.descrizione}</p>
                    <span className="text-pink-600 text-sm mt-1">
                      ❤️ {r.likes || 0} Mi piace
                    </span>
                  </Link>
                ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-10">
            <button
              onClick={loginConGoogle}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              Accedi con Google
            </button>
            <Link to="/registrazione">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                Registrati con Email
              </button>
            </Link>
            <Link to="/login">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-xl">
                Accedi con Email
              </button>
            </Link>
          </div>
        )}
      </main>

      <footer className="mt-auto bg-white w-full py-4 text-center text-sm text-gray-500 border-t">
        © 2025 Scambio Ricette. Creato con ❤️ da Letizia.
      </footer>
    </div>
  );
}

export default App;
