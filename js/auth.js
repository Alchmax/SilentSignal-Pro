/**
 * --------------------------------------------------------------------------
 * SILENTSIGNAL PRO - AUTHENTICATION & ACCESS CONTROL
 * --------------------------------------------------------------------------
 * This script manages secure administrative sessions using Firebase Auth.
 * It ensures that only authorized personnel can access the command dashboard.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* --------------------------------------------------------------------------
   1. FIREBASE SYSTEM CONFIGURATION
   -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyD_V-Wri82MSrDVXRAqBpOg9QV14B8POCc",
  authDomain: "silentsignal-pro.firebaseapp.com",
  projectId: "silentsignal-pro",
  storageBucket: "silentsignal-pro.firebasestorage.app",
  messagingSenderId: "273442563431",
  appId: "1:273442563431:web:686881547cfb901ede3bc2"
};

/* Explicitly initialize the Firebase Application core */
const firebaseAppInstance = initializeApp(firebaseConfig);

/* Explicitly initialize the Authentication service */
const authService = getAuth(firebaseAppInstance);

/* --------------------------------------------------------------------------
   2. DOM ELEMENT SELECTION (LONG-FORM)
   -------------------------------------------------------------------------- */
const loginFormElement = document.getElementById("loginForm");
const emailInputField = document.getElementById("email");
const passwordInputField = document.getElementById("password");
const errorDisplayContainer = document.getElementById("loginError");
const submitButtonElement = document.getElementById("loginSubmitBtn");

/* --------------------------------------------------------------------------
   3. AUTHENTICATION STATE OBSERVER
   -------------------------------------------------------------------------- */
/**
 * This observer runs automatically whenever the page loads.
 * It checks if a valid session token exists in local storage.
 */
onAuthStateChanged(authService, function(authenticatedUser) {
    if (authenticatedUser) {
        /* STRICT CHECK: Only redirect to dashboard if the user is 
           currently sitting on the LOGIN page. 
        */
        const currentPath = window.location.pathname;
        if (currentPath.includes("login.html") || currentPath.endsWith("/")) {
            console.log("Redirecting authorized user to dashboard...");
            window.location.replace("dashboard.html");
        }
    } else {
        /* STRICT CHECK: Only redirect to login if the user is 
           currently trying to view the DASHBOARD without a session.
        */
        if (window.location.pathname.includes("dashboard.html")) {
            window.location.replace("login.html");
        }
    }
});

/* --------------------------------------------------------------------------
   4. LOGIN EXECUTION LOGIC
   -------------------------------------------------------------------------- */
if (loginFormElement) {
    loginFormElement.addEventListener("submit", function(event) {
        /* Prevent the default browser form submission refresh */
        event.preventDefault();

        /* Reset visual error state before attempting login */
        errorDisplayContainer.style.display = "none";
        
        /* Update UI to show processing state */
        submitButtonElement.disabled = true;
        submitButtonElement.textContent = "VERIFYING CREDENTIALS...";
        submitButtonElement.style.opacity = "0.7";

        /* Extract literal values from the input fields */
        const administrativeEmail = emailInputField.value;
        const administrativePassword = passwordInputField.value;

        /* Execute the Firebase Sign-In Method */
        signInWithEmailAndPassword(authService, administrativeEmail, administrativePassword)
            .then(function(userCredential) {
                /* SUCCESS: User is authenticated */
                const user = userCredential.user;
                console.log("Authentication Successful for: " + user.email);
                
                /* Immediate redirection to the monitoring dashboard */
                window.location.assign("dashboard.html");
            })
            .catch(function(error) {
                /* FAILURE: Handle specific security error codes */
                console.error("Auth Error Code: " + error.code);
                console.error("Auth Error Message: " + error.message);

                /* Re-enable the UI for a second attempt */
                submitButtonElement.disabled = false;
                submitButtonElement.textContent = "INITIALIZE SECURE SESSION";
                submitButtonElement.style.opacity = "1";

                /* Display the error banner to the user */
                errorDisplayContainer.style.display = "block";
                
                /* Explicit feedback based on the error type */
                if (error.code === "auth/invalid-credential") {
                    errorDisplayContainer.textContent = "Access Denied: Invalid Security Credentials.";
                } else if (error.code === "auth/too-many-requests") {
                    errorDisplayContainer.textContent = "Security Lockout: Too many failed attempts. Try later.";
                } else {
                    errorDisplayContainer.textContent = "System Error: Unable to reach authentication server.";
                }
            });
    });
}

/* --------------------------------------------------------------------------
   5. LOGOUT TERMINATION LOGIC
   -------------------------------------------------------------------------- */
/**
 * Global function to terminate the session. 
 * Can be called from the Dashboard logout button.
 */
window.terminateSession = function() {
    signOut(authService)
        .then(function() {
            console.log("Session terminated successfully.");
            window.location.assign("index.html");
        })
        .catch(function(error) {
            console.error("Logout Error: " + error.message);
        });
};