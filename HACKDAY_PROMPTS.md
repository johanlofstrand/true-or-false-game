# Hackday Prompts — True or False Game

Ready-made prompts for each step in `HACKDAY_GUIDE.md`. Paste them into your AI coding assistant (Claude Code, Cursor, etc.).

> **Tip:** Read the output before moving to the next step. If something looks wrong, ask a follow-up question before continuing.

---

## Step 1 — Project setup

```
Create a TypeScript monorepo for a multiplayer web game called "true-or-false-game" using pnpm workspaces.

Structure:
- Root package.json with workspaces pointing to packages/*
- pnpm-workspace.yaml
- tsconfig.base.json with strict TypeScript settings, ESM module output ("NodeNext"), and "bundler" moduleResolution
- packages/shared/ — empty package for now, name "@game/shared", type "module"
- packages/server/ — Node.js server package, name "@game/server", type "module", depends on "@game/shared"
- packages/server/tsconfig.json extending the base config, outDir ./dist
- packages/client/ — React/Vite app, name "@game/client", created with Vite's react-ts template structure
- packages/client/vite.config.ts with a proxy: /socket.io → http://localhost:3001

Each package should have a dev script and a build script. The root package.json should have scripts to run all packages in parallel (dev) and sequentially (build).

Dependencies:
- server: express, socket.io, tsx (dev), @types/express, @types/node
- client: react, react-dom, socket.io-client, @vitejs/plugin-react (dev), vite (dev)

Use pnpm to install. Show me the final file structure when done.
```

---

## Step 2 — Shared types

```
In packages/shared/src/index.ts (and types.ts), define these TypeScript types and constants for a True or False multiplayer quiz game. The shared package should compile with tsc (add a build script and tsconfig).

Types needed:

Question {
  id: string
  statement: string
  isTrue: boolean
  category?: string
  source?: string
  hints?: string[]
}

Player {
  id: string    // socket id
  name: string
  score: number
}

RoomStatus = "lobby" | "playing" | "finished"

GameSettings {
  questionCount: number
  timePerQuestion: number   // seconds
  hintsEnabled: boolean
  useAI: boolean
}

DEFAULT_GAME_SETTINGS constant with: questionCount=10, timePerQuestion=15, hintsEnabled=true, useAI=false

Room {
  id: string
  code: string              // 4-letter join code
  hostId: string
  players: Player[]
  status: RoomStatus
  currentQuestionIndex: number
  questions: Question[]
  settings: GameSettings
}

LeaderboardEntry {
  player: Player
  rank: number
  correctAnswers: number
  totalQuestions: number
  averageTimeMs: number
}

ClientToServerEvents (Socket.IO events from client to server):
  "room:create": (playerName: string) => void
  "room:join": (roomCode: string, playerName: string) => void
  "room:leave": () => void
  "room:updateSettings": (settings: Partial<GameSettings>) => void
  "game:start": () => void
  "game:answer": (answer: boolean) => void
  "hint:request": () => void

ServerToClientEvents (Socket.IO events from server to client):
  "room:created": (room: Room) => void
  "room:joined": (room: Room) => void
  "room:playerJoined": (player: Player) => void
  "room:playerLeft": (playerId: string) => void
  "room:settingsUpdated": (settings: GameSettings) => void
  "game:started": () => void
  "game:question": (question: Omit<Question, "isTrue">, index: number) => void
  "game:timeUp": () => void
  "game:result": (correct: boolean, correctAnswer: boolean, scoreAwarded: number) => void
  "game:scores": (players: Player[]) => void
  "game:finished": (leaderboard: LeaderboardEntry[]) => void
  "hint:revealed": (hint: { level: 1|2|3, text: string }, scoreMultiplier: number) => void
  "hint:none": () => void
  "error": (message: string) => void

Export everything from index.ts. Make sure the package's "main" field points to ./dist/index.js.
```

---

## Step 3 — Server foundation

```
Set up the server in packages/server/src/index.ts.

Requirements:
- Express app + Node http server + Socket.IO server
- CORS enabled (allow all origins for development)
- PORT from process.env.PORT or fallback to 3001
- GET /health endpoint returning { status: "ok" }
- Socket.IO connection handler that logs "Player connected: <socket.id>" on connect and "Player disconnected: <socket.id>" on disconnect
- Use the typed Socket.IO generics from @game/shared: Server<ClientToServerEvents, ServerToClientEvents>
- Start listening and log the port

The dev script in packages/server/package.json should use: tsx watch src/index.ts

Show me the running server output after starting it.
```

---

## Step 4 — Client foundation

```
Set up the React client in packages/client/src/.

Create a custom hook useSocket.ts that:
- Creates a Socket.IO connection using io() with transports ["websocket", "polling"]
- Tracks connected state
- Returns the socket only when connected (null otherwise)
- Cleans up (disconnects) on unmount
- Types the socket with AppSocket = Socket<ServerToClientEvents, ClientToServerEvents> from @game/shared

In App.tsx:
- Use the useSocket hook
- While not connected: render a centered "Connecting..." message
- When connected: render "Connected! Ready to play."

Make sure vite.config.ts proxies /socket.io → http://localhost:3001 with ws: true.

Test by running both server and client and confirming the "Connected!" message appears and the server logs the connection.
```

---

## Step 5 — Room system

```
Implement the room creation and joining system.

SERVER — create packages/server/src/rooms.ts with a RoomManager class:
- rooms: Map<roomId, Room>
- socketToRoom: Map<socketId, roomId>
- codeToRoomId: Map<code, roomId>

Methods:
- createRoom(socketId, playerName): generates a random 4-char uppercase room code (no I/O to avoid confusion), creates room with the player as host, stores it
- joinRoom(socketId, roomCode, playerName): looks up room by code, adds player, returns {room, player} or null if not found/game in progress
- leaveRoom(socketId): removes player, deletes room if empty, reassigns host to next player if host left
- getRoomBySocket(socketId): returns the room the socket is in
- getSocketRoomName(roomId): returns "room:<roomId>" (Socket.IO room name for broadcasting)

In packages/server/src/index.ts, add Socket.IO event handlers:
- "room:create": call roomManager.createRoom, socket.join the Socket.IO room, emit "room:created" to the socket
- "room:join": call roomManager.joinRoom, emit "room:joined" to joiner, emit "room:playerJoined" to others in the room
- "room:leave": call roomManager.leaveRoom, notify remaining players with "room:playerLeft"
- "disconnect": same as room:leave

CLIENT — build a home screen with two forms:
1. Create Room: name input + "Create Room" button
2. Join Room: name input + room code input + "Join Room" button

After creating a room, show a lobby screen with:
- The 4-letter room code (large, easy to share)
- List of player names as they join in real time

After joining a room, show the same lobby screen.

Use a useRoom hook to manage room state and handle all socket events.
```

---

## Step 6 — Lobby screen

```
Build the lobby screen component.

Show:
- Room code prominently (e.g. "Room: ABCD")
- List of all players currently in the room, with the host marked (e.g. "(host)" label)
- If the current player is the host: a "Start Game" button
  - Disabled with tooltip if fewer than 2 players are in the room
  - On click: emit "game:start"
- A "Leave Room" button for all players

On the server, handle "game:start":
- Validate: player is host, room is in lobby status, at least 2 players
- If invalid: emit "error" back to the socket
- If valid: change room status to "playing", emit "game:started" to everyone in the room

The client transitions from the lobby screen to the game screen when it receives "game:started".
```

---

## Step 7 — Question bank

```
Create a static question bank in packages/server/src/questions.ts.

Write 20 True/False questions as a typed array of Question objects. Cover a variety of topics: science, history, geography, animals, culture, mythology, food, space. Make sure roughly half are true and half are false. False statements should be common misconceptions, not obviously wrong.

Each question needs:
- id: unique string (e.g. "q1", "q2")
- statement: the factual claim to evaluate
- isTrue: boolean
- category: topic area
- source: brief attribution or explanation

Export a getQuestions(count: number): Question[] function that shuffles the bank using Fisher-Yates and returns the first `count` questions.

In the RoomManager's createRoom method, call getQuestions(settings.questionCount) and store the questions in the room.
```

---

## Step 8 — Game flow

```
Implement the full game loop.

SERVER — create packages/server/src/game-manager.ts with a GameManager class.

Internal state per active game:
- currentQuestionIndex
- questionStartTime (Date.now() when question was sent)
- timer (setTimeout handle)
- playerStates: Map<socketId, { answered, answer, correct, timeMs, scoreAwarded }>
- answerHistory: Map<socketId, state[]>
- advancing: boolean (race guard to prevent double-advancing)

Methods:
- startGame(room, io, ...): validate, reset scores, emit "game:started", send first question after 500ms delay
- sendQuestion(room, io, ...): emit "game:question" with question (WITHOUT isTrue field), start countdown timer
- handleAnswer(socketId, answer, room, io, ...):
    - Ignore if already answered
    - Calculate timeMs = Date.now() - questionStartTime
    - Correct = answer === question.isTrue
    - Score = correct ? Math.round(1000 * (1 - timeRatio * 0.5)) : 0  where timeRatio = timeMs / (timeLimit * 1000)
    - Emit "game:result" to the answering socket
    - If all players answered: call advanceOrFinish
- handleTimeUp: mark unanswered players, emit "game:timeUp" to room, emit "game:result" (wrong, 0 points) to unanswered players, call advanceOrFinish
- advanceOrFinish: emit "game:scores" to room, increment index, if more questions: sendQuestion after 2s delay, else finishGame after 2s delay
- finishGame: build leaderboard (sorted by score, include correctAnswers count and averageTimeMs), emit "game:finished", clean up

CLIENT — game screen:
- Show question statement in large text
- Show question number and total (e.g. "Question 3 / 10")
- Show a countdown timer bar that depletes over the time limit
- Two large buttons: TRUE and FALSE (disabled after answering)
- After answering: show "Correct! +750 pts" or "Wrong! The answer was TRUE/FALSE"
- Between questions: show current scores for all players briefly

Handle all server events: "game:question", "game:timeUp", "game:result", "game:scores", "game:finished".
```

---

## Step 9 — Results screen

```
Build the results screen shown after "game:finished".

Display:
- "Game Over!" heading
- Ranked leaderboard table with columns: Rank, Name, Score, Correct, Avg. Time
- Highlight the current player's row
- Gold/silver/bronze styling for top 3
- If current player is host: "Play Again" button that emits "room:updateSettings" with no changes (to reset questions) and then a "room:create" or navigate back to lobby
- "Leave" button for all players

On the server, when a player emits "game:start" again from a finished room, reset the room status to "lobby" and re-fetch questions so a new game can begin.

Make sure the results screen is reachable on mobile (scrollable if many players).
```

---

## Step 10 — Hints (optional)

```
Add a progressive hint system.

Each question has up to 3 hints, ordered from vague to specific:
- Hint 1 (vague): a general category clue — score multiplier 0.75
- Hint 2 (medium): a narrower contextual clue — score multiplier 0.50
- Hint 3 (specific): nearly gives it away — score multiplier 0.25

Add 3 hints to each question in the question bank.

SERVER — create a HintTracker class in packages/server/src/hints.ts:
- Track which hint level each player has revealed per question
- getNextLevel(socketId, questionId): returns 1, 2, 3, or null if all revealed
- getScoreMultiplier(socketId, questionId): returns the multiplier for the highest hint used (1.0 if no hints used)
- recordHint(socketId, questionId, level): records a hint was used
- reset(): clears all state between games

Handle "hint:request" socket event:
- Get the player's current question
- Get the next hint level
- Emit "hint:revealed" with the hint text and updated score multiplier
- If no more hints: emit "hint:none"

CLIENT — add a "Hint" button to the game screen (only visible before answering):
- On click: emit "hint:request"
- On "hint:revealed": show hint text and updated multiplier warning (e.g. "Score reduced to 50%")
- Disable hint button when all 3 hints are used or after answering

Apply the hint multiplier in the server's score calculation.
```

---

## Step 11 — Game settings (optional)

```
Add configurable game settings editable by the host in the lobby.

Settings to add:
- Question count: options 5, 10, 20
- Time per question: options 10, 15, 30 seconds

UI: show a settings panel in the lobby screen, visible to everyone but only the host can change values (others see them read-only).

When the host changes a setting, emit "room:updateSettings" with the partial GameSettings object.

SERVER — handle "room:updateSettings":
- Validate: sender is host, room is in lobby
- Merge new settings into room.settings
- If questionCount changed: re-fetch questions with the new count
- Emit "room:settingsUpdated" with the full updated GameSettings to everyone in the room

CLIENT — update the lobby screen when "room:settingsUpdated" is received so all players see the current settings.
```

---

## Step 12 — AI-generated questions (optional)

```
Integrate OpenAI to generate unique questions for each game.

SERVER — create packages/server/src/ai-questions.ts:

Function generateAIQuestions(count: number): Promise<Question[]>
- Requires OPENAI_API_KEY environment variable (use the openai npm package)
- Use model "gpt-4o-mini"
- System prompt: explain it's a True/False quiz generator, request a JSON array with fields: statement, isTrue, category, source, hints (array of 3 strings from vague to specific)
- User message: "Generate {count} true/false quiz questions."
- Parse the JSON response and map to Question objects with generated IDs
- On any failure: log the error and return [] (empty array — triggers fallback)

Function isAIAvailable(): boolean — returns true if OPENAI_API_KEY is set

In RoomManager.createRoom and updateSettings:
- If settings.useAI is true and isAIAvailable(): call generateAIQuestions
- If it returns empty: fall back to getQuestions from the question bank

Add a GET /config endpoint returning { aiAvailable: isAIAvailable() } so the client knows whether to show the AI toggle.

Add useAI toggle to the game settings in the lobby (only shown if aiAvailable is true from /config).

Add OPENAI_API_KEY to your .env file (create one in the root, and add .env to .gitignore if not already there).
```

---

## Step 13 — Deploy to Render

```
Prepare the app for production deployment on Render (free tier).

Changes needed:

1. packages/server/src/index.ts — serve the built React client as static files in production:
   - Import path and fileURLToPath to get __dirname in ESM
   - If NODE_ENV === "production": app.use(express.static(path.join(__dirname, "../../client/dist")))
   - Add a catch-all route AFTER all API routes: app.get("*", ...) to serve index.html (SPA fallback)

2. Create render.yaml in the project root:
   services:
     - type: web
       name: true-or-false-game
       runtime: node
       buildCommand: pnpm install --frozen-lockfile && pnpm build
       startCommand: node packages/server/dist/index.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: OPENAI_API_KEY
           sync: false

3. Make sure the build order in the root package.json is: shared → client → server

4. Push everything to GitHub. Go to render.com, connect your repo, and deploy.
   Add OPENAI_API_KEY as an environment variable in the Render dashboard if you want AI questions.

Show me the final render.yaml and the updated server index.ts static-serving code.
```

---

## Troubleshooting prompts

**If Socket.IO events aren't arriving:**
```
My Socket.IO events aren't reaching the server. The client connects successfully (I see "connected" in the browser console) but when I emit "room:create" nothing happens on the server. Show me how to debug this — what to check on both client and server side.
```

**If TypeScript errors appear after changes:**
```
I'm getting TypeScript errors after my latest changes. Here are the errors: [paste errors]. The relevant files are [paste file contents]. Fix these errors without changing the intended behavior.
```

**If the timer or game state gets out of sync:**
```
The game timer gets out of sync between players — one player sees time run out while another is still answering. My current game-manager.ts looks like this: [paste file]. What's causing the desync and how should I fix it?
```

**If deployment fails:**
```
My Render deployment is failing with this error: [paste error]. My render.yaml is: [paste]. My root package.json build script is: [paste]. What's wrong and how do I fix it?
```
