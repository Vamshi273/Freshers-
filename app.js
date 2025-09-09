// ================= Firebase Setup =================
const { initializeApp, getDatabase, ref, set, get, update, remove } = window.firebaseExports;

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

// ================= Data =================
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
// ================= UI =================
const maleContainer = document.getElementById("male-container");
const femaleContainer = document.getElementById("female-container");
const submitBtn = document.getElementById("submitBtn");
const adminPanel = document.getElementById("adminPanel");
const resultsDiv = document.getElementById("results");
const resetBtn = document.getElementById("resetBtn");

let selectedMale = null;
let selectedFemale = null;

// Render cards
function renderCards() {
  males.forEach((m, idx) => {
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

  females.forEach((f, idx) => {
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

// ================= Voting =================
submitBtn.addEventListener("click", async () => {
  if (!selectedMale || !selectedFemale) {
    alert("Please select one male and one female!");
    return;
  }

  if (localStorage.getItem("voted")) {
    alert("You have already voted from this device!");
    return;
  }

  try {
    await update(ref(db, "votes/" + selectedMale), { count: (await get(ref(db, "votes/" + selectedMale))).val()?.count + 1 || 1 });
    await update(ref(db, "votes/" + selectedFemale), { count: (await get(ref(db, "votes/" + selectedFemale))).val()?.count + 1 || 1 });

    localStorage.setItem("voted", "true");
    alert("Vote submitted successfully!");
  } catch (e) {
    console.error(e);
    alert("Error submitting vote!");
  }
});

// ================= Admin Panel =================
async function loadResults() {
  const snapshot = await get(ref(db, "votes"));
  resultsDiv.innerHTML = "";
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const [name, obj] of Object.entries(data)) {
      resultsDiv.innerHTML += `<p><b>${name}</b>: ${obj.count}</p>`;
    }
  } else {
    resultsDiv.innerHTML = "<p>No votes yet.</p>";
  }
}

// Reset votes
resetBtn.addEventListener("click", async () => {
  await remove(ref(db, "votes"));
  localStorage.removeItem("voted");
  loadResults();
  alert("All votes have been reset!");
});

// Ctrl+R to open Admin Panel
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    adminPanel.classList.toggle("hidden");
    loadResults();
  }
});

// Initialize
renderCards();