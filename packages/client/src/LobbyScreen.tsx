import { useCallback, useState } from "react";
import type { Room } from "@facit/shared";

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeave: () => void;
}

export function LobbyScreen({
  room,
  playerId,
  isHost,
  onStartGame,
  onLeave,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  }, [room.code]);

  const handleLeave = useCallback(() => {
    if (confirmLeave) {
      onLeave();
      setConfirmLeave(false);
    } else {
      setConfirmLeave(true);
    }
  }, [confirmLeave, onLeave]);

  const cancelLeave = useCallback(() => {
    setConfirmLeave(false);
  }, []);

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1 className="lobby-header__title">Lobby</h1>
          <p className="lobby-header__subtitle">
            Väntar på spelare...
          </p>
        </div>

        {/* Room code */}
        <section className="room-code-section" aria-label="Rumskod att dela">
          <p className="room-code-label">Rumskod</p>
          <div className="room-code-display">
            <output className="room-code-value" aria-label="Rumskod">
              {room.code}
            </output>
            <button
              className={`room-code-copy-btn${copied ? " room-code-copy-btn--copied" : ""}`}
              onClick={copyCode}
              type="button"
              aria-label={copied ? "Kopierat!" : "Kopiera rumskod"}
            >
              {copied ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10l4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="6"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 14V4a2 2 0 012-2h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="sr-only" aria-live="polite">
              Rumskod kopierad
            </p>
          )}
        </section>

        {/* Player list */}
        <section className="player-list-section" aria-label="Spelare i rummet">
          <h2 className="player-list-heading">
            Spelare ({room.players.length})
          </h2>
          <ul className="player-list" aria-live="polite" aria-relevant="additions removals">
            {room.players.map((player) => (
              <li
                key={player.id}
                className="player-item"
              >
                <span className="player-item__indicator" aria-hidden="true" />
                <span className="player-item__name">
                  {player.name}
                  {player.id === playerId && " (du)"}
                </span>
                {player.id === room.hostId && (
                  <span className="player-item__badge">Värd</span>
                )}
              </li>
            ))}
          </ul>
          {room.players.length === 1 && (
            <p className="player-list-empty">
              Dela rumskoden för att bjuda in spelare
            </p>
          )}
        </section>

        {/* Actions */}
        <div className="lobby-actions" role="region" aria-label="Spelkontroller">
          {isHost ? (
            <button
              type="button"
              className="btn btn--primary"
              disabled={room.players.length < 2}
              onClick={onStartGame}
            >
              Starta spelet
            </button>
          ) : (
            <p className="waiting-message" aria-live="polite">
              Väntar på att värden startar
              <span className="waiting-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}

          {confirmLeave ? (
            <div className="leave-confirm">
              <span className="leave-confirm__text">Lämna lobby?</span>
              <button
                type="button"
                className="btn--ghost"
                onClick={cancelLeave}
                autoFocus
              >
                Avbryt
              </button>
              <button
                type="button"
                className="btn--ghost btn--ghost-danger"
                onClick={handleLeave}
              >
                Lämna
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn--ghost"
              onClick={handleLeave}
            >
              Lämna lobby
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
