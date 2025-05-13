import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCrown, FaUserSlash, FaCopy, FaFutbol } from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
`;

const LobbyBg = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: url('https://d1csarkz8obe9u.cloudfront.net/posterpreviews/modern-futuristic-fooball-field-background-design-template-096a8dc76fa0de9f91ffc5b1eb5c1ef3_screen.jpg?ts=1737531143') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  filter: blur(2px) brightness(0.7);
`;

const LobbyCard = styled.div`
  position: relative;
  z-index: 1;
  background: rgba(30, 41, 59, 0.85);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 40px 32px 32px 32px;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s cubic-bezier(.39,.575,.56,1.000);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RoomCodeBadge = styled.div`
  display: flex;
  align-items: center;
  background: rgba(16,185,129,0.15);
  color: #10B981;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 12px 28px;
  margin-bottom: 24px;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  color: #10B981;
  margin-left: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #34D399; }
`;

const PlayerList = styled.div`
  width: 100%;
  margin-bottom: 18px;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.4s;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1 60%, #10B981 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.12);
  animation: ${pulse} 2s infinite;
`;

const PlayerName = styled.span`
  flex: 1;
  color: #F1F5F9;
  font-size: 1.1rem;
  font-weight: 500;
`;

const HostIcon = styled(FaCrown)`
  color: #F59E0B;
  margin-left: 8px;
  font-size: 1.1rem;
`;

const KickBtn = styled.button`
  background: none;
  border: none;
  color: #EF4444;
  font-size: 1.2rem;
  margin-left: 10px;
  cursor: pointer;
  &:hover { color: #DC2626; }
`;

const StartGameBtn = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 16px 0;
  background: linear-gradient(90deg, #10B981 0%, #6366F1 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(99,102,241,0.18);
  transition: background 0.2s, box-shadow 0.2s;
  cursor: pointer;
  letter-spacing: 1px;
  &:hover {
    background: linear-gradient(90deg, #34D399 0%, #818CF8 100%);
    box-shadow: 0 6px 24px rgba(16,185,129,0.18);
  }
  &:disabled {
    background: #334155;
    color: #94A3B8;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const WaitingText = styled.div`
  color: #94A3B8;
  margin-top: 18px;
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 1px;
  animation: ${pulse} 1.5s infinite;
`;

function Lobby({ roomCode, players = [], onCreateRoom, onJoinRoom, onStartGame, onKickPlayer, isHost, socketId }) {
  const [nickname, setNickname] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isCurrentHost, setIsCurrentHost] = useState(false);

  useEffect(() => {
    if (players && socketId) {
      const currentPlayer = players.find(p => p.id === socketId);
      if (currentPlayer) {
        setIsCurrentHost(currentPlayer.isHost);
      }
    }
  }, [players, socketId]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateRoom(nickname.trim());
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (nickname.trim() && joinRoomCode.trim()) {
      onJoinRoom(nickname.trim(), joinRoomCode.trim().toUpperCase());
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <>
      <LobbyBg />
      <LobbyCard>
        {roomCode ? (
          <>
            <RoomCodeBadge>
              <FaFutbol style={{ marginRight: 10 }} />
              {roomCode}
              <CopyBtn onClick={copyRoomCode}><FaCopy /></CopyBtn>
            </RoomCodeBadge>
            <PlayerList>
              {players.map((player) => (
                <PlayerRow key={player.id}>
                  <Avatar>{player.nickname.charAt(0).toUpperCase()}</Avatar>
                  <PlayerName>{player.nickname}
                    {player.isHost && <HostIcon title="Host" />}
                  </PlayerName>
                  {isCurrentHost && !player.isHost && (
                    <KickBtn onClick={() => onKickPlayer(player.id)} title="Kick player"><FaUserSlash /></KickBtn>
                  )}
                </PlayerRow>
              ))}
            </PlayerList>
            <StartGameBtn
              onClick={onStartGame}
              disabled={!isCurrentHost || players.length < 3}
            >
              Start Game
            </StartGameBtn>
            {players.length < 3 && (
              <WaitingText>Waiting for more players to join...</WaitingText>
            )}
          </>
        ) : (
          <>
            <form onSubmit={handleCreateRoom} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  marginBottom: '16px',
                  fontSize: '1rem',
                  background: 'rgba(15,23,42,0.5)',
                  color: '#F1F5F9',
                }}
              />
              <StartGameBtn as="button" type="submit">Create Room</StartGameBtn>
            </form>
            <div style={{ margin: '20px 0', textAlign: 'center', color: '#94A3B8' }}>OR</div>
            <form onSubmit={handleJoinRoom} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Enter room code"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  marginBottom: '12px',
                  fontSize: '1rem',
                  background: 'rgba(15,23,42,0.5)',
                  color: '#F1F5F9',
                }}
              />
              <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  marginBottom: '16px',
                  fontSize: '1rem',
                  background: 'rgba(15,23,42,0.5)',
                  color: '#F1F5F9',
                }}
              />
              <StartGameBtn as="button" type="submit" secondary>Join Room</StartGameBtn>
            </form>
          </>
        )}
      </LobbyCard>
    </>
  );
}

export default Lobby; 