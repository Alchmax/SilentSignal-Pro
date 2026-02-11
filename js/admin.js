/**
 * admin.js - SilentSignal PRO Command Center Logic
 * Handles real-time streaming, auto-escalation, and analytics.
 */

import { db, auth } from './firebase-config.js';
import { 
    collection, 
    query, 
    onSnapshot, 
    orderBy, 
    updateDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --------------------------------------------------------------------------
// 1. SECURITY SHIELD
// --------------------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Force unauthenticated users back to login
        window.location.href = 'login.html';
    }
});

// Logout implementation
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
}

// --------------------------------------------------------------------------
// 2. DATA STATE & CORE CONSTANTS
// --------------------------------------------------------------------------
const alertFeed = document.getElementById('alertFeed');
const logsTableBody = document.getElementById('logsTableBody');
const alertSound = document.getElementById('alertSound');

// Analytics Counters
let stats = {
    total: 0,
    pending: 0,
    roomCounts: {}
};

// Internal cache to store documents for view switching
let cachedDocs = [];

// --------------------------------------------------------------------------
// 3. THE REAL-TIME ENGINE (Firestore Listener)
// --------------------------------------------------------------------------
const alertsQuery = query(collection(db, "alerts"), orderBy("timestamp", "desc"));

onSnapshot(alertsQuery, (snapshot) => {
    // Clear UI and reset stats for a fresh calculation
    alertFeed.innerHTML = '';
    logsTableBody.innerHTML = '';
    stats = { total: 0, pending: 0, roomCounts: {} };
    cachedDocs = snapshot.docs;

    snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        // A. Run Analytics
        processAnalytics(data);

        // B. Check for Auto-Escalation (Older than 120s and still Pending)
        checkEscalation(id, data);

        // C. Render to Live Feed (Only if not resolved)
        if (data.status !== "Resolved") {
            renderAlertCard(id, data);
        }

        // D. Render to History Logs
        renderLogRow(data);
    });

    // E. Update Dashboard Counters
    updateDashboardUI();

    // F. Audio Alert for New Incoming Emergencies
    const lastChange = snapshot.docChanges()[0];
    if (lastChange && lastChange.type === "added") {
        playAlertSound();
    }
});

// --------------------------------------------------------------------------
// 4. UI RENDERING FUNCTIONS
// --------------------------------------------------------------------------

/**
 * Creates the glowing alert cards for the Live Monitor
 */
function renderAlertCard(id, data) {
    const timeAgo = data.timestamp ? moment(data.timestamp.toDate()).fromNow() : "Just now";
    
    const card = document.createElement('div');
    card.className = `alert-card ${data.escalated ? 'escalated' : ''}`;
    // Inline styling for the specific color border
    card.style.borderLeft = `6px solid ${data.severityColor || '#38bdf8'}`;

    card.innerHTML = `
        <div style="display: flex; flex-direction: row; align-items: center; gap: 20px;">
            <div style="background-color: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; font-size: 24px;">
                ${getIcon(data.type)}
            </div>
            <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 800; color: ${data.severityColor}; font-size: 14px; text-transform: uppercase;">${data.type}</span>
                    <span style="color: #64748b; font-size: 12px;">ZONE: ${data.room}</span>
                </div>
                <p style="margin-top: 4px; font-size: 15px; color: #cbd5e1;">${data.message}</p>
            </div>
        </div>
        <div style="text-align: right;">
            <p style="font-size: 11px; color: #64748b; margin-bottom: 12px;">${timeAgo}</p>
            <button onclick="resolveAlert('${id}')" style="background-color: #ffffff; color: #020617; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: 0.2s;">
                MARK RESOLVED
            </button>
        </div>
    `;
    alertFeed.appendChild(card);
}

/**
 * populates the tabular logs in the "Incident Logs" tab
 */
function renderLogRow(data) {
    const timeString = data.timestamp ? moment(data.timestamp.toDate()).format('HH:mm:ss [on] MMM D') : "---";
    const statusColor = data.status === 'Resolved' ? '#22c55e' : '#ef4444';
    
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid rgba(255,255,255,0.03)";
    
    row.innerHTML = `
        <td style="padding: 18px; font-size: 13px; color: #94a3b8;">${timeString}</td>
        <td style="padding: 18px; font-size: 13px; font-weight: 700;">${data.room}</td>
        <td style="padding: 18px; font-size: 13px; color: ${data.severityColor}">${data.type}</td>
        <td style="padding: 18px;">
            <span style="background-color: ${statusColor}15; color: ${statusColor}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                ${data.status}
            </span>
        </td>
    `;
    logsTableBody.appendChild(row);
}

// --------------------------------------------------------------------------
// 5. ACTION HANDLERS (EXPOSED TO WINDOW)
// --------------------------------------------------------------------------

/**
 * Sets an incident status to Resolved in Firestore
 */
window.resolveAlert = async (docId) => {
    try {
        const docRef = doc(db, "alerts", docId);
        await updateDoc(docRef, {
            status: "Resolved",
            escalated: false
        });
    } catch (error) {
        console.error("Error resolving alert:", error);
    }
};

/**
 * Logic to escalate if response time exceeds 2 minutes
 */
async function checkEscalation(id, data) {
    if (data.status === "Pending" && !data.escalated && data.timestamp) {
        const alertTime = data.timestamp.toMillis();
        const currentTime = Date.now();
        
        // 120,000 milliseconds = 2 minutes
        if (currentTime - alertTime > 120000) {
            const docRef = doc(db, "alerts", id);
            await updateDoc(docRef, { 
                escalated: true,
                status: "CRITICAL"
            });
        }
    }
}

// --------------------------------------------------------------------------
// 6. ANALYTICS & UTILS
// --------------------------------------------------------------------------

function processAnalytics(data) {
    stats.total++;
    if (data.status !== "Resolved") stats.pending++;
    
    // Count room occurrences to find "Primary Zone"
    stats.roomCounts[data.room] = (stats.roomCounts[data.room] || 0) + 1;
}

function updateDashboardUI() {
    document.getElementById('statTotal').innerText = stats.total;
    document.getElementById('statPending').innerText = stats.pending;
    
    // Calculate the room with the most alerts
    const sortedRooms = Object.entries(stats.roomCounts).sort((a, b) => b[1] - a[1]);
    const topRoom = sortedRooms.length > 0 ? sortedRooms[0][0] : "None";
    document.getElementById('statCommon').innerText = topRoom;
}

function getIcon(type) {
    switch(type) {
        case 'Medical': return '🚑';
        case 'Harassment': return '⚠️';
        case 'Security': return '🛡️';
        default: return '❓';
    }
}

function playAlertSound() {
    // Most browsers require a user interaction before playing sound
    if (alertSound) {
        alertSound.play().catch(error => {
            console.warn("Audio playback prevented. Interact with dashboard to enable sounds.");
        });
    }
}