import { useCallback, useEffect, useState } from "react";
import type { LeaderboardEntry, Language, Player, Room } from "@facit/shared";
import type { AppSocket } from "./useSocket";

export type Screen = "home" | "lobby" | "game" | "results";

export interface RoomState {
  screen: Screen;
  room: Room | null;
  playerId: string | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook managing room lifecycle: create, join, leave, and
 * real-time player updates via Socket.io events.
 */
export function useRoom(socket: AppSocket | null, language: Language = "sv") {
  const [screen, setScreen] = useState<Screen>("home");
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Listen for room events
  useEffect(() => {
    if (!socket) return;

    const onCreated = (newRoom: Room) => {
      setRoom(newRoom);
      setPlayerId(socket.id ?? null);
      setLoading(false);
      setError(null);
      setScreen("lobby");
    };

    const onJoined = (joinedRoom: Room) => {
      setRoom(joinedRoom);
      setPlayerId(socket.id ?? null);
      setLoading(false);
      setError(null);
      setScreen("lobby");
    };

    const onPlayerJoined = (player: Player) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return { ...prev, players: [...prev.players, player] };
      });
    };

    const onPlayerLeft = (leftPlayerId: string) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const players = prev.players.filter((p) => p.id !== leftPlayerId);
        // If host left, the server reassigns host — the next playerJoined/room update will reflect it.
        // For now, if the host left and we're still here, pick the first remaining player as host.
        const hostStillHere = players.some((p) => p.id === prev.hostId);
        const hostId = hostStillHere
          ? prev.hostId
          : players[0]?.id ?? prev.hostId;
        return { ...prev, players, hostId };
      });
    };

    const onError = (message: string) => {
      setLoading(false);
      setError(mapErrorMessage(message, language));
    };

    const onGameStarted = () => {
      setScreen("game");
    };

    const onGameFinished = (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
      setScreen("results");
    };

    socket.on("room:created", onCreated);
    socket.on("room:joined", onJoined);
    socket.on("room:playerJoined", onPlayerJoined);
    socket.on("room:playerLeft", onPlayerLeft);
    socket.on("game:started", onGameStarted);
    socket.on("game:finished", onGameFinished);
    socket.on("error", onError);

    return () => {
      socket.off("room:created", onCreated);
      socket.off("room:joined", onJoined);
      socket.off("room:playerJoined", onPlayerJoined);
      socket.off("room:playerLeft", onPlayerLeft);
      socket.off("game:started", onGameStarted);
      socket.off("game:finished", onGameFinished);
      socket.off("error", onError);
    };
  }, [socket, language]);

  const createRoom = useCallback(
    (playerName: string, language: Language = "sv") => {
      if (!socket || loading) return;
      setLoading(true);
      setError(null);
      socket.emit("room:create", playerName, language);
    },
    [socket, loading],
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      if (!socket || loading) return;
      setLoading(true);
      setError(null);
      socket.emit("room:join", roomCode.toUpperCase(), playerName);
    },
    [socket, loading],
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit("room:leave");
    setRoom(null);
    setPlayerId(null);
    setError(null);
    setLeaderboard([]);
    setScreen("home");
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit("game:start");
  }, [socket]);

  const playAgain = useCallback(() => {
    setLeaderboard([]);
    setScreen("lobby");
  }, []);

  const isHost = room !== null && playerId === room.hostId;

  return {
    screen,
    room,
    playerId,
    error,
    loading,
    isHost,
    leaderboard,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playAgain,
    clearError: () => setError(null),
  };
}

function mapErrorMessage(message: string, language: Language): string {
  const sv = language === "sv";
  const lower = message.toLowerCase();
  if (lower.includes("not found") || lower.includes("invalid"))
    return sv ? "Rummet hittades inte. Kontrollera koden." : "Room not found. Check the code.";
  if (lower.includes("already") || lower.includes("playing"))
    return sv ? "Det spelet har redan börjat." : "That game has already started.";
  if (lower.includes("full"))
    return sv ? "Rummet är fullt." : "The room is full.";
  return message;
}
