import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Fonction pour enregistrer des données
export async function saveData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document ajouté avec ID: ", docRef.id);
  } catch (e) {
    console.error("Erreur lors de l'ajout du document: ", e);
  }
}

// Fonction pour récupérer des données
export async function getData(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Erreur lors de la récupération des documents: ", e);
    return [];
  }
}
