import type { HintState } from "./useHints";

interface HintDisplayProps extends HintState {
  onRequestHint: () => void;
}

export function HintDisplay({
  revealedHints,
  scoreMultiplier,
  hasMore,
  loading,
  onRequestHint,
}: HintDisplayProps) {
  return (
    <div className="hint-display">
      {revealedHints.length > 0 && (
        <ul className="hint-list">
          {revealedHints.map((hint) => (
            <li key={hint.level} className="hint-item" data-level={hint.level}>
              <span className="hint-level">Hint {hint.level}</span>
              <span className="hint-text">{hint.text}</span>
            </li>
          ))}
        </ul>
      )}

      {scoreMultiplier < 1 && (
        <p className="hint-penalty">
          Poängmultiplikator: {Math.round(scoreMultiplier * 100)}%
        </p>
      )}

      {hasMore && (
        <button
          className="hint-button"
          onClick={onRequestHint}
          disabled={loading}
          type="button"
        >
          {loading
            ? "Laddar..."
            : revealedHints.length === 0
              ? "Visa ledtråd"
              : "Visa nästa ledtråd"}
        </button>
      )}

      {!hasMore && revealedHints.length > 0 && (
        <p className="hint-exhausted">Inga fler ledtrådar</p>
      )}
    </div>
  );
}
