// === script.js ===

const gridContainer = document.getElementById("grid-container");
const runButton = document.getElementById("run-button");
const inputSwitches = document.getElementById("input-switches");
const outputLights = document.getElementById("output-lights");
const feedbackMessage = document.getElementById("feedback-message");
const nextLevelButton = document.createElement("button");
const resetButton = document.createElement("button");

let gridRows = 7;
let gridCols = 10;
let grid = [];
let selectedTool = "WIRE";
let isDrawing = false;
let currentLevel = 1;

const tools = document.querySelectorAll(".gate-button");

function handleToolSelection(btn) {
  if (btn.style.display === "none") {
    return; // Ignore hidden buttons
  }
  tools.forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedTool = btn.dataset.gate;
}

tools.forEach((btn) => {
  btn.addEventListener("click", () => {
    handleToolSelection(btn);
  });
});

function updateToolVisibility() {
    tools.forEach((btn) => {
      const gate = btn.dataset.gate;
      if (currentLevel === 1) {
        if (gate === "AND" || gate === "WIRE" || gate === "ERASE") {
          btn.disabled = false;
          btn.style.opacity = 1;
          btn.style.pointerEvents = 'auto';
        } else {
          btn.disabled = true;
          btn.style.opacity = 0.5;
          btn.style.pointerEvents = 'none';
        }
      } else if (currentLevel === 2) {
        if (gate === "OR" || gate === "WIRE" || gate === "ERASE") {
          btn.disabled = false;
          btn.style.opacity = 1;
          btn.style.pointerEvents = 'auto';
        } else {
          btn.disabled = true;
          btn.style.opacity = 0.5;
          btn.style.pointerEvents = 'none';
        }
      } else if (currentLevel === 3) {
        if (gate === "AND" || gate === "OR" || gate === "NOT" || gate === "WIRE" || gate === "ERASE") {
          btn.disabled = false;
          btn.style.opacity = 1;
          btn.style.pointerEvents = 'auto';
        } else {
          btn.disabled = true;
          btn.style.opacity = 0.5;
          btn.style.pointerEvents = 'none';
        }
      }
    });
  
    // Auto select first visible tool if nothing selected
    const firstVisible = Array.from(tools).find(btn => !btn.disabled);
    if (!tools.some(btn => btn.classList.contains('selected') && !btn.disabled)) {
      if (firstVisible) {
        handleToolSelection(firstVisible);
      }
    }
  }
  
function createGrid() {
  gridContainer.innerHTML = "";
  grid = [];

  gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

  for (let r = 0; r < gridRows; r++) {
    const row = [];
    for (let c = 0; c < gridCols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridContainer.appendChild(cell);
      row.push("");

      cell.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDrawing = true;
        applyTool(cell);
      });

      cell.addEventListener("mouseover", (e) => {
        if (isDrawing) {
          applyTool(cell);
        }
      });
    }
    grid.push(row);
  }

  document.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  placeInputsAndOutputs();
}

function applyTool(cell) {
  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);

  if (cell.classList.contains("input") || cell.classList.contains("output")) {
    return;
  }

  if (selectedTool === "ERASE") {
    cell.className = "grid-cell";
    grid[r][c] = "";
  } else {
    if (selectedTool === "WIRE") {
      cell.className = "grid-cell wire";
      grid[r][c] = "WIRE";
    } else {
      cell.className = `grid-cell gate-${selectedTool}`;
      grid[r][c] = selectedTool;
    }
  }
}

function placeInputsAndOutputs() {
  const in0 = gridContainer.children[10];
  const in1 = gridContainer.children[20];
  const out0 = gridContainer.children[65];

  in0.classList.add("input");
  in0.textContent = "IN0";
  grid[1][0] = "INPUT0";

  in1.classList.add("input");
  in1.textContent = "IN1";
  grid[2][0] = "INPUT1";

  out0.classList.add("output");
  out0.textContent = "OUT0";
  grid[6][5] = "OUTPUT0";

  createSwitches();
}

function createSwitches() {
  inputSwitches.innerHTML = "";
  for (let i = 0; i < 2; i++) {
    const switchBtn = document.createElement("button");
    switchBtn.classList.add("switch-btn");
    switchBtn.innerText = `Switch ${i} (OFF)`;
    switchBtn.dataset.index = i;
    switchBtn.dataset.state = "off";

    switchBtn.addEventListener("click", () => {
      const isOn = switchBtn.dataset.state === "on";
      if (isOn) {
        switchBtn.dataset.state = "off";
        switchBtn.classList.remove("active");
        switchBtn.innerText = `Switch ${i} (OFF)`;
      } else {
        switchBtn.dataset.state = "on";
        switchBtn.classList.add("active");
        switchBtn.innerText = `Switch ${i} (ON)`;
      }
    });

    inputSwitches.appendChild(switchBtn);
  }
}

function runSimulation() {
    const light = document.getElementById("light-0");
    const switches = Array.from(inputSwitches.children).map((btn) =>
      btn.dataset.state === "on"
    );
  
    let success = false;
  
    let usedGates = new Set();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === "AND" || grid[r][c] === "OR" || grid[r][c] === "NOT") {
          usedGates.add(grid[r][c]);
        }
      }
    }
  
    if (currentLevel === 1) {
      success = switches[0] && switches[1] && usedGates.has("AND");
    } else if (currentLevel === 2) {
      success = (switches[0] || switches[1]) && usedGates.has("OR");
    } else if (currentLevel === 3) {
      const xorResult = (switches[0] && !switches[1]) || (switches[1] && !switches[0]);
      success = xorResult && usedGates.has("NOT");
    }
  
    if (success) {
      light.classList.add("on");
      feedbackMessage.textContent = "Correct! Level Cleared!";
      feedbackMessage.className = "success";
      showNextLevelButton();
    } else {
      light.classList.remove("on");
      feedbackMessage.textContent = "Incorrect! Try Again.";
      feedbackMessage.className = "error";
    }
  }
  

function showNextLevelButton() {
  nextLevelButton.innerText = "Next Level";
  nextLevelButton.onclick = nextLevel;
  document.getElementById("message-area").appendChild(nextLevelButton);
}

function nextLevel() {
  if (currentLevel < 3) {
    currentLevel++;
    resetLevel();
  } else if (currentLevel === 3) {
    feedbackMessage.textContent = "🎉 Congratulations! You completed all levels!";
    feedbackMessage.className = "success";
    nextLevelButton.remove();
  }
}

function resetLevel() {
  feedbackMessage.textContent = "";
  feedbackMessage.className = "";
  const light = document.getElementById("light-0");
  if (light) {
    light.classList.remove("on");
  }
  nextLevelButton.remove();
  createGrid();
  updateLevelInfo();
  updateToolVisibility();
}

function updateLevelInfo() {
  const levelTitle = document.getElementById("level-title");
  const levelInstructions = document.getElementById("level-instructions");

  if (currentLevel === 1) {
    levelTitle.textContent = "Level 1: The AND Gate";
    levelInstructions.textContent = "Make the light turn ON only when both switches are ON. Use the AND gate.";
  } else if (currentLevel === 2) {
    levelTitle.textContent = "Level 2: The OR Gate";
    levelInstructions.textContent = "Make the light turn ON if either switch is ON. Use the OR gate.";
  } else if (currentLevel === 3) {
    levelTitle.textContent = "Level 3: Combining Gates";
    levelInstructions.textContent = "Use AND, OR, and NOT gates to complete the circuit.";
  }
}

runButton.addEventListener("click", runSimulation);

resetButton.innerText = "Reset Grid";
resetButton.onclick = resetLevel;
document.getElementById("message-area").appendChild(resetButton);

createGrid();
updateLevelInfo();
updateToolVisibility();
