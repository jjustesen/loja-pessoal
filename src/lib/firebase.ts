import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsG0qutYAFB5tCqRScnbH3PwhFHkSO0Kw",
  authDomain: "luz-da-moda.firebaseapp.com",
  databaseURL: "https://luz-da-moda-default-rtdb.firebaseio.com",
  projectId: "luz-da-moda",
  storageBucket: "luz-da-moda.firebasestorage.app",
  messagingSenderId: "603443022132",
  appId: "1:603443022132:web:ca15dc95c347c12fc47d61",
  measurementId: "G-VZYDJPKRPF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
