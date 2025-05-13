import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFutbol, FaCheckCircle, FaTimesCircle, FaRedo } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ResultsBg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  background: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
  filter: blur(2px) brightness(0.7);
  z-index: 0;
`;

const ResultsContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30,41,59,0.92);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  padding: 48px 24px 32px 24px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.5s cubic-bezier(.39,.575,.56,1.000);
  @media (max-width: 600px) {
    padding: 18px 6px;
  }
`;

const Title = styled.h2`
  color: #10B981;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 18px;
  letter-spacing: 1px;
`;

const ResultCard = styled.div`
  background: rgba(255,255,255,0.10);
  border-radius: 18px;
  padding: 32px 18px 18px 18px;
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
`;

const ResultMessage = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: ${props => props.won ? '#10B981' : '#EF4444'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const MostVoted = styled.div`
  margin: 18px 0 10px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
`;

const PlayerAvatar = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #6366F1;
  box-shadow: 0 1px 6px rgba(99,102,241,0.10);
`;

const PlayerName = styled.span`
  color: #F1F5F9;
  font-size: 1.2rem;
  font-weight: 700;
`;

const VoteCounts = styled.div`
  margin-top: 18px;
  color: #94A3B8;
  font-size: 1.1rem;
  text-align: center;
`;

const VoteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  justify-content: center;
`;

const PlayAgainButton = styled.button`
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
`;

function Results({ results, onPlayAgain, isHost, players = [] }) {
  if (!results) return null;

  const { impostorCaught, impostorId, votes } = results;

  let mostVotedId = null;
  let mostVotes = 0;
  if (votes) {
    Object.entries(votes).forEach(([id, count]) => {
      if (count > mostVotes) {
        mostVotes = count;
        mostVotedId = id;
      }
    });
  }

  // Find the nickname and avatar of the most voted player
  const mostVotedPlayer = players.find(p => p.id === mostVotedId);
  const mostVotedName = mostVotedPlayer ? mostVotedPlayer.nickname : mostVotedId;
  const mostVotedAvatar = mostVotedPlayer?.assignedPlayer?.image;

  return (
    <>
      <ResultsBg />
      <ResultsContainer>
        <Title>Game Results</Title>
        <ResultCard>
          <ResultMessage won={impostorCaught}>
            {impostorCaught ? <FaCheckCircle color="#10B981" /> : <FaTimesCircle color="#EF4444" />} 
            {impostorCaught ? 'You found the impostor!' : 'Wrong guess, the impostor wins!'}
          </ResultMessage>
          {mostVotedId && (
            <MostVoted>
              {mostVotedAvatar && <PlayerAvatar src={mostVotedAvatar} alt={mostVotedName} />}
              <PlayerName>{mostVotedName}</PlayerName>
              <span style={{ color: '#6366F1', fontWeight: 600 }}>({mostVotes} votes)</span>
            </MostVoted>
          )}
          <VoteCounts>
            <b>Vote counts:</b>
            {Object.entries(votes).map(([id, count]) => {
              const player = players.find(p => p.id === id);
              return (
                <VoteRow key={id}>
                  {player?.assignedPlayer?.image && <PlayerAvatar src={player.assignedPlayer.image} alt={player.nickname} style={{ width: 32, height: 32 }} />}
                  <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{player ? player.nickname : id}</span>
                  <span style={{ color: '#6366F1', fontWeight: 600 }}>({count})</span>
                </VoteRow>
              );
            })}
          </VoteCounts>
        </ResultCard>
        {isHost && (
          <PlayAgainButton onClick={onPlayAgain}>
            <FaRedo style={{ fontSize: '1.2em' }} /> Play Again
          </PlayAgainButton>
        )}
      </ResultsContainer>
    </>
  );
}

export default Results; 