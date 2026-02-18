import { useCallback, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  Hint,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@facit/shared";
import { MAX_HINTS } from "@facit/shared";

export interface HintState {
  /** All hints revealed so far for the current question */
  revealedHints: Hint[];
  /** Current score multiplier (1 = no penalty) */
  scoreMultiplier: number;
  /** Whether more hints are available */
  hasMore: boolean;
  /** Whether a hint request is in-flight */
  loading: boolean;
}

/**
 * React hook for the progressive hints system.
 *
 * Call `requestHint()` to ask the server for the next hint.
 * Call `reset()` when moving to a new question.
 */
export function useHints(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
) {
  const [revealedHints, setRevealedHints] = useState<Hint[]>([]);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = revealedHints.length < MAX_HINTS;

  const requestHint = useCallback(() => {
    if (!socket || !hasMore || loading) return;

    setLoading(true);

    const onRevealed = (hint: Hint, multiplier: number) => {
      setRevealedHints((prev) => [...prev, hint]);
      setScoreMultiplier(multiplier);
      setLoading(false);
      cleanup();
    };

    const onNone = () => {
      setLoading(false);
      cleanup();
    };

    const cleanup = () => {
      socket.off("hint:revealed", onRevealed);
      socket.off("hint:none", onNone);
    };

    socket.on("hint:revealed", onRevealed);
    socket.on("hint:none", onNone);
    socket.emit("hint:request");
  }, [socket, hasMore, loading]);

  const reset = useCallback(() => {
    setRevealedHints([]);
    setScoreMultiplier(1);
    setLoading(false);
  }, []);

  const state: HintState = {
    revealedHints,
    scoreMultiplier,
    hasMore,
    loading,
  };

  return { ...state, requestHint, reset };
}
