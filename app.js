// ======================
// STATE
// ======================
let player1 = "Player 1";
let player2 = "Player 2";

let heatP1 = 1;
let heatP2 = 1;

let usedPartsP1 = new Set();
let usedPartsP2 = new Set();

let currentTurn = "p1";          // whose turn it is to choose a body part
let selectedBy = null;           // who is receiving the challenge
let currentPart = null;
let challengeOptions = [];

const BODY_PARTS = [
  "neck_jawline",
  "shoulders_upper_back",
  "arms_hands",
  "lower_back_hips",
  "thighs_knees",
  "feet_calves",
  "scalp_hair",
  "chest",
  "inner_thighs",
  "intimate"
];

const PART_LABELS = {
  neck_jawline: "Neck & Jawline",
  shoulders_upper_back: "Shoulders & Upper Back",
  arms_hands: "Arms & Hands",
  lower_back_hips: "Lower Back & Hips",
  thighs_knees: "Thighs & Knees",
  feet_calves: "Feet & Calves",
  scalp_hair: "Scalp & Hair",
  chest: "Chest",
  inner_thighs: "Inner Thighs",
  intimate: "Intimate"
};

// ======================
// HELPERS
// ======================
function getBand(h) {
  if (h <= 4) return "romantic";
  if (h <= 7) return "sensual";
  return "erotic";
}

function getChallengeKey(part, band) {
  if (part === "neck_jawline" && band !== "romantic") return "head_neck";
  return part;
}

function getHeatClass(h) {
  if (h <= 4) return "heat-low";
  if (h <= 7) return "heat-mid";
  return "heat-high";
}

function updateUI() {
  // Heat badges
  const p1Badge = document.getElementById("p1-heat");
  const p2Badge = document.getElementById("p2-heat");
  p1Badge.textContent = heatP1;
  p2Badge.textContent = heatP2;
  p1Badge.className = "heat-badge " + getHeatClass(heatP1);
  p2Badge.className = "heat-badge " + getHeatClass(heatP2);

  // Highlight whose turn it is
  document.getElementById("p1-block").classList.toggle("active-turn", currentTurn === "p1");
  document.getElementById("p2-block").classList.toggle("active-turn", currentTurn === "p2");

  // Turn indicator text
  const name = currentTurn === "p1" ? player1 : player2;
  document.getElementById("turn-indicator").textContent = `${name}'s turn – choose a body part for yourself`;
}

function renderBodyParts() {
  const grid = document.getElementById("body-parts-grid");
  grid.innerHTML = "";

  const usedSet = currentTurn === "p1" ? usedPartsP1 : usedPartsP2;

  BODY_PARTS.forEach(part => {
    const btn = document.createElement("button");
    btn.className = "part-btn";
    btn.textContent = PART_LABELS[part];

    if (usedSet.has(part)) {
      btn.disabled = true;
      btn.classList.add("used");
    } else {
      btn.onclick = () => selectPart(part);
    }
    grid.appendChild(btn);
  });
}

function showPhase(phase) {
  document.getElementById("select-phase").classList.toggle("hidden", phase !== "select");
  document.getElementById("choice-phase").classList.toggle("hidden", phase !== "choice");
  document.getElementById("active-phase").classList.toggle("hidden", phase !== "active");
}

// ======================
// GAME FLOW
// ======================
function selectPart(part) {
  selectedBy = currentTurn;               // the person whose turn it is receives the challenge
  currentPart = part;

  const receiverHeat = selectedBy === "p1" ? heatP1 : heatP2;
  const usedSet = selectedBy === "p1" ? usedPartsP1 : usedPartsP2;

  const band = getBand(receiverHeat);
  const key = getChallengeKey(part, band);
  const list = challengeDatabase[band][key] || [];

  if (list.length < 2) {
    alert("Not enough challenges available for this part.");
    return;
  }

  // Pick 2 random challenges
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  challengeOptions = shuffled.slice(0, 2);

  // Lock the part for this player
  usedSet.add(part);

  // Other player chooses
  const chooser = selectedBy === "p1" ? player2 : player1;
  const receiver = selectedBy === "p1" ? player1 : player2;

  document.getElementById("choice-title").textContent =
    `${chooser}, choose a challenge for ${receiver}`;

  const optionsDiv = document.getElementById("challenge-options");
  optionsDiv.innerHTML = "";

  challengeOptions.forEach((text, i) => {
    const card = document.createElement("button");
    card.className = "challenge-card";
    card.textContent = text;
    card.onclick = () => chooseChallenge(i);
    optionsDiv.appendChild(card);
  });

  showPhase("choice");
}

function chooseChallenge(index) {
  const challenge = challengeOptions[index];
  const receiver = selectedBy === "p1" ? player1 : player2;

  document.getElementById("for-label").textContent = `For ${receiver}`;
  document.getElementById("active-challenge-text").textContent = challenge;

  showPhase("active");
}

function finishTurn(delta) {
  // Apply heat change only to the receiver
  if (selectedBy === "p1") {
    const oldBand = getBand(heatP1);
    heatP1 = Math.max(1, Math.min(10, heatP1 + delta));
    if (getBand(heatP1) !== oldBand) {
      usedPartsP1.clear();          // reset used parts when band changes
    }
  } else {
    const oldBand = getBand(heatP2);
    heatP2 = Math.max(1, Math.min(10, heatP2 + delta));
    if (getBand(heatP2) !== oldBand) {
      usedPartsP2.clear();
    }
  }

  // Switch turn
  currentTurn = currentTurn === "p1" ? "p2" : "p1";

  updateUI();
  renderBodyParts();
  showPhase("select");
}

function completeChallenge() {
  finishTurn(+1);
}

function skipChallenge() {
  finishTurn(-1);
}

// ======================
// INIT
// ======================
document.getElementById("start-btn").addEventListener("click", () => {
  const p1 = document.getElementById("player1-name").value.trim();
  const p2 = document.getElementById("player2-name").value.trim();

  if (p1) player1 = p1;
  if (p2) player2 = p2;

  document.getElementById("p1-display").textContent = player1;
  document.getElementById("p2-display").textContent = player2;

  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  currentTurn = "p1";
  updateUI();
  renderBodyParts();
  showPhase("select");
});

document.getElementById("complete-btn").addEventListener("click", completeChallenge);
document.getElementById("skip-btn").addEventListener("click", skipChallenge);