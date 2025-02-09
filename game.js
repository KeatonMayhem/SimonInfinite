let sequence = [];
let playerSequence = [];
let score = 0;
let highscore = 0;
let highscoreHolder = "Unknown";
let tophigh = [];
const buttons = document.querySelectorAll(".color-btn");
const apiKey = 'Bearer patzZ6CbTcDkaxdpS.79173b498ca77f4302860f25f5b2228809538fc337f98133e925dfa2fc9e676f';
const baseId = 'app05DRLpsD2k6GJG';
const tableName = 'tbloPF1MzSiamC2Hh';
const buttonFrequencies = {
        1: 261.6, // C4 - Red
        2: 329.6, // E4 - Blue
        3: 392.0, // G4 - Green
        4: 523.3  // C5 - Orange
    };

function switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    // Show the selected screen
    document.getElementById(screenId).classList.add("active");
}

    // Fetch highscore from Airtable
async function fetchHighscore() {
    try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?sort[0][field]=Highscore&sort[0][direction]=desc&maxRecords=10`, {
        method: 'GET',
        headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    tophigh = data.records.map(record => ({
        name: record.fields.Name || "Unknown",
        score: record.fields.Highscore || 0
    }));
    console.log(tophigh);

    if (data.records.length > 0) {
        // Set top high score
        highscore = data.records[0].fields.Highscore || 0;
        highscoreHolder = data.records[0].fields.Name || "Unknown";
        document.getElementById('highscore').textContent = `Highscore: ${highscore} by ${highscoreHolder}`;
        document.getElementById('highscore1').textContent = `Highscore: ${highscore} by ${highscoreHolder}`;
    }
    // Populate top 10 leaderboard
    const highscoreList = document.getElementById('highscoreList');
    highscoreList.innerHTML = ""; // Clear previous entries

    data.records.forEach(record => {
    const { Name, Highscore } = record.fields;
    const listItem = document.createElement("li");
    listItem.textContent = `${Name}: ${Highscore}`;
    highscoreList.appendChild(listItem);
    });

    } catch (error) {
    console.error("Error fetching highscore:", error);
    }
}

function playTone(frequency, duration = 300) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // Volume control

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

// Post results to Airtable
async function postResults() {
let playerName = document.getElementById("name").value;
const data = {
    fields: {
    Name: playerName,
    Highscore: score
    }
};

try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    method: "POST",
    headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Data saved to Airtable:", result);
    highscore = score;
    highscoreHolder = playerName;
    fetchHighscore();
    document.getElementById('highscore').textContent = `Highscore: ${highscore} by ${highscoreHolder}`;
    document.getElementById('highscore1').textContent = `Highscore: ${highscore} by ${highscoreHolder}`;
} catch (error) {
    console.error("Error saving data:", error);
}
}

function disableButtons(state) {
buttons.forEach(btn => {
    if (state) {
    btn.classList.add("disabled");
    } else {
    btn.classList.remove("disabled");
    }
});
}

function addNextStep() {
sequence.push(Math.floor(Math.random() * 4) + 1);
}

function flashButton(num) {
let button = document.getElementById(`btn${num}`);
button.style.opacity = 1;
playTone(buttonFrequencies[num]); // Play sound
setTimeout(() => { button.style.opacity = 0.2; }, 300);
}
function playerflashButton(num) {
let button = document.getElementById(`btn${num}`);
button.style.opacity = 1;
playTone(buttonFrequencies[num]); // Play sound
setTimeout(() => { button.style.opacity = 0.2; }, 100);
}

function playSequence() {
disableButtons(true);
let index = 0;
document.getElementById('game-message').textContent = `Watch the sequence!`;

const interval = setInterval(() => {
    flashButton(sequence[index]);
    index++;
    if (index >= sequence.length) {
    clearInterval(interval);
    document.getElementById('game-message').textContent = 'Your turn!';
    disableButtons(false);
    }
}, 800);
}

function playerTurn(num) {
    playerSequence.push(num);
    playerflashButton(num);

    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
        document.getElementById('game-message').textContent = 'Game Over!';
        //switchScreen('gameOverScreen');
        checkAndInsertHighscore();
        /*
        if (score > highscore) {
        setTimeout(() => {
            let playerName = prompt("New Highscore! Enter your username:");
            if (playerName) {
            postResults(playerName);
            }
        }, 500);
        }
        */
        return;
    }

    if (playerSequence.length === sequence.length) {
        score++;
        document.getElementById('score').textContent = `Current Score: ${score}`;
        playerSequence = [];
        addNextStep();
        setTimeout(playSequence, 1000);
    }
}

function startCountdown() {
    let countdown = 3;

    const countdownElement = document.getElementById("countdown");

    countdownElement.style.display = "block"; // Show countdown text
    countdownElement.textContent = `Starting in ${countdown}...`;

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.textContent = `Starting in ${countdown}...`;
        } else {
            clearInterval(interval);
            countdownElement.style.display = "none"; // Hide countdown
            setTimeout(() => {
                let sequence = [];
                let playerSequence = [];
                let score = 0;
                let highscore = 0;
                playSequence(); // Start the game after countdown
            }, 500); // Small delay before starting to ensure audio context is ready
        }
    }, 1000);
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        let playerName = document.getElementById('name').textContent
    }
}

function resetGame() {
        sequence = [];
        playerSequence = [];
        score = 0;
        document.getElementById('score').textContent = `Current Score: 0`;
        switchScreen('gameScreen');
        addNextStep();
        startCountdown();
    }

function checkAndInsertHighscore() {
    let inserted = false;

    for (let i = 0; i < tophigh.length; i++) {
        if (score > tophigh[i].score) {
            switchScreen('highscoreScreen');
            tophigh.splice(i, 0, { name: playerName, score: score }); // Insert at correct position
            inserted = true;
            break; // Exit loop once inserted
        } else {
            switchScreen('gameOverScreen');
        }
    } 

    // If not inserted and there's space, add to the end
    if (!inserted && tophigh.length < 10) {
        switchScreen('highscoreScreen');
    } else {
        switchScreen('gameOverScreen');
    }

    // Trim to top 10 to prevent overflow
    tophigh = tophigh.slice(0, 10);
    console.log(score);
    console.log(inserted);
    console.log(tophigh);
}
    

addNextStep();
fetchHighscore(); // Fetch highscore when the page loads