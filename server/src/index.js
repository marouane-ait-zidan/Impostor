const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state
const rooms = new Map();
const players = new Map();

// Football players for the game
const footballPlayers = [
  "Messi", "Ronaldo", "Neymar", "Mbappé", "Salah",
  "Benzema", "Haaland", "De Bruyne", "Modric", "Kroos",
  "Iniesta", "Xavi", "Pirlo", "Zidane", "Maradona"
];

// Helper functions
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const assignRoles = (roomId) => {
  const room = rooms.get(roomId);
  const playerCount = room.players.length;
  
  // Select random football player for majority
  const majorityPlayer = footballPlayers[Math.floor(Math.random() * footballPlayers.length)];
  
  // Select different player for impostor
  let impostorPlayer;
  do {
    impostorPlayer = footballPlayers[Math.floor(Math.random() * footballPlayers.length)];
  } while (impostorPlayer === majorityPlayer);
  
  // Assign roles
  const impostorIndex = Math.floor(Math.random() * playerCount);
  room.players.forEach((playerId, index) => {
    const player = players.get(playerId);
    player.role = index === impostorIndex ? 'impostor' : 'regular';
    player.assignedPlayer = index === impostorIndex ? impostorPlayer : majorityPlayer;
  });
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create new room
  socket.on('createRoom', (nickname) => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      players: [socket.id],
      gameState: 'lobby',
      timer: null
    });
    
    players.set(socket.id, {
      nickname,
      roomCode,
      role: null,
      assignedPlayer: null,
      votedFor: null
    });

    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
  });

  // Join existing room
  socket.on('joinRoom', ({ roomCode, nickname }) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= 6) {
      socket.emit('error', 'Room is full');
      return;
    }

    if (room.gameState !== 'lobby') {
      socket.emit('error', 'Game already in progress');
      return;
    }

    room.players.push(socket.id);
    players.set(socket.id, {
      nickname,
      roomCode,
      role: null,
      assignedPlayer: null,
      votedFor: null
    });

    socket.join(roomCode);
    io.to(roomCode).emit('playerJoined', {
      players: room.players.map(id => ({
        id,
        nickname: players.get(id).nickname
      }))
    });
  });

  // Start game
  socket.on('startGame', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'lobby') return;

    assignRoles(roomCode);
    room.gameState = 'playing';
    room.timer = 180; // 3 minutes

    // Notify all players of their roles
    room.players.forEach(playerId => {
      const player = players.get(playerId);
      io.to(playerId).emit('roleAssigned', {
        role: player.role,
        assignedPlayer: player.assignedPlayer
      });
    });

    // Start timer
    const timerInterval = setInterval(() => {
      room.timer--;
      io.to(roomCode).emit('timerUpdate', room.timer);

      if (room.timer <= 0) {
        clearInterval(timerInterval);
        room.gameState = 'voting';
        io.to(roomCode).emit('startVoting');
      }
    }, 1000);
  });

  // Handle chat messages
  socket.on('sendMessage', ({ roomCode, message }) => {
    const player = players.get(socket.id);
    io.to(roomCode).emit('newMessage', {
      playerId: socket.id,
      nickname: player.nickname,
      message
    });
  });

  // Handle votes
  socket.on('vote', ({ roomCode, votedForId }) => {
    const player = players.get(socket.id);
    player.votedFor = votedForId;

    const room = rooms.get(roomCode);
    const allVoted = room.players.every(id => players.get(id).votedFor);

    if (allVoted) {
      // Count votes
      const voteCount = new Map();
      room.players.forEach(id => {
        const votedFor = players.get(id).votedFor;
        voteCount.set(votedFor, (voteCount.get(votedFor) || 0) + 1);
      });

      // Find most voted player
      let maxVotes = 0;
      let mostVotedId = null;
      voteCount.forEach((votes, playerId) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          mostVotedId = playerId;
        }
      });

      // Check if impostor was caught
      const mostVotedPlayer = players.get(mostVotedId);
      const impostorCaught = mostVotedPlayer.role === 'impostor';

      // Send results
      io.to(roomCode).emit('gameOver', {
        impostorCaught,
        impostorId: room.players.find(id => players.get(id).role === 'impostor'),
        votes: Object.fromEntries(voteCount)
      });

      // Reset room
      room.gameState = 'lobby';
      room.players.forEach(id => {
        const player = players.get(id);
        player.role = null;
        player.assignedPlayer = null;
        player.votedFor = null;
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const room = rooms.get(player.roomCode);
      if (room) {
        room.players = room.players.filter(id => id !== socket.id);
        
        if (room.players.length === 0) {
          rooms.delete(player.roomCode);
        } else {
          io.to(player.roomCode).emit('playerLeft', {
            players: room.players.map(id => ({
              id,
              nickname: players.get(id).nickname
            }))
          });
        }
      }
      players.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 