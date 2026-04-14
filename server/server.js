const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for leaderboards
const soloLeaderboard = new Map();
const multiplayerLeaderboard = new Map();

// Helper function to get leaderboard
function getLeaderboard(leaderboardMap, limit = 10) {
  const entries = Array.from(leaderboardMap.entries())
    .map(([name, score], index) => ({ name, score, rank: index + 1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// Helper function to insert or update score
function upsertScore(leaderboardMap, name, score) {
  const existing = leaderboardMap.get(name);
  if (existing === undefined || score > existing) {
    leaderboardMap.set(name, score);
  }
}

// API Routes
app.get('/api/solo-leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboard(soloLeaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching solo leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/multiplayer-leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboard(multiplayerLeaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching multiplayer leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/solo-score', (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ error: 'Name and score are required' });
    }
    
    upsertScore(soloLeaderboard, name, score);
    
    // Broadcast update to all connected clients
    const leaderboard = getLeaderboard(soloLeaderboard);
    io.emit('solo-leaderboard-update', leaderboard);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error saving solo score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.post('/api/multiplayer-score', (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ error: 'Name and score are required' });
    }
    
    upsertScore(multiplayerLeaderboard, name, score);
    
    // Broadcast update to all connected clients
    const leaderboard = getLeaderboard(multiplayerLeaderboard);
    io.emit('multiplayer-leaderboard-update', leaderboard);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error saving multiplayer score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// WebSocket connection handling
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial leaderboards on connection
  socket.emit('solo-leaderboard-update', getLeaderboard(soloLeaderboard));
  socket.emit('multiplayer-leaderboard-update', getLeaderboard(multiplayerLeaderboard));
  
  // Room management via WebSocket
  socket.on('create-room', ({ roomId, playerName }) => {
    rooms.set(roomId, {
      host: playerName,
      players: [playerName],
      status: 'waiting'
    });
    socket.join(roomId);
    socket.emit('room-created', { roomId, host: playerName });
    io.to(roomId).emit('player-joined', { playerName });
  });

  socket.on('join-room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.players.push(playerName);
      socket.join(roomId);
      socket.emit('room-joined', { roomId, players: room.players });
      io.to(roomId).emit('player-joined', { playerName, players: room.players });
    } else {
      socket.emit('error', { message: 'Room not found' });
    }
  });

  socket.on('game-start', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.status = 'playing';
      io.to(roomId).emit('game-started');
    }
  });

  socket.on('game-over', ({ roomId, playerName, score }) => {
    const room = rooms.get(roomId);
    if (room) {
      io.to(roomId).emit('player-finished', { playerName, score });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
