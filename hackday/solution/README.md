# True or False — Multiplayer Quiz Game

A real-time multiplayer True or False game built with Node.js, TypeScript, Socket.IO, and React.

## Getting started

**Prerequisites:** Node.js 20+, pnpm

```bash
# Install dependencies
pnpm install

# Build shared types (required before first dev run)
pnpm build:shared

# Start server + client in development mode
pnpm dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## How to play

1. Open the app and enter your name, then click **Create Room**
2. Share the 4-letter code with friends
3. Friends open the app, enter the code, and click **Join Room**
4. The host clicks **Start Game** once at least 2 players have joined
5. Answer each True/False statement before the timer runs out
6. Faster correct answers score more points (up to 1000 per question)
7. Final rankings are shown after the last question

## Project structure

```
packages/
  shared/   TypeScript types shared between server and client
  server/   Node.js + Express + Socket.IO backend
  client/   React + Vite frontend
```

## Production build

```bash
pnpm build
node packages/server/dist/index.js
```
