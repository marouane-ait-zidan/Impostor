import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: 70vh;
`;

const ChatSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
  }
`;

const Message = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
`;

const MessageSender = styled.span`
  font-weight: bold;
  color: #4CAF50;
  margin-right: 8px;
`;

const MessageForm = styled.form`
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4CAF50;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #45a049;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Timer = styled.div`
  font-size: 2rem;
  text-align: center;
  color: ${props => props.time <= 30 ? '#ff4444' : 'white'};
`;

const RoleCard = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
`;

const PlayerList = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
`;

const PlayerItem = styled.div`
  padding: 8px;
  margin-bottom: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
`;

function Game({ role, assignedPlayer, players, timer, messages, onSendMessage }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GameContainer>
      <ChatSection>
        <MessagesContainer>
          {messages.map((msg, index) => (
            <Message key={index}>
              <MessageSender>{msg.nickname}:</MessageSender>
              {msg.message}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        <MessageForm onSubmit={handleSubmit}>
          <MessageInput
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <SendButton type="submit">Send</SendButton>
        </MessageForm>
      </ChatSection>

      <InfoSection>
        <Timer time={timer}>
          {formatTime(timer)}
        </Timer>

        <RoleCard>
          <h3>Your Role</h3>
          <p>{role === 'impostor' ? 'You are the Impostor!' : 'You are a Regular Player'}</p>
          <p>Your assigned player: {assignedPlayer}</p>
        </RoleCard>

        <PlayerList>
          <h3>Players</h3>
          {players.map((player) => (
            <PlayerItem key={player.id}>
              {player.nickname}
            </PlayerItem>
          ))}
        </PlayerList>
      </InfoSection>
    </GameContainer>
  );
}

export default Game; 