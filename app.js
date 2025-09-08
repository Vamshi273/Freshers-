// app.js — Freshers Day Voting System with Admin-only results + Reset

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  set
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:4d97f2bfb667503d36f626"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === Voting Options ===
const males = [
  { name: "Prabhas", img: "prabhas_latest_photos_2807170354_03.jpg" },
  { name: "Appu", img: "517EDEYjsHL.jpg" },
  { name: "Chiranjeevi", img: "https://via.placeholder.com/200x250?text=Vikram" },
  { name: "Ramcharan", img: "MV5BZWY1NTQyMWItMWU2OS00NWMwLWFlN2MtMDZlYzEwZmU3MTYzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" }
];

const females = [
  { name: "Samantha", img: "samantha-ruth-prabhu-stills-photos-pictures-2008.jpg" },
  { name: "Sai Pallavi", img: "HD-wallpaper-sai-pallavi-fidaa-love-story-naga-chaitanya-sai-pallavi-shekhar-kammula-tollywood.jpg" },
  { name: "Sreelela", img: "Sreeleela-m-1.jpg" },
  { name: "Kajal", img: "a4c87cf5b9871dd67ebc6df0627d000a.jpg" }
];

const OPTIONS = [...males, ...females];
const DB_PATH = "votes";
const LS_KEY = "freshers_vote_cast";

// === Render options ===
function renderOptions(isAdmin = false) {
  const container = document.getElementById("options");
  container.innerHTML = "";

  OPTIONS.forEach(opt => {
    const safeId = opt.name.replace(/\s+/g, "_");
    const div = document.createElement("div");
    div.className = "option";
    div.innerHTML = `
      <img src="${opt.img}" alt="${opt.name}">
      <h2>${opt.name}</h2>
      <button id="btn-${safeId}">Vote</button>
      ${isAdmin ? `<div class="count" id="count-${safeId}">0</div>` : ""}
    `;
    container.appendChild(div);

    document.getElementById(`btn-${safeId}`).addEventListener("click", () => vote(safeId, opt.name));
  });

  // Show Reset button only for admin
  if (isAdmin) {
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "🔄 Reset All Votes";
    resetBtn.className = "reset-btn";
    resetBtn.addEventListener("click", resetVotes);
    container.appendChild(resetBtn);
  }
}

// === Voting ===
function vote(optionId, optionName) {
  const voted = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (voted.done) {
    alert(`You already voted for "${voted.option}".`);
    return;
  }

  if (!confirm(`Vote for ${optionName}?`)) return;

  const voteRef = ref(db, `${DB_PATH}/${optionId}`);
  runTransaction(voteRef, (current) => (current || 0) + 1)
    .then(() => {
      localStorage.setItem(LS_KEY, JSON.stringify({ done: true, option: optionName }));
      disableAllButtons();
      alert("✅ Your vote was recorded!");
    })
    .catch(err => {
      console.error(err);
      alert("❌ Error recording vote.");
    });
}

// === Disable after voting ===
function disableAllButtons() {
  OPTIONS.forEach(opt => {
    const safeId = opt.name.replace(/\s+/g, "_");
    const btn = document.getElementById(`btn-${safeId}`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Voted";
    }
  });
}

// === Realtime updates (only for admin) ===
function startRealtimeUpdates() {
  OPTIONS.forEach(opt => {
    const safeId = opt.name.replace(/\s+/g, "_");
    const countRef = ref(db, `${DB_PATH}/${safeId}`);
    onValue(countRef, (snap) => {
      const count = snap.val() || 0;
      const el = document.getElementById(`count-${safeId}`);
      if (el) el.textContent = count;
    });
  });
}

// === Reset votes (Admin only) ===
function resetVotes() {
  if (!confirm("⚠️ Are you sure you want to reset all votes?")) return;

  OPTIONS.forEach(opt => {
    const safeId = opt.name.replace(/\s+/g, "_");
    const voteRef = ref(db, `${DB_PATH}/${safeId}`);
    set(voteRef, 0); // Reset each vote to 0
  });

  alert("✅ All votes have been reset!");
}

// === Init ===
window.addEventListener("DOMContentLoaded", () => {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  renderOptions(isAdmin);

  if (isAdmin) {
    startRealtimeUpdates();
  }

  const voted = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (voted.done) disableAllButtons();
});

// === Admin Login ===
window.adminLogin = function () {
  const pass = prompt("Enter admin password:");
  if (pass === "admin123") { // change this password!
    sessionStorage.setItem("isAdmin", "true");
    location.reload();
  } else {
    alert("❌ Wrong password!");
  }
};