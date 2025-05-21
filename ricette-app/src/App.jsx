import "./App.css";
import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";
import {
  auth,
  provider,
  db
} from "./firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "firebase/firestore";

// Component Sidebar
function Sidebar({ utente, ricetteUtente }) {
  return (
    <aside className="w-64 bg-white p-4 rounded-xl shadow-md h-fit sticky top-6 self-start">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-orange-600 mb-2">👤 Profilo</h2>
        <p className="text-sm text-gray-800">{utente.displayName || utente.email}</p>
        <p className="text-xs text-gray-500">{utente.email}</p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-orange-600 mb-2">📚 Le mie ricette</h2>
        <ul className="space-y-2">
          {ricetteUtente.length > 0 ? (
            ricetteUtente.map((r) => (
              <li key={r.id}>
                <Link to={`/ricetta/${r.id}`} className="text-blue-600 text-sm hover:underline">
                  🍽️ {r.titolo}
                </Link>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nessuna ricetta ancora</p>
          )}
        </ul>
      </div>
    </aside>
  );
}

function App() {
  const [utente, setUtente] = useState(null);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [passaggi, setPassaggi] = useState("");
  const [immagine, setImmagine] = useState(null);
  const [anteprima, setAnteprima] = useState(null);
  const [ricette, setRicette] = useState([]);
  const [ricercaIngrediente, setRicercaIngrediente] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalita, setModalita] = useState("login"); // login o register

  const descrizioneRef = useRef(null);

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

  const accediConEmail = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => setUtente(res.user))
      .catch((err) => alert("Errore accesso: " + err.message));
  };

  const registratiConEmail = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((res) => setUtente(res.user))
      .catch((err) => alert("Errore registrazione: " + err.message));
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
    if (/<|>|script/.test(titolo + descrizione + passaggi)) {
      return alert("⚠️ Il testo non può contenere tag HTML o script.");
    }

    const titoloPulito = DOMPurify.sanitize(titolo);
    const descrizionePulita = DOMPurify.sanitize(descrizione);
    const passaggiPuliti = DOMPurify.sanitize(passaggi);

    try {
      await addDoc(collection(db, "ricette"), {
        titolo: titoloPulito,
        descrizione: descrizionePulita,
        passaggi: passaggiPuliti,
        immagine,
        autore: utente.displayName || utente.email,
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

  const ricetteUtente = utente
    ? ricette.filter((r) => r.uid === utente.uid)
    : [];

  const autoResizeTextarea = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    if (descrizioneRef.current) {
      autoResizeTextarea(descrizioneRef.current);
    }
  }, [descrizione]);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-600">🍝 Scambio Ricette</h1>
        {utente && (
          <div className="flex items-center gap-4">
            <span className="text-gray-800">👋 {utente.displayName || utente.email}</span>
            <button onClick={esci} className="px-4 py-2 bg-red-500 text-white rounded-xl">
              Esci
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto p-6 w-full max-w-7xl flex gap-6">
        {utente ? (
          <>
            <Sidebar utente={utente} ricetteUtente={ricetteUtente} />
            <div className="flex-1">
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
                  placeholder="Ingredienti"
                  value={descrizione}
                  ref={descrizioneRef}
                  onChange={(e) => {
                    setDescrizione(e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  className="border p-2 rounded resize-none overflow-hidden"
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
                onChange={(e) =>
                  setRicercaIngrediente(e.target.value.toLowerCase())
                }
                className="mb-4 p-2 border rounded w-full"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
                      <p className="text-sm text-gray-700 mb-2">
                        {r.descrizione.slice(0, 100)}...
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          mettiLike(r.id, r.likes);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        ❤️ {r.likes} like
                      </button>
                    </Link>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center w-full mt-10 max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">
              {modalita === "login" ? "Accedi" : "Registrati"} con email
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2 p-2 border rounded w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            />
            <button
              onClick={modalita === "login" ? accediConEmail : registratiConEmail}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl w-full mb-2"
            >
              {modalita === "login" ? "Accedi" : "Registrati"}
            </button>
            <button
              onClick={loginConGoogle}
              className="bg-red-500 text-white px-6 py-2 rounded-xl w-full"
            >
              Accedi con Google
            </button>
            <p className="mt-4 text-sm">
              {modalita === "login" ? "Non hai un account?" : "Hai già un account?"}{" "}
              <button
                onClick={() => setModalita(modalita === "login" ? "register" : "login")}
                className="text-blue-600 underline"
              >
                {modalita === "login" ? "Registrati" : "Accedi"}
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
