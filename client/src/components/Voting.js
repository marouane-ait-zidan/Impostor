import React from 'react';
import styled from 'styled-components';

const VotingContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #fff;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PlayerCard = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const Instructions = styled.p`
  margin-bottom: 20px;
  color: #ccc;
  font-size: 1.1rem;
`;

function Voting({ players, onVote }) {
  return (
    <VotingContainer>
      <Title>Vote for the Impostor</Title>
      <Instructions>
        Choose who you think is the impostor. Be careful with your choice!
      </Instructions>
      
      <PlayerGrid>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            onClick={() => onVote(player.id)}
          >
            {player.nickname}
          </PlayerCard>
        ))}
      </PlayerGrid>
    </VotingContainer>
  );
}

export default Voting; 