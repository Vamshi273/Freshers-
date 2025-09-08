// ✅ Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:4d97f2bfb667503d36f626"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Contestants
const males = [
  {name:"Prabhas", img:"prabhas_latest_photos_2807170354_03.jpg"},
  {name:"Appu", img:"517EDEYjsHL.jpg"},
  {name:"Chiranjeevi", img:"https://via.placeholder.com/200x250?text=Vikram"},
  {name:"Ramcharan", img:"MV5BZWY1NTQyMWItMWU2OS00NWMwLWFlN2MtMDZlYzEwZmU3MTYzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"}
];
const females = [
  {name:"Samantha", img:"samantha-ruth-prabhu-stills-photos-pictures-2008.jpg"},
  {name:"Sai Pallavi", img:"HD-wallpaper-sai-pallavi-fidaa-love-story-naga-chaitanya-sai-pallavi-shekhar-kammula-tollywood.jpg"},
  {name:"Sreelela", img:"Sreeleela-m-1.jpg"},
  {name:"Kajal", img:"a4c87cf5b9871dd67ebc6df0627d000a.jpg"}
];
// ✅ Render contestants
document.getElementById("contestants").innerHTML = contestants.map(c => `
  <div class="option">
    <img src="${c.img}" alt="${c.name}">
    <h3>${c.name}</h3>
    <button onclick="vote('${c.name}')">Vote</button>
  </div>
`).join("");

// ✅ Voting function (only 1 vote per device)
window.vote = async function(name) {
  if (localStorage.getItem("hasVoted")) {
    alert("❌ You already voted from this device!");
    return;
  }

  try {
    const voteRef = ref(db, "votes/" + name);
    const snapshot = await get(voteRef);
    let current = snapshot.exists() ? snapshot.val() : 0;

    await set(voteRef, current + 1);
    localStorage.setItem("hasVoted", "true");

    alert(`✅ Your vote for ${name} is submitted!`);
  } catch (err) {
    console.error("Vote error:", err);
    alert("⚠️ Error submitting vote.");
  }
};

// ✅ Admin panel toggle with Ctrl+R
const adminPanel = document.createElement("div");
adminPanel.id = "adminPanel";
adminPanel.style.display = "none";
adminPanel.innerHTML = `
  <h2>Admin Panel</h2>
  <div id="results"></div>
`;
document.body.appendChild(adminPanel);

// Show live votes in admin panel
function loadResults() {
  const resultsDiv = document.getElementById("results");
  const votesRef = ref(db, "votes/");
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val() || {};
    resultsDiv.innerHTML = Object.entries(data).map(([name, count]) =>
      `<p><strong>${name}</strong>: ${count} votes</p>`
    ).join("");
  });
}

// Detect Ctrl+R → open admin panel instead of refresh
document.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key === "r") {
    event.preventDefault(); // Stop page refresh
    adminPanel.style.display = "block";
    loadResults();
    alert("🔐 Admin Panel Opened");
  }
});