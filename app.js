// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAT1fvVo-2B2-F5OFs7cYu8CZUxnneW934",
  authDomain: "freshers-day-bf826.firebaseapp.com",
  databaseURL: "https://freshers-day-bf826-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freshers-day-bf826",
  storageBucket: "freshers-day-bf826.firebasestorage.app",
  messagingSenderId: "349491807955",
  appId: "1:349491807955:web:4d97f2bfb667503d36f626"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Contestants
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

// Create card
function createCard(person) {
  return `
    <div class="option">
      <img src="${person.img}" alt="${person.name}">
      <h3>${person.name}</h3>
      <button onclick="vote('${person.name}')">Vote</button>
    </div>
  `;
}

// Render contestants
document.getElementById("male-options").innerHTML = males.map(createCard).join("");
document.getElementById("female-options").innerHTML = females.map(createCard).join("");

// Vote function
window.vote = async function (name) {
  // Prevent multiple votes
  if (localStorage.getItem("hasVoted")) {
    alert("❌ You already voted!");
    return;
  }

  try {
    // Reference to candidate
    const voteRef = ref(db, "votes/" + name);

    // Get current votes
    const snapshot = await get(voteRef);
    let currentVotes = 0;
    if (snapshot.exists()) {
      currentVotes = snapshot.val();
    }

    // Update vote
    await set(voteRef, currentVotes + 1);

    // Save vote status locally
    localStorage.setItem("hasVoted", "true");

    alert(`✅ Your vote for ${name} is submitted!`);
  } catch (err) {
    console.error(err);
    alert("⚠️ Error submitting vote.");
  }
};