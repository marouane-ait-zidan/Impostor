import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Voting from './components/Voting';
import Results from './components/Results';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState('lobby');
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [assignedPlayer, setAssignedPlayer] = useState(null);
  const [timer, setTimer] = useState(180);
  const [messages, setMessages] = useState([]);
  const [gameResults, setGameResults] = useState(null);

  useEffect(() => {
    socket.on('roomCreated', (code) => {
      setRoomCode(code);
    });

    socket.on('playerJoined', ({ players }) => {
      setPlayers(players);
    });

    socket.on('roleAssigned', ({ role, assignedPlayer }) => {
      setRole(role);
      setAssignedPlayer(assignedPlayer);
      setGameState('playing');
    });

    socket.on('timerUpdate', (time) => {
      setTimer(time);
    });

    socket.on('startVoting', () => {
      setGameState('voting');
    });

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('gameOver', (results) => {
      setGameResults(results);
      setGameState('results');
    });

    socket.on('error', (error) => {
      alert(error);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('roleAssigned');
      socket.off('timerUpdate');
      socket.off('startVoting');
      socket.off('newMessage');
      socket.off('gameOver');
      socket.off('error');
    };
  }, []);

  const createRoom = (nickname) => {
    socket.emit('createRoom', nickname);
  };

  const joinRoom = (roomCode, nickname) => {
    socket.emit('joinRoom', { roomCode, nickname });
  };

  const startGame = () => {
    socket.emit('startGame', roomCode);
  };

  const sendMessage = (message) => {
    socket.emit('sendMessage', { roomCode, message });
  };

  const vote = (votedForId) => {
    socket.emit('vote', { roomCode, votedForId });
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'lobby':
        return (
          <Lobby
            roomCode={roomCode}
            players={players}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onStartGame={startGame}
          />
        );
      case 'playing':
        return (
          <Game
            role={role}
            assignedPlayer={assignedPlayer}
            players={players}
            timer={timer}
            messages={messages}
            onSendMessage={sendMessage}
          />
        );
      case 'voting':
        return (
          <Voting
            players={players}
            onVote={vote}
          />
        );
      case 'results':
        return (
          <Results
            results={gameResults}
            players={players}
            onPlayAgain={() => setGameState('lobby')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <Title>Football Impostor</Title>
      {renderGameState()}
    </AppContainer>
  );
}

export default App; 