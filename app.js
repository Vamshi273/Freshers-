// ==== Firebase Import ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// ==== Firebase Config ====
const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:4d97f2bfb667503d36f626"
};

// ==== Init Firebase ====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==== Candidates ====
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

// ==== Render Voting Cards ====
function renderGroup(containerId, candidates, group) {
  const container = document.getElementById(containerId);
  candidates.forEach(person => {
    const card = document.createElement("div");
    card.className = "option";
    card.innerHTML = `
      <img src="${person.img}" alt="${person.name}">
      <h3>${person.name}</h3>
      <button id="vote-${group}-${person.name}">Vote</button>
      <div class="count" id="count-${group}-${person.name}">Votes: 0</div>
    `;
    container.appendChild(card);

    // Vote button click
    document.getElementById(`vote-${group}-${person.name}`).addEventListener("click", () => {
      castVote(group, person.name);
    });
  });
}

// ==== Voting Function ====
function castVote(group, name) {
  const voteKey = `${group}-${name}`;
  if (localStorage.getItem(voteKey)) {
    alert("You have already voted for " + name);
    return;
  }

  const candidateRef = ref(db, `votes/${group}/${name}`);
  get(candidateRef).then(snapshot => {
    let count = snapshot.exists() ? snapshot.val() : 0;
    update(ref(db, `votes/${group}`), {
      [name]: count + 1
    });
    localStorage.setItem(voteKey, "voted");
  });
}

// ==== Live Vote Updates ====
function setupLiveUpdates(group, candidates) {
  const groupRef = ref(db, `votes/${group}`);
  onValue(groupRef, snapshot => {
    const data = snapshot.val() || {};
    candidates.forEach(person => {
      const countEl = document.getElementById(`count-${group}-${person.name}`);
      if (countEl) {
        countEl.textContent = "Votes: " + (data[person.name] || 0);
      }
    });
  });
}

// ==== Admin Login ====
globalThis.adminLogin = function () {
  const password = prompt("Enter admin password:");
  if (password === "admin123") {
    document.getElementById("adminPanel").style.display = "block";
    loadAdminResults();
  } else {
    alert("Wrong password!");
  }
};

// ==== Load Results in Admin Panel ====
function loadAdminResults() {
  const resultsDiv = document.querySelector(".results");
  resultsDiv.innerHTML = "";

  ["males", "females"].forEach(group => {
    const groupRef = ref(db, `votes/${group}`);
    onValue(groupRef, snapshot => {
      const data = snapshot.val() || {};
      Object.keys(data).forEach(name => {
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `<h3>${name}</h3><span>${data[name]} votes</span>`;
        resultsDiv.appendChild(card);
      });
    });
  });
}

// ==== Reset Votes ====
globalThis.resetVotes = function () {
  if (confirm("Are you sure you want to reset all votes?")) {
    set(ref(db, "votes"), { males: {}, females: {} });
  }
};

// ==== Initialize on Page Load ====
addEventListener("DOMContentLoaded", () => {
  renderGroup("male-options", males, "males");
  renderGroup("female-options", females, "females");
  setupLiveUpdates("males", males);
  setupLiveUpdates("females", females);
});