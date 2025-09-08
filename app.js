// app.js (ES module) --------------------------------------------------
// This file uses Firebase Realtime Database (modular SDK).
// 1) Create a Firebase project and enable Realtime Database (in test mode or configure rules).
// 2) Replace firebaseConfig below with your project's config.
// 3) Modify `OPTIONS` to the choices you want voters to pick from.
// 4) Put index.html, styles.css, app.js in same folder and open index.html in a static host (or live server).

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

/* ======= CONFIG - Replace with your Firebase project's config =======
   You can find this in Firebase console -> Project settings -> Your apps -> SDK config
   Example:
   const firebaseConfig = {
     apiKey: "ABC...",
     authDomain: "project-id.firebaseapp.com",
     databaseURL: "https://project-id-default-rtdb.firebaseio.com",
     projectId: "project-id",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
*/
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  databaseURL: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

if (firebaseConfig.apiKey === "REPLACE_ME") {
  document.getElementById('status').textContent = "⚠️ Please add your Firebase config to app.js (see comment).";
  console.warn("Please replace firebaseConfig in app.js with your project's config.");
}

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ======= Application options (change labels/ids as needed) =======
const OPTIONS = [
  { id: "opt1", label: "Option A" },
  { id: "opt2", label: "Option B" },
  { id: "opt3", label: "Option C" }
];

// Database path where votes are stored
const DB_PATH = "votes_simple_app/votes"; // you can change this path

// Admin password (client-only demo). For real admin use server / auth.
const ADMIN_PASSWORD = "admin123"; // change before demoing publicly

// UI elements
const optionsContainer = document.getElementById("options");
const statusEl = document.getElementById("status");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminPassInput = document.getElementById("adminPass");
const adminControls = document.getElementById("adminControls");
const adminTotals = document.getElementById("adminTotals");
const adminMessage = document.getElementById("adminMessage");
const resetVotesBtn = document.getElementById("resetVotesBtn");
const exportBtn = document.getElementById("exportBtn");

// localStorage key to mark voted option and time
const LS_KEY = "simple_vote_voted";

// Build option cards
function createOptionCard(opt) {
  const container = document.createElement("div");
  container.className = "option";
  container.id = `card-${opt.id}`;

  const title = document.createElement("h3");
  title.textContent = opt.label;

  const count = document.createElement("div");
  count.className = "count";
  count.id = `count-${opt.id}`;
  count.textContent = "—";

  const small = document.createElement("div");
  small.className = "small";
  small.textContent = "Live votes";

  const voteRow = document.createElement("div");
  voteRow.className = "vote-row";

  const voteBtn = document.createElement("button");
  voteBtn.className = "vote-btn";
  voteBtn.textContent = "Vote";
  voteBtn.dataset.opt = opt.id;
  voteBtn.addEventListener("click", onVoteClicked);

  voteRow.appendChild(voteBtn);

  container.appendChild(title);
  container.appendChild(count);
  container.appendChild(small);
  container.appendChild(voteRow);

  return container;
}

// Render options
function renderOptions() {
  optionsContainer.innerHTML = "";
  OPTIONS.forEach(o => {
    optionsContainer.appendChild(createOptionCard(o));
  });
}

// Listen to realtime updates and reflect counts
function startRealtimeListener() {
  const votesRef = ref(db, DB_PATH);
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val() || {};
    // update per option
    OPTIONS.forEach(opt => {
      const c = data[opt.id] || 0;
      const el = document.getElementById(`count-${opt.id}`);
      if (el) el.textContent = String(c);
    });
    // update admin totals list if visible
    refreshAdminTotalsUI(data);
    statusEl.textContent = "Live — counts updated.";
  }, (error) => {
    statusEl.textContent = "Error connecting to database.";
    console.error("onValue error:", error);
  });
}

// Vote handler: uses transaction to increment atomically
async function onVoteClicked(e) {
  const optId = e.currentTarget.dataset.opt;
  if (!optId) return;

  // basic single-vote prevention: localStorage flag
  const votedObj = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (votedObj.voted) {
    alert(`You already voted for "${votedObj.optLabel}". One vote per browser.`);
    return;
  }

  if (!confirm("Confirm your vote?")) return;

  const thisRef = ref(db, `${DB_PATH}/${optId}`);
  try {
    // runTransaction ensures atomic increment
    await runTransaction(thisRef, (current) => {
      return (current || 0) + 1;
    });

    // mark localStorage
    const optLabel = OPTIONS.find(o=>o.id===optId)?.label || optId;
    localStorage.setItem(LS_KEY, JSON.stringify({
      voted: true,
      optId,
      optLabel,
      ts: Date.now()
    }));

    // update UI: disable vote buttons
    disableAllVoteButtons();
    statusEl.textContent = `Thanks — your vote for "${optLabel}" was recorded.`;
  } catch (err) {
    console.error("Vote failed:", err);
    alert("Vote failed. Try again.");
  }
}

function disableAllVoteButtons() {
  document.querySelectorAll(".vote-btn").forEach(btn=>{
    btn.disabled = true;
    btn.textContent = "Voted";
  });
}

function enableAllVoteButtons() {
  document.querySelectorAll(".vote-btn").forEach(btn=>{
    btn.disabled = false;
    btn.textContent = "Vote";
  });
}

// Admin utilities
function refreshAdminTotalsUI(data = {}) {
  if (adminControls.classList.contains("hidden")) return;
  adminTotals.innerHTML = "";
  OPTIONS.forEach(opt=>{
    const li = document.createElement("li");
    li.textContent = `${opt.label} — ${data[opt.id] || 0}`;
    adminTotals.appendChild(li);
  });
}

adminLoginBtn.addEventListener("click", () => {
  const val = (adminPassInput.value || "").trim();
  if (!val) { adminMessage.textContent = "Enter password."; return; }

  if (val === ADMIN_PASSWORD) {
    adminControls.classList.remove("hidden");
    adminMessage.textContent = "Admin unlocked — live totals below.";
    // get initial snapshot
    get(ref(db, DB_PATH)).then(snap => {
      refreshAdminTotalsUI(snap.val() || {});
    });
  } else {
    adminMessage.textContent = "Wrong password (demo only).";
  }
});

// Reset votes (danger) — writes zeros for all options
resetVotesBtn.addEventListener("click", async () => {
  if (!confirm("Reset ALL votes to zero? This cannot be undone.")) return;
  try {
    const updates = {};
    OPTIONS.forEach(o => updates[`${DB_PATH}/${o.id}`] = 0);
    // Write all zeros
    await set(ref(db, DB_PATH), Object.fromEntries(OPTIONS.map(o=>[o.id,0])));
    adminMessage.textContent = "All votes reset to 0.";
  } catch (err) {
    console.error(err);
    adminMessage.textContent = "Reset failed.";
  }
});

// Export counts to JSON
exportBtn.addEventListener("click", async () => {
  try {
    const snap = await get(ref(db, DB_PATH));
    const data = snap.val() || {};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vote_counts_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    adminMessage.textContent = "Export failed.";
  }
});

// on load
(function init(){
  renderOptions();

  // if already voted in localStorage, disable buttons
  const votedObj = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (votedObj.voted) {
    disableAllVoteButtons();
    statusEl.textContent = `You already voted for "${votedObj.optLabel}".`;
  } else {
    enableAllVoteButtons();
    statusEl.textContent = "Ready. Choose an option to vote.";
  }

  // start realtime listening
  startRealtimeListener();
})();
