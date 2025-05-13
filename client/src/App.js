import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Voting from './components/Voting';
import Results from './components/Results';

// Modern color scheme
const theme = {
  primary: '#6366F1', // Indigo
  secondary: '#10B981', // Emerald
  background: '#0F172A', // Slate-900
  backgroundLight: '#1E293B', // Slate-800
  accent: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  text: '#F1F5F9', // Slate-100
  textSecondary: '#94A3B8', // Slate-400
  cardBg: 'rgba(30, 41, 59, 0.7)', // Slate-800 with transparency
  cardHover: 'rgba(51, 65, 85, 0.9)', // Slate-700 with transparency
  border: '#334155', // Slate-700
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  }

  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    min-height: 100vh;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    cursor: pointer;
    font-weight: 500;
    border: none;
    transition: all 0.2s ease;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  input {
    font-size: 1rem;
    
    &:focus {
      outline: none;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1E293B 0%, #0F172A 100%);
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
    z-index: 10;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.primary};
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  
  span {
    color: ${props => props.theme.secondary};
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: ${props => props.theme.error};
  padding: 12px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  border-left: 4px solid ${props => props.theme.error};
  font-weight: 500;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const socket = io('http://localhost:3001');

function App() {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('lobby'); // lobby, game, voting, results
  const [role, setRole] = useState(null);
  const [assignedPlayer, setAssignedPlayer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(180);
  const [votingResults, setVotingResults] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
      console.log('Connected with socket ID:', socket.id);
    });

    socket.on('gameState', (state) => {
      console.log('Game state update:', state);
      setGameState(state.phase);
      setPlayers(state.players);
      setTimer(state.timer);
    });

    socket.on('roleAssigned', (data) => {
      console.log('Role assigned:', data);
      setRole(data.role);
      setAssignedPlayer(data.assignedPlayer);
      setGameState('game');
    });

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('timerUpdate', (newTime) => {
      setTimer(newTime);
    });

    socket.on('votingResults', (results) => {
      setVotingResults(results);
    });

    socket.on('hostStatus', (status) => {
      console.log('Host status:', status);
      setIsHost(status);
    });

    socket.on('roomCreated', (code) => {
      console.log('Room created with code:', code);
      setRoomId(code);
    });

    socket.on('error', (errorMessage) => {
      console.log('Error received:', errorMessage);
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      if (errorMessage === "Game already in progress" && role !== null) {
        setGameState('game');
      }
    });

    socket.on('playerJoined', ({ players }) => {
      console.log('Players updated:', players);
      setPlayers(players);
    });

    socket.on('kicked', () => {
      console.log('You were kicked from the room');
      setNickname('');
      setRoomId('');
      setRole(null);
      setAssignedPlayer(null);
      setGameState('lobby');
      setIsHost(false);
      setMessages([]);
    });

    socket.on('gameOver', (results) => {
      setVotingResults(results);
      setGameState('results');
    });

    return () => {
      socket.off('connect');
      socket.off('gameState');
      socket.off('roleAssigned');
      socket.off('newMessage');
      socket.off('timerUpdate');
      socket.off('votingResults');
      socket.off('hostStatus');
      socket.off('roomCreated');
      socket.off('error');
      socket.off('playerJoined');
      socket.off('kicked');
      socket.off('gameOver');
    };
  }, [role]);

  const handleCreateRoom = (nickname) => {
    setError(null);
    setNickname(nickname);
    console.log('Creating room with nickname:', nickname);
    socket.emit('createRoom', nickname);
  };

  const handleJoinRoom = (nickname, roomId) => {
    setError(null);
    setNickname(nickname);
    // Format room code to uppercase and remove spaces
    const formattedRoomId = roomId.trim().toUpperCase();
    setRoomId(formattedRoomId);
    console.log('Joining room:', formattedRoomId, 'with nickname:', nickname);
    socket.emit('joinRoom', { roomCode: formattedRoomId, nickname });
  };

  const handleStartGame = () => {
    setError(null);
    socket.emit('startGame', roomId);
  };

  const handleSendMessage = (message) => {
    socket.emit('sendMessage', { message, roomCode: roomId });
  };

  const handleVote = (votedForId) => {
    socket.emit('vote', { roomCode: roomId, votedForId });
  };

  const handlePlayAgain = () => {
    socket.emit('playAgain', { roomId });
  };

  const handleKickPlayer = (playerId) => {
    socket.emit('kickPlayer', { playerId, roomId });
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'lobby':
        return (
          <Lobby
            roomCode={roomId}
            players={players}
            onStartGame={handleStartGame}
            onKickPlayer={handleKickPlayer}
            isHost={isHost}
            socketId={socketId}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        );
      case 'game':
        return (
          <Game
            role={role}
            assignedPlayer={assignedPlayer}
            players={players}
            timer={timer}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        );
      case 'voting':
        return (
          <Voting
            players={players}
            onVote={handleVote}
            timer={timer}
            gameState={gameState}
          />
        );
      case 'results':
        return (
          <Results
            results={votingResults}
            onPlayAgain={handlePlayAgain}
            isHost={isHost}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Title>Football <span>Impostor</span></Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!nickname ? (
          <Lobby
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
            socketId={socketId}
            players={[]}
          />
        ) : (
          renderGameState()
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;