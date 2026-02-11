// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_V-Wri82MSrDVXRAqBpOg9QV14B8POCc",
  authDomain: "silentsignal-pro.firebaseapp.com",
  projectId: "silentsignal-pro",
  storageBucket: "silentsignal-pro.firebasestorage.app",
  messagingSenderId: "273442563431",
  appId: "1:273442563431:web:686881547cfb901ede3bc2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, serverTimestamp };