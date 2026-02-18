# Sant eller Falskt - Multiplayer Quiz Game

A real-time multiplayer "True or False" quiz game built with Socket.io, featuring swipe gestures, live scoring, and optional AI-generated questions.

## Challenge Overview

Build a complete multiplayer quiz experience where players join rooms, answer true-or-false questions by swiping, and compete on a live leaderboard. The game supports both pre-generated question banks and AI-powered question generation.

## Features

- **Multiplayer rooms** — Create or join game rooms via Socket.io
- **Swipe gestures** — Swipe right for True, left for False
- **Real-time scoring** — Points calculated based on correctness and speed
- **Leaderboard** — Live results after each round
- **Pre-generated questions** — Curated question bank with categories
- **AI questions (optional)** — Generate fresh questions with OpenAI integration
- **Progressive hints** — Hint system to help players who are stuck

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Facit (shared packages) |
| Server | Node.js + Socket.io |
| Client | Web app with touch/swipe support |
| AI (optional) | OpenAI API |

## Architecture

```
├── packages/
│   ├── server/        # Socket.io game server
│   │   ├── rooms/     # Room management
│   │   ├── game/      # Game loop & scoring
│   │   └── questions/ # Question bank & AI generation
│   └── client/        # Web client
│       ├── screens/   # Home, Lobby, Game, Results
│       └── gestures/  # Swipe detection
└── shared/            # Types, constants, utilities
```

## Game Flow

1. **Home** — Player enters a nickname
2. **Lobby** — Create a new room or join an existing one; wait for players
3. **Game** — Questions appear one at a time; swipe right (True) or left (False) before time runs out
4. **Results** — Leaderboard shows scores; option to play again

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI-generated questions | No |

## User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-001 | Create challenge README | 1 |
| US-002 | Create progressive hints system | 2 |
| US-003 | Scaffold facit monorepo project | 3 |
| US-004 | Build pre-generated question bank | 4 |
| US-005 | Implement Socket.io room management on server | 4 |
| US-006 | Implement server-side scoring and game loop | 4 |
| US-007 | Build client screens: Home and Lobby | 4 |
| US-008 | Build client game screen with swipe gestures | 4 |
| US-009 | Build client results screen with leaderboard | 4 |
| US-010 | Add AI-generated question support (optional) | 1 |

## License

Private — Hackfriday project
