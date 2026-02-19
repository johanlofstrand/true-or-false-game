# Solution Write-up — True or False Game

## Model used

**Claude Sonnet 4.6** (claude-sonnet-4-6), via Claude Code CLI.

## How it was built

The solution was built in a single uninterrupted session by following the prompts in `HACKDAY_PROMPTS-EN.md` (steps 1–7), without looking at any existing code.

### What the AI decided on its own

Given only the goal ("build a multiplayer True or False quiz game in Node.js and TypeScript"), Claude chose:

- **Monorepo with pnpm workspaces** — three packages: `shared`, `server`, `client`
- **Socket.IO** for real-time communication between server and clients
- **Express** as the HTTP server base
- **React + Vite** for the frontend
- **In-memory state** (Maps) for rooms and game state — no database needed
- **CommonJS** for the server to avoid ESM/CJS interop complexity

### Architecture decisions

| Concern | Decision |
|---|---|
| Shared types | Compiled TypeScript package imported by both server and client |
| Room codes | 4-letter uppercase codes, excluding I and O to avoid confusion |
| Game timing | Server is authoritative; client timer is visual only |
| Scoring | `1000 × (1 − timeRatio × 0.5)` — correct answers score 500–1000 pts based on speed |
| Disconnect handling | Game continues; if all remaining players have answered, round advances |
| Play again | Host emits `game:start` from finished state; server re-shuffles questions |

### Files created (21 source files)

```
hackday/solution/
  package.json, pnpm-workspace.yaml, tsconfig.base.json
  packages/
    shared/src/index.ts          ← all shared TypeScript types and interfaces
    server/src/index.ts          ← Express + Socket.IO server, event handlers
    server/src/rooms.ts          ← RoomManager: create/join/leave rooms
    server/src/game.ts           ← GameManager: game loop, scoring, leaderboard
    server/src/questions.ts      ← 20 true/false questions, Fisher-Yates shuffle
    client/src/App.tsx           ← main state machine, all socket event handlers
    client/src/hooks/useSocket.ts
    client/src/screens/Home.tsx
    client/src/screens/Lobby.tsx
    client/src/screens/Game.tsx  ← countdown timer, true/false buttons
    client/src/screens/Scores.tsx
    client/src/screens/Results.tsx
    client/src/App.css           ← full dark theme, mobile-first
```

### Verified with an automated test

After building, a test script (`test-game.mjs`) simulated two players — Alice and Bob — connecting, joining a room, and playing through all 10 questions. The game ran without errors and produced a correct leaderboard.

**Test result:**
```
🥇 1. Alice    4902 pts  5/10 correct  (avg 0.58s)
🥈 2. Bob      4850 pts  5/10 correct  (avg 0.90s)
```

Alice won by 52 points — both got 5/10, but she answered faster.

---

## How to start the game

**Prerequisites:** Node.js 20+, pnpm

```bash
cd hackday/solution

# First time only
pnpm install
pnpm build:shared

# Start server + client
pnpm dev
```

Open **http://localhost:5173** in two browser tabs (or on two devices on the same network).

1. Tab 1: Enter a name → **Create Room** — note the 4-letter code
2. Tab 2: Enter a name + the code → **Join Room**
3. Tab 1 (host): Click **Start Game**
4. Answer True or False before the timer runs out — faster correct answers score more
5. Final leaderboard shown after the last question
