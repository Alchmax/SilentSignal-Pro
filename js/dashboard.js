/**
 * --------------------------------------------------------------------------
 * SILENTSIGNAL PRO - COMMAND CENTER CORE ENGINE
 * --------------------------------------------------------------------------
 * Features: 
 * - Multi-stream Firestore Listeners (Active vs. History)
 * - CSS Class Injection for Red Alert Pulse
 * - Online Audio Loop (Emergency Beep)
 * - Safe Firebase Initialization
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    updateDoc, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* --------------------------------------------------------------------------
   1. FIREBASE CONFIGURATION & SAFE INIT
   -------------------------------------------------------------------------- */
const firebaseConfig = {
    apiKey: "AIzaSyD_V-Wri82MSrDVXRAqBpOg9QV14B8POCc",
    authDomain: "silentsignal-pro.firebaseapp.com",
    projectId: "silentsignal-pro",
    storageBucket: "silentsignal-pro.firebasestorage.app",
    messagingSenderId: "273442563431",
    appId: "1:273442563431:web:686881547cfb901ede3bc2"
};

// Check if app already initialized by the HTML guard to prevent crash
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

/* --------------------------------------------------------------------------
   2. AUDIO ENGINE (Online Source)
   -------------------------------------------------------------------------- */
// High-intensity short beep from Google CDN
const emergencyBeep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
emergencyBeep.loop = true; // Loop the sound while alerts are active

/* --------------------------------------------------------------------------
   3. DOM ELEMENT SELECTION
   -------------------------------------------------------------------------- */
const incidentFeed = document.getElementById("incidentFeed");
const historyFeed = document.getElementById("historyFeed");
const activeCountDisplay = document.getElementById("activeCount");
const debugDot = document.getElementById("debugDot");
const debugText = document.getElementById("debugText");
const dashboardBody = document.body;

/* --------------------------------------------------------------------------
   4. AUTHENTICATION MONITORING
   -------------------------------------------------------------------------- */
onAuthStateChanged(auth, function(user) {
    if (user) {
        const emailLabel = document.getElementById("adminEmailDisplay");
        if (emailLabel) emailLabel.textContent = user.email;
    } else {
        window.location.replace("login.html");
    }
});

window.terminateSession = function() {
    signOut(auth).then(() => window.location.replace("login.html"));
};

/* --------------------------------------------------------------------------
   5. MAIN INCIDENT STREAM (ACTIVE ALERTS)
   -------------------------------------------------------------------------- */
const activeQuery = query(
    collection(db, "incidents"),
    where("status", "==", "critical"),
    orderBy("timestamp", "desc")
);

/**
 * The onSnapshot listener handles real-time visual and audio triggers.
 */
onSnapshot(activeQuery, function(snapshot) {
    // UI Housekeeping
    incidentFeed.innerHTML = "";
    const activeCount = snapshot.size;
    
    // Update Counter Display
    if (activeCountDisplay) activeCountDisplay.textContent = String(activeCount);

    if (activeCount > 0) {
        // --- EMERGENCY MODE ACTIVATED ---
        console.log(`[ALERT] ${activeCount} Active Signal(s) Detected.`);
        
        // 1. Add Visual Pulse to the Body
        dashboardBody.classList.add("emergency-pulse");
        
        // 2. Play Alarm Sound
        emergencyBeep.play().catch(() => {
            console.warn("Audio waiting for user to click on the page once.");
        });

        // 3. Update Debugger
        if (debugDot) debugDot.style.backgroundColor = "#ef4444";
        if (debugText) debugText.textContent = "EMERGENCY: RESPONSE REQUIRED";

        // 4. Render Active Cards
        snapshot.forEach(function(docSnap) {
            renderActiveCard(docSnap.id, docSnap.data());
        });

    } else {
        // --- NORMAL OPERATIONS ---
        console.log("[STATUS] System Clear. No signals.");
        
        // 1. Remove Visual Pulse
        dashboardBody.classList.remove("emergency-pulse");
        
        // 2. Silence Audio
        emergencyBeep.pause();
        emergencyBeep.currentTime = 0;

        // 3. Update Debugger
        if (debugDot) debugDot.style.backgroundColor = "#22c55e";
        if (debugText) debugText.textContent = "Live Connection: Secure";

        renderEmptyState();
    }
}, function(error) {
    console.error("Critical Stream Error:", error.message);
    if (error.message.includes("index")) {
        console.error("MISSING INDEX URL:", error.message.split('here: ')[1]);
    }
});

/* --------------------------------------------------------------------------
   6. HISTORY STREAM (SIDEBAR)
   -------------------------------------------------------------------------- */
const historyQuery = query(
    collection(db, "incidents"),
    where("status", "==", "resolved"),
    orderBy("timestamp", "desc"),
    limit(15)
);

onSnapshot(historyQuery, function(snapshot) {
    if (!historyFeed) return;
    historyFeed.innerHTML = "";

    snapshot.forEach(function(docSnap) {
        const data = docSnap.data();
        const div = document.createElement("div");
        div.style.padding = "15px";
        div.style.backgroundColor = "rgba(255,255,255,0.03)";
        div.style.border = "1px solid rgba(255,255,255,0.08)";
        div.style.borderRadius = "12px";
        div.style.marginBottom = "10px";

        div.innerHTML = `
            <div style="font-size: 13px; font-weight: 800; color: #f1f5f9;">${data.location}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase;">
                ${data.type} • RESOLVED
            </div>
        `;
        historyFeed.appendChild(div);
    });
});

/* --------------------------------------------------------------------------
   7. UI COMPONENT GENERATORS
   -------------------------------------------------------------------------- */
function renderActiveCard(id, data) {
    const card = document.createElement("div");
    card.className = "glass-panel active-card-blink";
    card.style.padding = "24px";
    card.style.display = "flex";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    card.style.borderLeft = "8px solid #ef4444";
    card.style.borderRadius = "16px";

    card.innerHTML = `
        <div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size: 20px; font-weight: 900; color: #ffffff;">${data.location}</span>
                <span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase;">${data.type}</span>
            </div>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Context: <span style="color:#ffffff;">${data.note || 'No notes.'}</span></p>
        </div>
        <button onclick="resolveIncident('${id}')" style="background:#22c55e; color:white; border:none; padding:12px 24px; border-radius:10px; font-weight:800; cursor:pointer; font-size:12px; transition:0.2s;">
            RESOLVE SIGNAL
        </button>
    `;
    incidentFeed.appendChild(card);
}

function renderEmptyState() {
    incidentFeed.innerHTML = `
        <div class="glass-panel" style="padding: 80px; text-align: center; border-style: dashed; border-color: rgba(255,255,255,0.05);">
            <div style="font-size: 32px; margin-bottom: 15px; opacity: 0.3;">📡</div>
            <p style="color: #475569; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">No Active Incidents Detected</p>
        </div>
    `;
}

/* --------------------------------------------------------------------------
   8. GLOBAL ACTIONS
   -------------------------------------------------------------------------- */
window.resolveIncident = function(docId) {
    const docRef = doc(db, "incidents", docId);
    updateDoc(docRef, {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
        acknowledged: true
    }).catch(err => console.error("Database update failed:", err));
};