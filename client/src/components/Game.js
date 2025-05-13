import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFutbol, FaUserCircle } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GameContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  min-height: 70vh;
  display: flex;
  gap: 32px;
  margin: 0 auto;
  background: rgba(30,41,59,0.85);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  padding: 32px 24px;
  animation: ${fadeIn} 0.5s cubic-bezier(.39,.575,.56,1.000);
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 18px 6px;
    gap: 18px;
  }
`;

const ChatSection = styled.div`
  flex: 2;
  background: rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  padding-right: 10px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 5px; }
`;

const Message = styled.div`
  margin-bottom: 10px;
  padding: 10px 14px;
  background: rgba(99,102,241,0.08);
  border-radius: 8px;
  color: #F1F5F9;
  font-size: 1rem;
  box-shadow: 0 1px 4px rgba(99,102,241,0.04);
`;

const MessageSender = styled.span`
  font-weight: bold;
  color: #10B981;
  margin-right: 8px;
`;

const MessageForm = styled.form`
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.9);
  font-size: 1rem;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #10B981;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #10B981 0%, #6366F1 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  &:hover { background: linear-gradient(90deg, #34D399 0%, #818CF8 100%); }
`;

const InfoSection = styled.div`
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`;

const TimerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`;

const CircularTimer = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: conic-gradient(
    #10B981 ${(props) => 360 * (props.time / 60)}deg,
    #334155 ${(props) => 360 * (props.time / 60)}deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 2px 12px rgba(16,185,129,0.12);
  position: relative;
`;

const TimerText = styled.div`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RoleCard = styled.div`
  background: rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 18px 12px 12px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  margin-bottom: 10px;
`;

const PlayerImage = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 10px auto 8px auto;
  display: block;
  object-fit: cover;
  border: 3px solid ${(props) => (props.isImpostor ? '#EF4444' : '#10B981')};
  box-shadow: 0 2px 8px rgba(99,102,241,0.10);
`;

const RoleBadge = styled.div`
  background: ${(props) => (props.isImpostor ? '#EF4444' : '#10B981')};
  color: white;
  padding: 6px 18px;
  border-radius: 16px;
  display: inline-block;
  margin: 10px 0 8px 0;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 1px;
  box-shadow: 0 1px 4px rgba(239,68,68,0.08);
`;

const PlayerList = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 12px 10px;
  width: 100%;
  margin-top: 8px;
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(99,102,241,0.08);
  &:last-child { border-bottom: none; }
`;

const PlayerAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1 60%, #10B981 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OnlineDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10B981;
  margin-left: 4px;
  box-shadow: 0 0 6px #10B981;
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
        <TimerWrapper>
          <CircularTimer time={timer}>
            <TimerText>
              <FaFutbol style={{ marginRight: 6, fontSize: '1.2em' }} />
              {formatTime(timer)}
            </TimerText>
          </CircularTimer>
        </TimerWrapper>

        <RoleCard>
          <h3 style={{ color: '#F1F5F9', marginBottom: 6 }}>Your Role</h3>
          <RoleBadge isImpostor={role === 'impostor'}>
            {role === 'impostor' ? 'Impostor' : 'Regular Player'}
          </RoleBadge>
          <PlayerImage 
            src={assignedPlayer.image} 
            alt={assignedPlayer.name}
            isImpostor={role === 'impostor'}
          />
          <div style={{ color: '#94A3B8', marginTop: 6 }}>
            Your assigned player: <b>{assignedPlayer.name}</b>
          </div>
        </RoleCard>

        <PlayerList>
          <h4 style={{ color: '#10B981', margin: '0 0 8px 0', fontWeight: 700 }}>Players</h4>
          {players.map((player) => (
            <PlayerItem key={player.id}>
              <PlayerAvatar>{player.nickname.charAt(0).toUpperCase()}</PlayerAvatar>
              <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{player.nickname}</span>
              <OnlineDot title="Online" />
            </PlayerItem>
          ))}
        </PlayerList>
      </InfoSection>
    </GameContainer>
  );
}

export default Game; 