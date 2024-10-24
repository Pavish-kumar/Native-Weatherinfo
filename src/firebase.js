// Import Firebase modules from the JavaScript SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcamF3fwe762_z5RazBTfkBkbmCxcQSTw",
  authDomain: "weather-app-ee356.firebaseapp.com",
  projectId: "weather-app-ee356",
  storageBucket: "weather-app-ee356.appspot.com", // corrected the URL format
  messagingSenderId: "412228337615",
  appId: "1:412228337615:web:161abb503f2923acb11cba",
  measurementId: "G-RRKJ0DTR26"
};

// Initialize Firebase if it hasn't been initialized already
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export for use
const auth = getAuth(app);

export { app, auth };
