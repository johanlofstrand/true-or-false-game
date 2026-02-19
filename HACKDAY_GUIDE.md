# Hackday Guide: Build a Multiplayer True or False Game

Build a real-time multiplayer quiz game from scratch using an AI coding assistant. Each step below describes **what to build** and **what you'll have** when it's done. Use the companion file `HACKDAY_PROMPTS.md` for ready-made prompts to paste into your AI assistant.

---

## What you're building

A real-time "True or False" trivia game where:
- A host creates a room and shares a 4-letter code
- Friends join on their phones or laptops
- Everyone answers the same questions simultaneously
- Speed and correctness determine your score
- A leaderboard shows the final rankings

**Tech stack:** TypeScript, Node.js, Express, Socket.IO, React, Vite

---

## Prerequisites

- Node.js 20+ installed
- `pnpm` installed (`npm install -g pnpm`)
- An AI coding assistant (Claude Code, Cursor, etc.)
- A GitHub account (for deployment)

---

## Step 1 — Project setup

**Goal:** Create a monorepo with three packages: `shared`, `server`, and `client`.

A monorepo lets all packages share types and be built together. You'll set up pnpm workspaces and TypeScript.

**When done you'll have:**
```
my-game/
  package.json          ← root workspace
  pnpm-workspace.yaml
  tsconfig.base.json
  packages/
    shared/             ← shared TypeScript types
    server/             ← Node.js backend
    client/             ← React frontend
```

---

## Step 2 — Shared types

**Goal:** Define all TypeScript types in the `shared` package that both server and client will use.

This is the contract between frontend and backend. Defining it first makes everything else easier.

**Types to define:**
- `Question` — a trivia statement with a true/false answer
- `Player` — name and score
- `Room` — game room with players, status, and questions
- `GameSettings` — configurable options (question count, time limit, etc.)
- `ClientToServerEvents` — Socket.IO events the client sends
- `ServerToClientEvents` — Socket.IO events the server sends

**When done you'll have:** A compiled `@game/shared` package importable by both server and client.

---

## Step 3 — Server foundation

**Goal:** A running Express + Socket.IO server that clients can connect to.

**When done you'll have:**
- Server running on port 3001
- A `/health` endpoint returning `{ status: "ok" }`
- Socket.IO accepting connections (logs connected socket IDs)
- `pnpm dev` starts the server with hot reload via `tsx watch`

---

## Step 4 — Client foundation

**Goal:** A React + Vite app that connects to the server via Socket.IO.

**When done you'll have:**
- React app running on port 5173
- Vite proxy forwarding `/socket.io` requests to the server
- A `useSocket` hook that manages the Socket.IO connection
- The app shows "Connecting..." until connected, then "Connected!"

---

## Step 5 — Room system

**Goal:** Players can create and join game rooms.

A room has a randomly generated 4-letter code. The player who creates it is the host. Others join by entering the code.

**Server side:**
- Handle `room:create` event — generate unique room code, store room in memory, emit `room:created` back
- Handle `room:join` event — look up room by code, add player, emit `room:joined` to joiner and `room:playerJoined` to others
- Handle `room:leave` and `disconnect` — remove player, delete room if empty, reassign host if needed

**Client side:**
- Home screen with "Create Room" and "Join Room" inputs
- After creating: show the 4-letter code for others to use
- After joining: show who's in the room

**When done you'll have:** Multiple browser tabs can join the same room and see each other's names appear in real time.

---

## Step 6 — Lobby screen

**Goal:** A waiting room where players can see who's joined and the host can start the game.

**When done you'll have:**
- List of all players in the room
- A "Start Game" button visible only to the host (disabled if fewer than 2 players)
- The host emits `game:start`, server validates and emits `game:started` to all

---

## Step 7 — Question bank

**Goal:** A hardcoded list of True/False questions the server can serve.

Write at least 20 questions with:
- `statement` — the claim to evaluate
- `isTrue` — the correct answer
- `category` — e.g. "Science", "History"
- `source` — brief attribution

The server should shuffle and pick N questions when a room is created.

**When done you'll have:** Questions ready to be used in the game flow.

---

## Step 8 — Game flow

**Goal:** The core gameplay loop — questions with a countdown timer, players answer simultaneously, scores are calculated.

**Server side:**
- On game start, send the first question (without revealing `isTrue`) via `game:question`
- Start a countdown timer (e.g. 15 seconds)
- Handle `game:answer` events — record answer, calculate score based on speed and correctness
- When all players have answered (or timer runs out): emit `game:timeUp`, then `game:result` to each player, then `game:scores` to all, then move to next question
- After the last question: emit `game:finished` with a leaderboard

**Scoring formula:** Correct answer = up to 1000 points. Faster answers score more. Wrong answer = 0 points.

**Client side:**
- Game screen showing the statement
- Two big buttons: TRUE and FALSE
- Countdown timer bar
- After answering: show whether you were right/wrong and points earned
- Between questions: show current scores

**When done you'll have:** A fully playable game from start to finish.

---

## Step 9 — Results screen

**Goal:** Show a leaderboard after the game ends.

**When done you'll have:**
- Ranked list of all players with final scores
- Correct answer count for each player
- Average response time
- "Play Again" button (host only) that resets the room to lobby
- "Leave" button

---

## Step 10 — Hints (optional)

**Goal:** Players can request hints during a question, at the cost of a score penalty.

Add 3 progressive hints per question (from vague to specific). Each hint requested reduces the score multiplier:
- Hint 1: 75% of normal score
- Hint 2: 50% of normal score
- Hint 3: 25% of normal score

**When done you'll have:** A "Hint" button on the game screen that reveals one hint at a time.

---

## Step 11 — Game settings (optional)

**Goal:** The host can configure the game before starting.

Settings to add:
- Number of questions (e.g. 5, 10, 20)
- Time per question (e.g. 10, 15, 30 seconds)

When settings change, the server re-selects questions. Emit `room:settingsUpdated` to all players.

**When done you'll have:** A settings panel in the lobby, visible and editable only by the host.

---

## Step 12 — AI-generated questions (optional)

**Goal:** Use OpenAI to generate fresh questions instead of using the hardcoded bank.

- Add an `OPENAI_API_KEY` environment variable
- Call the OpenAI API to generate N questions in JSON format
- Fall back to the question bank if the API call fails
- Add a toggle in settings: "Use AI questions"

**When done you'll have:** Every game session gets unique questions generated on demand.

---

## Step 13 — Deploy

**Goal:** Put the game online so anyone can play from their phone.

Use **Render** (free tier):
1. The server will serve the built React client as static files in production
2. Push code to GitHub
3. Connect repo to Render → it builds and deploys automatically
4. Share the URL — game is live

**When done you'll have:** A public URL like `your-game.onrender.com` that anyone can access.

---

## Tips for the day

- **Work in order.** Each step depends on the previous. Don't skip ahead.
- **Test in two browser tabs** from Step 5 onwards to simulate two players.
- **Commit after each step.** Small commits make it easy to recover if something breaks.
- **The prompts file has ready-to-use prompts** for each step — paste them directly into your AI assistant.
- **Don't gold-plate.** A working ugly game is more fun than a beautiful broken one.
