// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration (read from .env with fallback)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDBn5VJ1lsg5dndmpPHcwuAGIvT452hdIY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wandr-efa2e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wandr-efa2e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wandr-efa2e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "977835081386",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:977835081386:web:e814c554b3f4a26cf3dad3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NQSV2SKMR9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
