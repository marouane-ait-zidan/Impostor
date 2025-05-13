# Football Impostor - Client

The frontend for the Football Impostor game, built with React and Socket.IO.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_SERVER_URL=http://localhost:3001
   ```
   Replace the URL with your server's URL if different.

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000.

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
src/
├── components/         # React components
│   ├── Game.js        # Main game screen
│   ├── Lobby.js       # Room creation/joining
│   ├── Results.js     # Game results screen
│   └── Voting.js      # Voting phase
├── App.js             # Main application component
└── index.js           # Application entry point
```

## Development

- Built with React 18
- Styled with styled-components
- Real-time communication with Socket.IO
- Modern ES6+ JavaScript 