
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwEjlStXwLlZNuF1HPaCvi5Un0nV8LYqw",
  authDomain: "davidproject-ef155.firebaseapp.com",
  projectId: "davidproject-ef155",
  storageBucket: "davidproject-ef155.firebasestorage.app",
  messagingSenderId: "388713158700",
  appId: "1:388713158700:web:05919ba5358c77a62e9989"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
