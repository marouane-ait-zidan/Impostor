import React from 'react';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
`;

const ResultTitle = styled.h2`
  margin-bottom: 20px;
  color: ${props => props.impostorCaught ? '#4CAF50' : '#ff4444'};
`;

const ResultMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #fff;
`;

const VoteResults = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const VoteItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
`;

const PlayAgainButton = styled.button`
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #45a049;
  }
`;

function Results({ results, players, onPlayAgain }) {
  const getPlayerNickname = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.nickname : 'Unknown';
  };

  return (
    <ResultsContainer>
      <ResultTitle impostorCaught={results.impostorCaught}>
        {results.impostorCaught ? 'Impostor Caught!' : 'Impostor Wins!'}
      </ResultTitle>

      <ResultMessage>
        The impostor was {getPlayerNickname(results.impostorId)}
      </ResultMessage>

      <VoteResults>
        <h3>Voting Results:</h3>
        {Object.entries(results.votes).map(([playerId, voteCount]) => (
          <VoteItem key={playerId}>
            <span>{getPlayerNickname(playerId)}</span>
            <span>{voteCount} votes</span>
          </VoteItem>
        ))}
      </VoteResults>

      <PlayAgainButton onClick={onPlayAgain}>
        Play Again
      </PlayAgainButton>
    </ResultsContainer>
  );
}

export default Results; 