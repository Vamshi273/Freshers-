// ===== Firebase Setup =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
// Contestants
const males = [
  { name: "Prabhas", img: "images/prabhas.jpg" },
  { name: "Appu", img: "images/appu.jpg" },
  { name: "Chiranjeevi", img: "images/chiranjeevi.jpg" },
  { name: "Ramcharan", img: "images/ramcharan.jpg" }
];

const females = [
  { name: "Samantha", img: "images/samantha.jpg" },
  { name: "Sai Pallavi", img: "images/saipallavi.jpg" },
  { name: "Sreeleela", img: "images/sreeleela.jpg" },
  { name: "Kajal", img: "images/kajal.jpg" }
];

// Helper: create card
function createCard(person) {
  return `
    <div class="option">
      <img src="${person.img}" alt="${person.name}">
      <h3>${person.name}</h3>
      <button data-option="${person.name}">Vote</button>
    </div>
  `;
}

// Render male contestants
document.getElementById("male-options").innerHTML = males.map(createCard).join("");

// Render female contestants
document.getElementById("female-options").innerHTML = females.map(createCard).join("");

// TODO: Add Firebase voting logic here (same as before)

// 🔹 Your Firebase config (replace with your project’s values)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== Elements =====
const resultsDiv = document.getElementById("results");
const adminPanel = document.getElementById("adminPanel");
const adminLoginBtn = document.getElementById("adminLogin");
const resetBtn = document.createElement("button");

// ===== Admin Password (simple demo) =====
const ADMIN_PASSWORD = "admin123"; // Change this for security

// ===== Voting Logic =====
async function vote(option) {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `votes/${option}`));
    let currentVotes = snapshot.exists() ? snapshot.val() : 0;
    currentVotes++;

    await set(ref(db, "votes/" + option), currentVotes);
    alert(`Thanks for voting for ${option}!`);
    loadResults();
  } catch (error) {
    console.error("Vote error:", error);
  }
}

// ===== Load Results =====
async function loadResults() {
  resultsDiv.innerHTML = "";
  const dbRef = ref(db);

  try {
    const snapshot = await get(child(dbRef, "votes"));
    if (snapshot.exists()) {
      const votes = snapshot.val();
      for (let [option, count] of Object.entries(votes)) {
        const card = document.createElement("div");
        card.classList.add("result-card");
        card.innerHTML = `<h3>${option}</h3><span>${count} votes</span>`;
        resultsDiv.appendChild(card);
      }
    } else {
      resultsDiv.innerHTML = "<p>No votes yet.</p>";
    }
  } catch (error) {
    console.error("Load results error:", error);
  }
}

// ===== Admin Login =====
adminLoginBtn.addEventListener("click", () => {
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    adminPanel.style.display = "block";
    loadResults();

    // Add Reset Button for admin
    resetBtn.textContent = "Reset All Votes";
    resetBtn.style.marginTop = "15px";
    resetBtn.style.padding = "8px 14px";
    resetBtn.style.background = "#dc3545";
    resetBtn.style.color = "white";
    resetBtn.style.border = "none";
    resetBtn.style.borderRadius = "6px";
    resetBtn.style.cursor = "pointer";

    resetBtn.addEventListener("click", resetVotes);
    adminPanel.appendChild(resetBtn);
  } else {
    alert("Wrong password!");
  }
});

// ===== Reset Votes (Admin Only) =====
async function resetVotes() {
  if (confirm("Are you sure you want to reset all votes?")) {
    try {
      await set(ref(db, "votes"), {});
      alert("All votes have been reset!");
      loadResults();
    } catch (error) {
      console.error("Reset error:", error);
    }
  }
}

// ===== Attach vote buttons =====
document.querySelectorAll(".option button").forEach(btn => {
  btn.addEventListener("click", () => {
    const option = btn.getAttribute("data-option");
    vote(option);
  });
});