import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🆕 Aggiunta Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAg_XcN6hjUOXq5aic4PalkUDhzrTLg6fM",
  authDomain: "scambio-ricette.firebaseapp.com",
  projectId: "scambio-ricette",
  storageBucket: "scambio-ricette.firebasestorage.app",
  messagingSenderId: "559009180025",
  appId: "1:559009180025:web:47aa72364609eaa75aa7a8"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Autenticazione
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 Firestore
const db = getFirestore(app); // 👉 questa è la connessione al database

export { auth, provider, db };
