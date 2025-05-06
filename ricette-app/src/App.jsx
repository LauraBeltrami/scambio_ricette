import "./App.css";
import { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { Link } from "react-router-dom"; 
import { onAuthStateChanged } from "firebase/auth";
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

function App() {
  const [utente, setUtente] = useState(null);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [immagine, setImmagine] = useState(null);
  const [anteprima, setAnteprima] = useState(null);
  const [ricette, setRicette] = useState([]);

  const loginConGoogle = () => {
    signInWithPopup(auth, provider)
      .then((risultato) => setUtente(risultato.user))
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

    try {
      await addDoc(collection(db, "ricette"), {
        titolo,
        descrizione,
        immagine,
        autore: utente.displayName,
        uid: utente.uid,
        data: serverTimestamp(),
        likes: 0
      });

      setTitolo("");
      setDescrizione("");
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
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRicette(lista);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-yellow-50 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-orange-600 mb-4">🍝 Scambio Ricette</h1>

      {utente ? (
        <>
          <p className="mb-2">👋 Benvenuto, {utente.displayName}</p>
          <button onClick={esci} className="mb-6 px-4 py-2 bg-red-500 text-white rounded-xl">Esci</button>

          <form onSubmit={inviaRicetta} className="bg-white p-4 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4">
            <input type="text" placeholder="Titolo ricetta" value={titolo} onChange={(e) => setTitolo(e.target.value)} className="border p-2 rounded" required />
            <input type="file" accept="image/*" onChange={caricaImmagine} className="border p-2 rounded" />
            {anteprima && <div className="w-full h-40 overflow-hidden rounded"><img src={anteprima} alt="Anteprima" className="w-full h-full object-cover" /></div>}
            <textarea placeholder="Descrizione della ricetta..." value={descrizione} onChange={(e) => setDescrizione(e.target.value)} className="border p-2 rounded resize-none" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl">Salva ricetta</button>
          </form>

          <h2 className="text-2xl mt-8 font-bold">🍽️ Le ricette:</h2>
          <div className="gallery">
          {ricette.map((r) => (
  <Link
    to={`/ricetta/${r.id}`}
    key={r.id}
    className="card hover:shadow-lg transition"
  >
    {r.immagine && (
      <div className="w-full aspect-square overflow-hidden">
        <img src={r.immagine} alt={r.titolo} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-2 flex flex-col">
      <h3 className="text-md font-semibold truncate">{r.titolo}</h3>
      <span className="text-pink-600 text-sm mt-1 text-left">
        ❤️ {r.likes || 0} Mi piace
      </span>
    </div>
  </Link>
))}
          </div>
        </>
      ) : (
        <button onClick={loginConGoogle} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
          Accedi con Google
        </button>
      )}
    </div>
  );
}

export default App;