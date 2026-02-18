import { FormEvent, useCallback, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface HomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  error: string | null;
  loading: boolean;
  onClearError: () => void;
}

export function HomeScreen({
  onCreateRoom,
  onJoinRoom,
  error,
  loading,
  onClearError,
}: HomeScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const nameValid = playerName.trim().length > 0;
  const codeComplete = code.every((c) => c.length === 1);

  const handleCreate = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!nameValid || loading) return;
      onCreateRoom(playerName.trim());
    },
    [nameValid, loading, playerName, onCreateRoom],
  );

  const handleJoin = useCallback(() => {
    if (!nameValid || !codeComplete || loading) return;
    onJoinRoom(code.join(""), playerName.trim());
  }, [nameValid, codeComplete, loading, code, playerName, onJoinRoom]);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      // Only allow letters and numbers
      const char = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(-1);
      setCode((prev) => {
        const next = [...prev];
        next[index] = char;
        return next;
      });
      if (error) onClearError();

      // Auto-advance to next cell
      if (char && index < 3) {
        codeRefs.current[index + 1]?.focus();
      }
    },
    [error, onClearError],
  );

  const handleCodeKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
      if (e.key === "Enter" && codeComplete && nameValid) {
        handleJoin();
      }
    },
    [code, codeComplete, nameValid, handleJoin],
  );

  const handleCodePaste = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4);
      if (!pasted) return;
      const chars = pasted.split("");
      setCode((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          if (i < 4) next[i] = c;
        });
        return next;
      });
      if (error) onClearError();
      // Focus last filled cell
      const focusIndex = Math.min(chars.length - 1, 3);
      codeRefs.current[focusIndex]?.focus();
    },
    [error, onClearError],
  );

  return (
    <div className="home-screen">
      <div className="home-card">
        <div className="home-brand">
          <h1 className="home-brand__title" id="brand-title">
            Facit
          </h1>
          <p className="home-brand__subtitle">Sant eller Falskt</p>
        </div>

        {/* Name input — shared between both actions */}
        <div className="form-group">
          <label className="form-label" htmlFor="player-name">
            Ditt namn
          </label>
          <input
            id="player-name"
            className="form-input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            autoComplete="nickname"
            maxLength={20}
            placeholder="Ange ditt namn"
            disabled={loading}
          />
        </div>

        {/* Create room */}
        <form onSubmit={handleCreate} aria-label="Skapa ett rum">
          <button
            type="submit"
            className={`btn btn--primary${loading ? " btn--loading" : ""}`}
            disabled={!nameValid || loading}
          >
            Skapa rum
          </button>
        </form>

        <div className="home-divider" role="separator">
          <span>eller</span>
        </div>

        {/* Join room */}
        <div className="form-group">
          <label className="form-label" id="code-label">
            Rumskod
          </label>
          <div
            className="code-input-group"
            role="group"
            aria-labelledby="code-label"
          >
            {code.map((char, i) => (
              <input
                key={i}
                ref={(el) => {
                  codeRefs.current[i] = el;
                }}
                className={`code-cell${char ? " code-cell--filled" : ""}${error ? " code-cell--error" : ""}`}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={1}
                value={char}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                onPaste={handleCodePaste}
                disabled={loading}
                aria-label={`Tecken ${i + 1} av 4`}
                aria-invalid={error ? "true" : undefined}
              />
            ))}
          </div>
          {error && (
            <p className="form-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          className={`btn btn--secondary${loading ? " btn--loading" : ""}`}
          disabled={!nameValid || !codeComplete || loading}
          onClick={handleJoin}
        >
          Gå med i rum
        </button>
      </div>
    </div>
  );
}
