// app.js — Freshers Day Voting System

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// ✅ Your Firebase config (from console)
const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:4d97f2bfb667503d36f626"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ======= Voting Options =======
// Change labels here if you want more teams
const OPTIONS = [
  { id: "teamA", label: "Team A" },
  { id: "teamB", label: "Team B" }
];

// Database path where votes are stored
const DB_PATH = "votes";

// LocalStorage key to prevent multiple votes from same browser
const LS_KEY = "freshers_vote_cast";

// === Build Options in HTML ===
function renderOptions() {
  const container = document.getElementById("options");
  container.innerHTML = "";
  OPTIONS.forEach(opt => {
    const div = document.createElement("div");
    div.className = "option";

    div.innerHTML = `
      <h2>${opt.label}</h2>
      <button id="btn-${opt.id}">Vote</button>
      <div class="count" id="count-${opt.id}">0</div>
    `;
    container.appendChild(div);

    // Add click listener
    document.getElementById(`btn-${opt.id}`).addEventListener("click", () => vote(opt.id));
  });
}

// === Voting Function ===
function vote(optionId) {
  const voted = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (voted.done) {
    alert(`You already voted for "${voted.option}". One vote per browser.`);
    return;
  }

  if (!confirm("Confirm your vote?")) return;

  const voteRef = ref(db, `${DB_PATH}/${optionId}`);
  runTransaction(voteRef, (current) => {
    return (current || 0) + 1;
  }).then(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ done: true, option: optionId }));
    disableAllButtons();
    alert("✅ Thanks! Your vote was recorded.");
  }).catch(err => {
    console.error(err);
    alert("❌ Vote failed. Try again.");
  });
}

// === Disable Buttons After Vote ===
function disableAllButtons() {
  OPTIONS.forEach(opt => {
    const btn = document.getElementById(`btn-${opt.id}`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Voted";
    }
  });
}

// === Listen for Realtime Updates ===
function startRealtimeUpdates() {
  OPTIONS.forEach(opt => {
    const countRef = ref(db, `${DB_PATH}/${opt.id}`);
    onValue(countRef, (snap) => {
      const count = snap.val() || 0;
      document.getElementById(`count-${opt.id}`).textContent = count;
    });
  });
}

// === Initialize on Load ===
window.addEventListener("DOMContentLoaded", () => {
  renderOptions();
  startRealtimeUpdates();

  const voted = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (voted.done) {
    disableAllButtons();
  }
});