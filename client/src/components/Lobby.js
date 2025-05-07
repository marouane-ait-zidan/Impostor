import React, { useState } from 'react';
import styled from 'styled-components';

const LobbyContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4CAF50;
  }
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const RoomCode = styled.div`
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  text-align: center;
  font-size: 1.2rem;
`;

const PlayerList = styled.div`
  margin-top: 20px;
`;

const PlayerItem = styled.div`
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  margin-bottom: 5px;
`;

const CopyButton = styled.button`
  padding: 8px 15px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  background: #2196F3;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #1976D2;
  }
`;

function Lobby({ roomCode, players, onCreateRoom, onJoinRoom, onStartGame }) {
  const [nickname, setNickname] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateRoom(nickname.trim());
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (nickname.trim() && joinRoomCode.trim()) {
      onJoinRoom(joinRoomCode.trim().toUpperCase(), nickname.trim());
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied to clipboard!');
  };

  return (
    <LobbyContainer>
      {!roomCode ? (
        <>
          <Form onSubmit={handleCreateRoom}>
            <Input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <Button type="submit">Create Room</Button>
          </Form>

          <div style={{ margin: '20px 0', textAlign: 'center' }}>OR</div>

          <Form onSubmit={handleJoinRoom}>
            <Input
              type="text"
              placeholder="Enter room code"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <Button type="submit">Join Room</Button>
          </Form>
        </>
      ) : (
        <>
          <RoomCode>
            Room Code: {roomCode}
            <CopyButton onClick={copyRoomCode}>Copy</CopyButton>
          </RoomCode>

          <PlayerList>
            <h3>Players ({players.length}/6):</h3>
            {players.map((player) => (
              <PlayerItem key={player.id}>
                {player.nickname}
              </PlayerItem>
            ))}
          </PlayerList>

          <Button
            onClick={onStartGame}
            disabled={players.length < 2}
          >
            Start Game
          </Button>
        </>
      )}
    </LobbyContainer>
  );
}

export default Lobby; 