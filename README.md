# 🛡️ SilentSignal PRO 
**Real-Time Campus Emergency Response System**

SilentSignal PRO is a high-performance emergency communication infrastructure designed to bridge the gap between students and campus security. Using room-level QR-encoded terminals and a centralized Command Center, it ensures that help is dispatched in seconds, not minutes.

---

## 🚀 System Architecture
* **Student Terminal:** A lightweight, mobile-optimized reporting interface accessible via QR codes.
* **Command Center:** A real-time administrative dashboard featuring visual pulse alerts and audio notifications.
* **Database Engine:** Powered by Google Firebase Firestore for sub-second data synchronization.
* **Asset Generator:** An internal utility for generating location-specific encrypted reporting links.

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Glassmorphism UI), JavaScript (ES6+ Modules)
* **Backend:** Firebase Authentication & Cloud Firestore
* **Design:** Plus Jakarta Sans Typography, CSS Keyframe Animations
* **APIs:** QuickChart QR Engine

---

## 👥 The Development Team
| Name | Role |
| :--- | :--- |
| **Nakshatra Roy** | **Lead Developer & System Architect** (Full-stack coding, Firebase integration, UI/UX Design) |
| **Yashpal Singh Rajpurohit** | **Project Planning & Strategic Documentation** |
| **Divyanshu Bhati** | **PPT Presentation & Case Study Analysis** |
| **Sumit Bairwa** | **Presentation Research & User Flow Planning** |

---

## 📋 Key Features
* **Instant Sync:** Alerts appear on the dashboard instantly without page refreshes using Firestore Snapshots.
* **Visual & Audio Cues:** The dashboard pulses red and emits a high-frequency beep when a critical alert is active.
* **Location Precision:** Each terminal is tied to a specific room ID, removing the guesswork for security teams.
* **Resolution Logging:** A dedicated sidebar tracks resolved incidents to maintain a history of campus safety.
* **Secure Access:** Admin panel is protected via Firebase Auth, ensuring only authorized personnel can clear alerts.

---

## 🔧 Installation & Deployment
1. **Clone the repository** to your local machine.
2. **Configure Firebase:** Replace the `firebaseConfig` object in `js/dashboard.js` and `js/report.js` with your own project credentials.
3. **Database Rules:** Deploy the provided Firestore Security Rules to protect your data.
4. **Hosting:** Run `firebase deploy` to push the system to a live `.web.app` or `.firebaseapp.com` domain.

---

## 📜 Security Disclaimer
SilentSignal PRO is designed as a secondary emergency assistance tool. In case of life-threatening emergencies, users should always contact local emergency services (911/112) first.

---
© 2026 SilentSignal PRO Team. Built with ❤️ for Campus Safety.