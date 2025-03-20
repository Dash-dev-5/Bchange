import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv0u1TK7NtL6m_HvXwBPsdY9byFrRcvpo",
  authDomain: "scan-isipa.firebaseapp.com",
  projectId: "scan-isipa",
  storageBucket: "scan-isipa.appspot.com", // Correction ici
  messagingSenderId: "584483840458",
  appId: "1:584483840458:web:12eaca84edf3a22ff82f33",
  measurementId: "G-TFCH0MPCM2"
};

// Vérifie si Firebase est déjà initialisé avant d'exécuter initializeApp
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firestore
export const db = getFirestore(app);
