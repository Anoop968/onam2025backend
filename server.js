const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configure CORS for your GitHub Pages frontend
app.use(cors({
  origin: ['https://anoop968.github.io'], // Only allow your GitHub Pages frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

/* -------------------- Utility Functions -------------------- */

// Ensure the data file exists with initial structure
function ensureData() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('Creating initial data.json file...');
    const initialData = {
      teamNames: { teamA: 'Team A', teamB: 'Team B' },
      teams: { 'Team A': 0, 'Team B': 0 },
      games: [
        { title: 'Vadam Vali', points: 10, winner: null },
        { title: 'Lemon and Spoon', points: 10, winner: null },
        { title: 'Kasara Kali', points: 10, winner: null },
        { title: 'Thetta Pavakka', points: 10, winner: null },
        { title: 'Sujiyile Nule Korkkal', points: 10, winner: null },
        { title: 'Vellam Kudi', points: 10, winner: null },
        { title: 'Theta Malsaram Mulaku', points: 10, winner: null },
        { title: 'Ballon Chavitti Pottikkal', points: 10, winner: null },
        { title: 'Porotta Thetta Malsaram', points: 10, winner: null },
        { title: 'Kuppile Vellom Nirakkal', points: 10, winner: null },
        { title: 'Imavettal', points: 10, winner: null },
        { title: 'Ballon Udhipottical', points: 10, winner: null },

        // Newly Added Games
        { title: 'Uriyadi', points: 10, winner: null },
        { title: 'Mittai Perukkal', points: 10, winner: null },
        { title: 'Sundarikku Pottuthodal', points: 10, winner: null },
        { title: 'Thalayana Adi', points: 10, winner: null }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Load data from JSON file safely
function load() {
  ensureData();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading data.json:', error.message);
    return {
      teamNames: { teamA: 'Team A', teamB: 'Team B' },
      teams: { 'Team A': 0, 'Team B': 0 },
      games: []
    };
  }
}

// Save data to JSON file
function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* -------------------- API Routes -------------------- */

// Get full scoreboard data
app.get('/api/scoreboard', (req, res) => {
  try {
    const data = load();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to read data', error: error.message });
  }
});

// Update winner for a specific game
app.post('/api/update-winner', (req, res) => {
  try {
    const { gameIndex, winner } = req.body;
    const data = load();
    const index = Number(gameIndex);

    if (Number.isNaN(index) || !data.games[index]) {
      return res.status(400).json({ message: 'Invalid game index' });
    }
    if (!['Team A', 'Team B'].includes(winner)) {
      return res.status(400).json({ message: 'Invalid winner' });
    }

    const game = data.games[index];

    // Adjust points if winner is changed
    if (game.winner && game.winner !== winner) {
      data.teams[game.winner] -= game.points;
    }

    // Add points to new winner
    if (!game.winner || game.winner !== winner) {
      data.teams[winner] += game.points;
    }

    game.winner = winner;

    save(data);
    res.json({ message: 'Winner updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update winner', error: error.message });
  }
});

// Update team names
app.post('/api/update-team-names', (req, res) => {
  try {
    const { teamAName, teamBName } = req.body;

    if (!teamAName || !teamBName) {
      return res.status(400).json({ message: 'Both team names are required' });
    }

    const data = load();
    data.teamNames = {
      teamA: teamAName.trim(),
      teamB: teamBName.trim()
    };

    save(data);
    res.json({ message: 'Team names updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update team names', error: error.message });
  }
});

// Reset all scores and winners
app.post('/api/reset-scores', (req, res) => {
  try {
    const data = load();

    // Reset scores
    data.teams['Team A'] = 0;
    data.teams['Team B'] = 0;

    // Reset winners
    data.games.forEach(game => {
      game.winner = null;
    });

    save(data);
    res.json({ message: 'Scores reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset scores', error: error.message });
  }
});

/* -------------------- Optional: Serve frontend -------------------- */
const frontendPath = path.join(__dirname, 'frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log('Serving static frontend files...');
}

/* -------------------- Start Server -------------------- */
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

