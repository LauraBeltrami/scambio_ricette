import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useEffect, useState } from "react";

function RecipeDetails() {
  const { id } = useParams(); // Ottieni l'id dalla URL
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "ricette", id); // Riferimento al documento di Firestore
        const docSnap = await getDoc(docRef); // Ottieni il documento

        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() }); // Salva i dati della ricetta
        } else {
          console.error("Ricetta non trovata");
        }
      } catch (err) {
        console.error("Errore nel caricamento della ricetta:", err);
      }
    };

    fetchRecipe(); // Chiamata per ottenere la ricetta
  }, [id]); // Ricarica ogni volta che l'id cambia

  if (!recipe) {
    return <p className="text-center mt-10">Caricamento in corso...</p>; // Mostra un messaggio di caricamento
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
      {recipe.immagine && (
        <img
          src={recipe.immagine}
          alt={recipe.titolo}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
      <h2 className="text-2xl font-bold text-orange-600 mb-2">{recipe.titolo}</h2>
      <p className="text-gray-700 mb-4">
        👨‍🍳 Autore: <span className="font-semibold">{recipe.autore}</span>
      </p>

      <h3 className="text-lg font-semibold mb-1">📝 Ingredienti:</h3>
      <p className="mb-4 whitespace-pre-line">{recipe.descrizione}</p> {/* Mostra gli ingredienti */}

      <h3 className="text-lg font-semibold mb-1">📋 Passaggi:</h3>
      <p className="whitespace-pre-line">{recipe.passaggi || "Nessun passaggio disponibile."}</p> {/* Mostra i passaggi */}
    </div>
  );
}

export default RecipeDetails;
