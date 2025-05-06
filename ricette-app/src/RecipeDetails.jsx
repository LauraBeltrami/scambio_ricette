import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function RecipeDetails() {
  const { id } = useParams(); // 👈 prende l'ID dalla URL
  const [ricetta, setRicetta] = useState(null);

  useEffect(() => {
    const fetchRicetta = async () => {
      try {
        const docRef = doc(db, "ricette", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRicetta(docSnap.data());
        } else {
          console.error("Ricetta non trovata!");
        }
      } catch (err) {
        console.error("Errore caricamento:", err);
      }
    };

    fetchRicetta();
  }, [id]);

  if (!ricetta) {
    return <p className="p-4 text-center">Caricamento ricetta...</p>;
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-4">
        <Link to="/" className="text-blue-600 underline mb-4 inline-block">← Torna indietro</Link>
        {ricetta.immagine && (
          <img src={ricetta.immagine} alt={ricetta.titolo} className="w-full rounded mb-4" />
        )}
        <h1 className="text-2xl font-bold mb-2">{ricetta.titolo}</h1>
        <p className="text-gray-700 mb-2">{ricetta.descrizione}</p>
        <p className="text-sm text-gray-500">👨‍🍳 {ricetta.autore}</p>
        <p className="text-sm text-gray-500">❤️ {ricetta.likes || 0} Mi piace</p>
      </div>
    </div>
  );
}

export default RecipeDetails;