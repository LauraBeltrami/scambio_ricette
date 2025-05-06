import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function DettaglioRicetta() {
  const { id } = useParams();
  const [ricetta, setRicetta] = useState(null);

  useEffect(() => {
    const fetchRicetta = async () => {
      const docRef = doc(db, "ricette", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRicetta(docSnap.data());
      } else {
        console.log("Nessuna ricetta trovata");
      }
    };
    fetchRicetta();
  }, [id]);

  if (!ricetta) return <p>Caricamento...</p>;

  return (
    <div className="min-h-screen p-6 bg-yellow-50 flex flex-col items-center">
      <Link to="/" className="mb-4 text-blue-600 underline">← Torna alla lista</Link>
      <div className="bg-white p-6 rounded-xl shadow-md max-w-xl w-full">
        {ricetta.immagine && (
          <img
            src={ricetta.immagine}
            alt={ricetta.titolo}
            className="w-full h-60 object-cover rounded mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-orange-700">{ricetta.titolo}</h1>
        <p className="text-gray-700 mt-2">{ricetta.descrizione}</p>
        {/* In futuro puoi aggiungere qui: ingredienti, passaggi, video ecc. */}
        <small className="text-gray-500 block mt-4">👩‍🍳 {ricetta.autore || "Anonimo"}</small>
      </div>
    </div>
  );
}

export default DettaglioRicetta;
