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

// Football players with images
const footballPlayers = [
  {
    name: "Messi",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Ronaldo",
    image: "https://media.api-sports.io/football/players/874.png"
  },
  {
    name: "Neymar",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Mbappé",
    image: "https://media.api-sports.io/football/players/278.png"
  },
  {
    name: "Salah",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Benzema",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Haaland",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "De Bruyne",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Modric",
    image: "https://media.api-sports.io/football/players/276.png"
  },
  {
    name: "Kroos",
    image: "https://media.api-sports.io/football/players/276.png"
  }
];

// Helper functions
const generateRoomCode = () => {
  // Generate a 6-character room code with only uppercase letters and numbers
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const isValidRoomCode = (code) => {
  // Check if the code is 6 characters and contains only valid characters
  return /^[A-Z0-9]{6}$/.test(code);
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
  } while (impostorPlayer.name === majorityPlayer.name);
  
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
    console.log('Creating new room:', roomCode, 'for player:', nickname);
    
    rooms.set(roomCode, {
      players: [socket.id],
      gameState: 'lobby',
      timer: null,
      host: socket.id
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
    console.log('Current rooms:', Array.from(rooms.keys()));
  });

  // Join existing room
  socket.on('joinRoom', ({ roomCode, nickname }) => {
    // Convert room code to uppercase and remove any spaces
    const formattedRoomCode = roomCode.trim().toUpperCase();
    console.log('Attempting to join room:', formattedRoomCode, 'with nickname:', nickname);
    console.log('Available rooms:', Array.from(rooms.keys()));
    
    if (!isValidRoomCode(formattedRoomCode)) {
      console.log('Invalid room code format:', formattedRoomCode);
      socket.emit('error', 'Invalid room code format. Room code must be 6 characters (letters and numbers only)');
      return;
    }

    const room = rooms.get(formattedRoomCode);
    
    if (!room) {
      console.log('Room not found:', formattedRoomCode);
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= 6) {
      console.log('Room is full:', room.players.length, 'players');
      socket.emit('error', 'Room is full (maximum 6 players)');
      return;
    }

    // Check if player is already in this room (rejoining after disconnect)
    const playerAlreadyInRoom = room.players.includes(socket.id);
    
    if (room.gameState !== 'lobby' && !playerAlreadyInRoom) {
      socket.emit('error', 'Game already in progress');
      return;
    }

    // Check if nickname is already taken in this room
    const isNicknameTaken = room.players.some(playerId => 
      players.get(playerId)?.nickname === nickname && playerId !== socket.id
    );

    if (isNicknameTaken) {
      socket.emit('error', 'Nickname already taken in this room');
      return;
    }

    console.log('Joining room:', formattedRoomCode);
    
    if (!playerAlreadyInRoom) {
      room.players.push(socket.id);
    }
    
    players.set(socket.id, {
      nickname,
      roomCode: formattedRoomCode,
      role: null,
      assignedPlayer: null,
      votedFor: null
    });

    socket.join(formattedRoomCode);
    
    // If game is already in progress and this player is rejoining, 
    // reassign their role information
    if (room.gameState !== 'lobby' && playerAlreadyInRoom) {
      // Re-assign their role info
      const playerData = room.playerData?.find(p => p.id === socket.id);
      if (playerData) {
        players.get(socket.id).role = playerData.role;
        players.get(socket.id).assignedPlayer = playerData.assignedPlayer;
        
        // Emit role info back to the reconnected player
        socket.emit('roleAssigned', {
          role: playerData.role,
          assignedPlayer: playerData.assignedPlayer
        });
        
        // Emit current game state
        socket.emit('gameState', {
          phase: room.gameState,
          players: room.players.map(id => ({
            id,
            nickname: players.get(id)?.nickname || 'Unknown',
            isHost: id === room.host
          })),
          timer: room.timer || 0
        });
      }
    }
    
    // Send updated player list to all players in the room
    const playerList = room.players.map(id => ({
      id,
      nickname: players.get(id)?.nickname || 'Unknown',
      isHost: id === room.host
    }));
    
    console.log('Updated player list:', playerList);
    io.to(formattedRoomCode).emit('playerJoined', { players: playerList });
    
    // Let the player know if they're host
    socket.emit('hostStatus', socket.id === room.host);
  });

  // Kick player
  socket.on('kickPlayer', ({ roomCode, playerId }) => {
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);

    if (room && player && room.host === socket.id) {
      const kickedPlayer = players.get(playerId);
      if (kickedPlayer) {
        io.to(playerId).emit('kicked');
        io.to(roomCode).emit('playerLeft', {
          players: room.players.filter(id => id !== playerId).map(id => ({
            id,
            nickname: players.get(id).nickname,
            isHost: id === room.host
          }))
        });
        room.players = room.players.filter(id => id !== playerId);
        players.delete(playerId);
      }
    }
  });

  // Start game
  socket.on('startGame', (roomCode) => {
    console.log('Attempting to start game in room:', roomCode);
    const room = rooms.get(roomCode);
    if (!room) {
      console.log('Room not found for game start:', roomCode);
      return;
    }
    
    if (room.gameState !== 'lobby') {
      console.log('Game already in progress in room:', roomCode);
      socket.emit('error', 'Game already in progress');
      return;
    }

    // Allow game to start with 3-6 players
    if (room.players.length < 3) {
      console.log('Not enough players to start:', room.players.length);
      socket.emit('error', 'Need at least 3 players to start');
      return;
    }

    console.log('Starting game in room:', roomCode, 'with', room.players.length, 'players');
    assignRoles(roomCode);
    room.gameState = 'playing';
    room.timer = 60; // 1 minute
    
    // Store player data for potential reconnections
    room.playerData = room.players.map(playerId => {
      const player = players.get(playerId);
      return {
        id: playerId,
        nickname: player.nickname,
        role: player.role,
        assignedPlayer: player.assignedPlayer
      };
    });

    // Notify all players of their roles
    room.players.forEach(playerId => {
      const player = players.get(playerId);
      io.to(playerId).emit('roleAssigned', {
        role: player.role,
        assignedPlayer: player.assignedPlayer
      });
    });
    
    // Emit game state update to all players
    io.to(roomCode).emit('gameState', {
      phase: 'game',
      players: room.players.map(id => ({
        id,
        nickname: players.get(id)?.nickname,
        isHost: id === room.host
      })),
      timer: room.timer
    });

    // Start timer
    const timerInterval = setInterval(() => {
      if (!rooms.has(roomCode)) {
        clearInterval(timerInterval);
        return;
      }
      
      const currentRoom = rooms.get(roomCode);
      currentRoom.timer--;
      io.to(roomCode).emit('timerUpdate', currentRoom.timer);

      if (currentRoom.timer <= 0) {
        clearInterval(timerInterval);
        currentRoom.gameState = 'voting';
        
        io.to(roomCode).emit('gameState', {
          phase: 'voting',
          players: currentRoom.players.map(id => ({
            id,
            nickname: players.get(id)?.nickname,
            isHost: id === currentRoom.host,
            assignedPlayer: players.get(id)?.assignedPlayer
          }))
        });
      }
    }, 1000);
  });

  // Handle chat messages
  socket.on('sendMessage', ({ roomCode, message }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'playing' || room.timer <= 0) return;
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
    const room = rooms.get(roomCode);

    if (!room || (room.gameState !== 'playing' && room.gameState !== 'voting')) return;
    if (room.gameState === 'playing' && room.timer <= 0) return;

    player.votedFor = votedForId;

    // Count votes
    const voteCount = new Map();
    room.players.forEach(id => {
      const votedFor = players.get(id).votedFor;
      if (votedFor) {
        voteCount.set(votedFor, (voteCount.get(votedFor) || 0) + 1);
      }
    });

    // Check for majority
    const majority = Math.floor(room.players.length / 2) + 1;
    let winnerId = null;
    voteCount.forEach((count, id) => {
      if (count >= majority) {
        winnerId = id;
      }
    });

    // Check if all players have voted
    const allVoted = room.players.every(id => players.get(id).votedFor);

    if (winnerId || allVoted) {
      let votedPlayer = winnerId ? players.get(winnerId) : null;
      let impostorCaught = false;
      if (winnerId) {
        impostorCaught = votedPlayer.role === 'impostor';
      }
      // If no majority, impostor wins by default
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
          // If host left, assign new host
          if (room.host === socket.id) {
            room.host = room.players[0];
          }
          
          io.to(player.roomCode).emit('playerLeft', {
            players: room.players.map(id => ({
              id,
              nickname: players.get(id).nickname,
              isHost: id === room.host
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