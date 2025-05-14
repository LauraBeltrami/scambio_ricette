// Sidebar.js
import { Link } from "react-router-dom";

function Sidebar({ utente, ricetteUtente }) {
  return (
    <aside className="w-64 bg-white p-4 rounded-xl shadow-md h-fit sticky top-6 self-start">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-orange-600 mb-2">👤 Profilo</h2>
        <p className="text-sm text-gray-800">{utente.displayName}</p>
        <p className="text-xs text-gray-500">{utente.email}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-orange-600 mb-2">📚 Le mie ricette</h2>
        <ul className="space-y-2">
          {ricetteUtente.length > 0 ? (
            ricetteUtente.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/ricetta/${r.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
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

export default Sidebar;
