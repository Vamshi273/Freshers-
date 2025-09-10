// ========== Firebase Setup ==========
const { initializeApp, getDatabase, ref, set, get, remove, onValue } = window.firebaseExports;

const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:0e01d5dfb64ef93036f626"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ========== Data ==========
const males = [
  { name: "Prabhas", img: "prabhas_latest_photos_2807170354_03.jpg" },
  { name: "Appu", img: "4b66c7797edf566ce33faf716aff65f6.jpg" },
  { name: "Chiranjeevi", img: "517EDEYjsHL.jpg" },
  { name: "Ramcharan", img: "MV5BZWY1NTQyMWItMWU2OS00NWMwLWFlN2MtMDZlYzEwZmU3MTYzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" }
];
const females = [
  { name: "Samantha", img: "samantha-ruth-prabhu-stills-photos-pictures-2008.jpg" },
  { name: "Sai Pallavi", img: "HD-wallpaper-sai-pallavi-fidaa-love-story-naga-chaitanya-sai-pallavi-shekhar-kammula-tollywood.jpg" },
  { name: "Sreelela", img: "Sreeleela-m-1.jpg" },
  { name: "Kajal", img: "a4c87cf5b9871dd67ebc6df0627d000a.jpg" }
];

// ========== UI ==========
const maleContainer = document.getElementById("male-container");
const femaleContainer = document.getElementById("female-container");
const submitBtn = document.getElementById("submitBtn");
const adminPanel = document.getElementById("adminPanel");
const resultsDiv = document.getElementById("results");
const resetBtn = document.getElementById("resetBtn");

// 🔒 Lock button (for admin to hide panel)
const lockBtn = document.createElement("button");
lockBtn.textContent = "Lock Admin Panel";
lockBtn.style.marginTop = "10px";
lockBtn.onclick = () => {
  adminPanel.classList.add("hidden");
};
adminPanel.appendChild(lockBtn);

// 🔐 Voting lock/unlock button
const toggleVoteBtn = document.createElement("button");
toggleVoteBtn.textContent = "Lock Voting";
toggleVoteBtn.style.marginTop = "10px";
toggleVoteBtn.onclick = async () => {
  const snap = await get(ref(db, "votingLocked"));
  const locked = snap.exists() ? snap.val() : false;
  await set(ref(db, "votingLocked"), !locked);
  alert(!locked ? "Voting is now LOCKED" : "Voting is now UNLOCKED");
};
adminPanel.appendChild(toggleVoteBtn);

let selectedMale = null;
let selectedFemale = null;
let votingLocked = false;

// ========== Render Cards ==========
function renderCards() {
  males.forEach((m) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${m.img}" alt="${m.name}"><p>${m.name}</p>`;
    div.onclick = () => {
      document.querySelectorAll("#male-container .card").forEach(c => c.classList.remove("selected"));
      div.classList.add("selected");
      selectedMale = m.name;
    };
    maleContainer.appendChild(div);
  });

  females.forEach((f) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${f.img}" alt="${f.name}"><p>${f.name}</p>`;
    div.onclick = () => {
      document.querySelectorAll("#female-container .card").forEach(c => c.classList.remove("selected"));
      div.classList.add("selected");
      selectedFemale = f.name;
    };
    femaleContainer.appendChild(div);
  });
}

// ========== Voting ==========
submitBtn.addEventListener("click", async () => {
  if (votingLocked) {
    alert("⚠ Voting is currently locked by Admin!");
    return;
  }

  const versionSnap = await get(ref(db, "resetVersion"));
  const resetVersion = versionSnap.exists() ? versionSnap.val() : 0;
  const userVersion = localStorage.getItem("resetVersion") || -1;

  if (!selectedMale || !selectedFemale) {
    alert("Please select one male and one female!");
    return;
  }

  if (localStorage.getItem("voted") === "true" && parseInt(userVersion) === resetVersion) {
    alert("You have already voted from this device!");
    return;
  }

  try {
    // Male vote
    const maleSnap = await get(ref(db, "votes/" + selectedMale));
    let maleCount = (maleSnap.exists() && typeof maleSnap.val().count === "number") ? maleSnap.val().count : 0;
    await set(ref(db, "votes/" + selectedMale), { count: maleCount + 1 });

    // Female vote
    const femaleSnap = await get(ref(db, "votes/" + selectedFemale));
    let femaleCount = (femaleSnap.exists() && typeof femaleSnap.val().count === "number") ? femaleSnap.val().count : 0;
    await set(ref(db, "votes/" + selectedFemale), { count: femaleCount + 1 });

    localStorage.setItem("voted", "true");
    localStorage.setItem("resetVersion", resetVersion);

    alert("Vote submitted successfully!");
  } catch (e) {
    console.error("Firebase write error:", e);
    alert("Error submitting vote: " + e.message);
  }
});

// ========== Admin ==========
async function loadResults() {
  const snapshot = await get(ref(db, "votes"));
  resultsDiv.innerHTML = "";
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const [name, obj] of Object.entries(data)) {
      const count = obj && typeof obj.count === "number" ? obj.count : 0;
      resultsDiv.innerHTML += `<p><b>${name}</b>: ${count}</p>`;
    }
  } else {
    resultsDiv.innerHTML = "<p>No votes yet.</p>";
  }
}

resetBtn.addEventListener("click", async () => {
  await remove(ref(db, "votes"));
  const versionSnap = await get(ref(db, "resetVersion"));
  const resetVersion = versionSnap.exists() ? versionSnap.val() + 1 : 1;
  await set(ref(db, "resetVersion"), resetVersion);

  localStorage.removeItem("voted");
  localStorage.removeItem("resetVersion");

  loadResults();
  alert("All votes have been reset! Now everyone can vote again.");
});

// ========== Admin Panel Access ==========
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    const password = prompt("Enter Admin Password:");
    if (password === "admin123") { // 🔑 Change this
      adminPanel.classList.remove("hidden");
      loadResults();
    } else {
      alert("Incorrect password!");
    }
  }
});

// ========== Listen for voting lock ==========
onValue(ref(db, "votingLocked"), (snapshot) => {
  votingLocked = snapshot.exists() ? snapshot.val() : false;
  submitBtn.disabled = votingLocked;
  submitBtn.textContent = votingLocked ? "Voting Locked" : "Submit Vote";
});

// Init
renderCards();