import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@facit/shared";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Singleton Socket.io connection hook.
 * Connects on mount, disconnects on unmount.
 */
export function useSocket(): AppSocket | null {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    const socket: AppSocket = io({
      // Vite proxy handles /socket.io → localhost:3001
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return connected ? socketRef.current : null;
}
