import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFutbol } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const VotingBg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  background: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
  filter: blur(2px) brightness(0.7);
  z-index: 0;
`;

const VotingContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  background: rgba(30,41,59,0.92);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  padding: 40px 24px 32px 24px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.5s cubic-bezier(.39,.575,.56,1.000);
  @media (max-width: 600px) {
    padding: 18px 6px;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #10B981;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  width: 100%;
  padding: 20px 0;
`;

const PlayerCard = styled.div`
  background: rgba(255,255,255,0.10);
  border-radius: 16px;
  padding: 18px 10px 12px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.39,.575,.56,1.000);
  border: 2.5px solid transparent;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  position: relative;
  &:hover {
    background: rgba(16,185,129,0.10);
    transform: translateY(-2px) scale(1.03);
  }
  ${(props) => props.selected && `
    border-color: #10B981;
    background: rgba(16,185,129,0.18);
    box-shadow: 0 0 16px #10B98144;
  `}
`;

const PlayerImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 auto 10px auto;
  display: block;
  object-fit: cover;
  border: 2.5px solid #6366F1;
  box-shadow: 0 1px 6px rgba(99,102,241,0.10);
`;

const PlayerName = styled.h3`
  margin: 10px 0 0 0;
  color: #F1F5F9;
  font-size: 1.1rem;
  font-weight: 600;
`;

const VoteButton = styled.button`
  background: linear-gradient(90deg, #10B981 0%, #6366F1 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 24px;
  align-self: center;
  box-shadow: 0 4px 16px rgba(99,102,241,0.18);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s, box-shadow 0.2s;
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

function Voting({ players, onVote, timer, gameState }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleVote = () => {
    if (selectedPlayer) {
      console.log('Vote button clicked for:', selectedPlayer.id);
      onVote(selectedPlayer.id);
    }
  };

  const votingDisabled = timer <= 0 || gameState === 'results';

  return (
    <>
      <VotingBg />
      <VotingContainer>
        <Title><FaFutbol style={{ marginRight: 10, color: '#F59E0B' }} />Vote for the Impostor</Title>
        <PlayersGrid>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              selected={selectedPlayer?.id === player.id}
            >
              <PlayerImage
                src={player.assignedPlayer?.image}
                alt={player.nickname}
              />
              <PlayerName>{player.nickname}</PlayerName>
            </PlayerCard>
          ))}
        </PlayersGrid>
        <VoteButton
          onClick={handleVote}
          disabled={!selectedPlayer || votingDisabled}
        >
          <FaFutbol style={{ fontSize: '1.2em' }} /> Submit Vote
        </VoteButton>
      </VotingContainer>
    </>
  );
}

export default Voting; 