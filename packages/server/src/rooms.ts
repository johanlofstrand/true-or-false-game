import type { Room, Player, GameSettings } from "@facit/shared";
import { DEFAULT_GAME_SETTINGS } from "@facit/shared";
import { getQuestions } from "./questions.js";
import { generateAIQuestions, isAIAvailable } from "./ai-questions.js";

/** Generate a random 4-character uppercase room code */
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Manages game rooms and player associations */
export class RoomManager {
  /** roomId → Room */
  private rooms = new Map<string, Room>();
  /** roomCode → roomId (for quick lookup by join code) */
  private codeToRoomId = new Map<string, string>();
  /** socketId → roomId (tracks which room each socket is in) */
  private socketToRoom = new Map<string, string>();

  /** Create a new room. Uses AI questions if enabled and available, with pre-generated fallback. */
  async createRoom(hostSocketId: string, playerName: string): Promise<Room> {
    const roomId = crypto.randomUUID();
    let code = generateRoomCode();

    // Ensure unique code (retry up to 10 times)
    let attempts = 0;
    while (this.codeToRoomId.has(code) && attempts < 10) {
      code = generateRoomCode();
      attempts++;
    }

    const host: Player = {
      id: hostSocketId,
      name: playerName,
      score: 0,
    };

    const settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };

    // Use AI questions if available, fall back to pre-generated bank
    let questions;
    if (settings.useAI && isAIAvailable()) {
      questions = await generateAIQuestions(settings.questionCount);
      if (questions.length === 0) {
        console.log("AI questions unavailable, falling back to question bank");
        questions = getQuestions(settings.questionCount);
      }
    } else {
      questions = getQuestions(settings.questionCount);
    }

    const room: Room = {
      id: roomId,
      code,
      hostId: hostSocketId,
      players: [host],
      status: "lobby",
      currentQuestionIndex: 0,
      questions,
      settings,
    };

    this.rooms.set(roomId, room);
    this.codeToRoomId.set(code, roomId);
    this.socketToRoom.set(hostSocketId, roomId);

    return room;
  }

  /** Join an existing room by code. Returns [room, player] or null if not found / full. */
  joinRoom(
    socketId: string,
    roomCode: string,
    playerName: string,
  ): { room: Room; player: Player } | null {
    const roomId = this.codeToRoomId.get(roomCode.toUpperCase());
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.status !== "lobby") return null;

    // Check if already in this room
    if (room.players.some((p) => p.id === socketId)) {
      const existing = room.players.find((p) => p.id === socketId)!;
      return { room, player: existing };
    }

    const player: Player = {
      id: socketId,
      name: playerName,
      score: 0,
    };

    room.players.push(player);
    this.socketToRoom.set(socketId, roomId);

    return { room, player };
  }

  /** Remove a player from their current room. Returns the room (or null) and whether it was deleted. */
  leaveRoom(socketId: string): { room: Room | null; deleted: boolean } {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return { room: null, deleted: false };

    const room = this.rooms.get(roomId);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return { room: null, deleted: false };
    }

    room.players = room.players.filter((p) => p.id !== socketId);
    this.socketToRoom.delete(socketId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      this.codeToRoomId.delete(room.code);
      return { room, deleted: true };
    }

    // If host left, assign new host
    if (room.hostId === socketId) {
      room.hostId = room.players[0].id;
    }

    return { room, deleted: false };
  }

  /** Get the room a socket is currently in */
  getRoomBySocket(socketId: string): Room | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    return this.rooms.get(roomId) ?? null;
  }

  /** Get a room by its ID */
  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  /** Get the Socket.io room name for a game room (used for broadcasting) */
  getSocketRoomName(roomId: string): string {
    return `room:${roomId}`;
  }

  /** Get the Socket.io room name for the room a socket is in */
  getSocketRoomNameBySocket(socketId: string): string | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    return this.getSocketRoomName(roomId);
  }
}
