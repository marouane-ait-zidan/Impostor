# Football Impostor Game

A real-time multiplayer web game where players try to identify the impostor among them. Built with React, Node.js, and Socket.IO.

## Features

- Real-time multiplayer gameplay
- Private rooms with up to 6 players
- Real-time chat system
- Role assignment (5 regular players, 1 impostor)
- Voting system
- Clean and modern UI
- No registration required

## Project Structure

```
football-impostor/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
└── server/                # Node.js backend
    └── src/               # Server source code
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Game Rules

1. Up to 6 players can join a private room
2. Five players are assigned the same football player's name
3. One random player is assigned a different name (the impostor)
4. Players chat and try to identify the impostor
5. After the time limit, players vote for who they think is the impostor
6. If the majority votes correctly, the regular players win
7. If the majority votes incorrectly, the impostor wins

## Technologies Used

- Frontend: React, Socket.IO-client
- Backend: Node.js, Express, Socket.IO
- Styling: CSS Modules
- Deployment: Vercel (frontend), Render (backend) 