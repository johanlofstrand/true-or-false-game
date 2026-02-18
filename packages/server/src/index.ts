import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Question,
} from "@facit/shared";
import { generateHints, HintTracker } from "./hints.js";
import { RoomManager } from "./rooms.js";
import { GameManager } from "./game-manager.js";

const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

// ── State ────────────────────────────────────────────────
const roomManager = new RoomManager();
const hintTracker = new HintTracker();
const gameManager = new GameManager();

// Maps socket.id → their current question (set during game flow).
const playerCurrentQuestion = new Map<string, Question>();

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // ── Room events ──────────────────────────────────────

  socket.on("room:create", async (playerName) => {
    // Leave any existing room first
    const existing = roomManager.getRoomBySocket(socket.id);
    if (existing) {
      socket.leave(roomManager.getSocketRoomName(existing.id));
      const { room: leftRoom, deleted } = roomManager.leaveRoom(socket.id);
      if (leftRoom && !deleted) {
        const socketRoom = roomManager.getSocketRoomName(leftRoom.id);
        io.to(socketRoom).emit("room:playerLeft", socket.id);
      }
    }

    const room = await roomManager.createRoom(socket.id, playerName);
    const socketRoom = roomManager.getSocketRoomName(room.id);
    socket.join(socketRoom);
    socket.emit("room:created", room);
    console.log(`Room ${room.code} created by ${playerName} (${socket.id})`);
  });

  socket.on("room:join", (roomCode, playerName) => {
    const result = roomManager.joinRoom(socket.id, roomCode, playerName);
    if (!result) {
      socket.emit("error", "Room not found or game already in progress.");
      return;
    }

    const { room, player } = result;
    const socketRoom = roomManager.getSocketRoomName(room.id);
    socket.join(socketRoom);

    // Notify the joining player with full room state
    socket.emit("room:joined", room);

    // Notify other players in the room
    socket.to(socketRoom).emit("room:playerJoined", player);
    console.log(`${playerName} (${socket.id}) joined room ${room.code}`);
  });

  socket.on("room:leave", () => {
    handleLeave(socket.id);
  });

  // ── Game events ──────────────────────────────────────

  socket.on("game:start", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) {
      socket.emit("error", "You are not in a room.");
      return;
    }
    if (room.hostId !== socket.id) {
      socket.emit("error", "Only the host can start the game.");
      return;
    }

    const started = gameManager.startGame(
      room,
      io,
      hintTracker,
      playerCurrentQuestion,
    );
    if (!started) {
      socket.emit("error", "Cannot start game. Need at least 2 players and be in lobby.");
    }
  });

  socket.on("game:answer", (answer) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== "playing") return;

    gameManager.handleAnswer(
      socket.id,
      answer,
      room,
      io,
      hintTracker,
      playerCurrentQuestion,
    );
  });

  // ── Hint events ──────────────────────────────────────

  socket.on("hint:request", () => {
    const question = playerCurrentQuestion.get(socket.id);
    if (!question) {
      socket.emit("hint:none");
      return;
    }

    const nextLevel = hintTracker.getNextLevel(socket.id, question.id);
    if (nextLevel === null) {
      socket.emit("hint:none");
      return;
    }

    const hints = generateHints(question);
    const hint = hints.find((h) => h.level === nextLevel);
    if (!hint) {
      socket.emit("hint:none");
      return;
    }

    hintTracker.recordHint(socket.id, question.id, nextLevel);
    const multiplier = hintTracker.getScoreMultiplier(socket.id, question.id);
    socket.emit("hint:revealed", hint, multiplier);
  });

  // ── Disconnect ───────────────────────────────────────

  socket.on("disconnect", () => {
    handleLeave(socket.id);
    playerCurrentQuestion.delete(socket.id);
    console.log(`Player disconnected: ${socket.id}`);
  });

  // ── Helpers ──────────────────────────────────────────

  function handleLeave(socketId: string) {
    // Handle active game disconnect before leaving the room
    const roomBeforeLeave = roomManager.getRoomBySocket(socketId);
    if (roomBeforeLeave && roomBeforeLeave.status === "playing") {
      gameManager.handlePlayerDisconnect(
        socketId,
        roomBeforeLeave,
        io,
        hintTracker,
        playerCurrentQuestion,
      );
    }

    const socketRoom = roomManager.getSocketRoomNameBySocket(socketId);
    const { room, deleted } = roomManager.leaveRoom(socketId);
    if (!room) return;

    if (socketRoom) {
      socket.leave(socketRoom);
      if (!deleted) {
        // Notify remaining players
        io.to(socketRoom).emit("room:playerLeft", socketId);
      }
    }

    console.log(`Player ${socketId} left room ${room.code}${deleted ? " (room deleted)" : ""}`);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Facit server running on http://localhost:${PORT}`);
});
