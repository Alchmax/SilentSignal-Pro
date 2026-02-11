/**
 * --------------------------------------------------------------------------
 * SILENTSIGNAL PRO - FIRESTORE EMERGENCY ENGINE
 * --------------------------------------------------------------------------
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* --------------------------------------------------------------------------
   1. FIREBASE CONFIGURATION
   -------------------------------------------------------------------------- */
const firebaseConfig = {
    apiKey: "AIzaSyD_V-Wri82MSrDVXRAqBpOg9QV14B8POCc",
    authDomain: "silentsignal-pro.firebaseapp.com",
    projectId: "silentsignal-pro",
    storageBucket: "silentsignal-pro.firebasestorage.app",
    messagingSenderId: "273442563431",
    appId: "1:273442563431:web:686881547cfb901ede3bc2"
    // Note: Firestore does not require a databaseURL property
};

/* Explicit initialization */
const firebaseApp = initializeApp(firebaseConfig);

/* Initialize Firestore Service */
const db = getFirestore(firebaseApp);

/* --------------------------------------------------------------------------
   2. DOM SELECTION & LOCATION LOGIC
   -------------------------------------------------------------------------- */
const roomDisplayElement = document.getElementById("roomDisplay");
const extraNoteElement = document.getElementById("extraNote");
const successMessageElement = document.getElementById("successMessage");

function getRoomFromURL() {
    const urlParameters = new URLSearchParams(window.location.search);
    const roomName = urlParameters.get("room");
    if (roomName) {
        return roomName.replace(/_/g, " ");
    }
    return "General Campus";
}

const currentRoomLocation = getRoomFromURL();
if (roomDisplayElement) {
    roomDisplayElement.textContent = "ZONE: " + currentRoomLocation;
}

/* --------------------------------------------------------------------------
   3. FIRESTORE DATA TRANSMISSION
   -------------------------------------------------------------------------- */
window.sendAlert = function(incidentType) {
    console.log("Firestore: Initializing document creation for " + incidentType);

    const userNoteValue = extraNoteElement.value;

    /* Construct the Firestore Document Data */
    const incidentData = {
        type: String(incidentType),
        location: String(currentRoomLocation),
        note: String(userNoteValue),
        status: "critical",
        timestamp: serverTimestamp(), // Firestore-specific server timestamp
        acknowledged: false
    };

    /**
     * In Firestore, we 'addDoc' to a 'collection'.
     * This is the equivalent of 'push' in Realtime Database.
     */
    const incidentsCollection = collection(db, "incidents");

    addDoc(incidentsCollection, incidentData)
        .then(function(docRef) {
            console.log("Firestore Document Written with ID: " + docRef.id);
            displaySuccessUI();
        })
        .catch(function(error) {
            console.error("Firestore Write Error: ", error);
            alert("Database Error: " + error.message);
        });
};

/* --------------------------------------------------------------------------
   4. UI FEEDBACK
   -------------------------------------------------------------------------- */
function displaySuccessUI() {
    successMessageElement.style.display = "block";
    extraNoteElement.disabled = true;
    
    const buttons = document.querySelectorAll(".emergency-btn");
    buttons.forEach(function(btn) {
        btn.disabled = true;
        btn.style.filter = "grayscale(1)";
    });

    if ("vibrate" in navigator) {
        navigator.vibrate(200);
    }
}