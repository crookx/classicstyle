
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDz6s2Od9e3rEtNYf-qoJMQlarahurGFRc",
  authDomain: "clothstore-25546.firebaseapp.com",
  projectId: "clothstore-25546",
  storageBucket: "clothstore-25546.appspot.com", // Corrected .firebasestorage.app to .appspot.com if that's the standard
  messagingSenderId: "94559439162",
  appId: "1:94559439162:web:e934ad49d374df35e8a803",
  measurementId: "G-3PS1G3B18P"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };
