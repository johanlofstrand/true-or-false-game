import type { Language } from "@facit/shared";
import type { HintState } from "./useHints";
import { t } from "./i18n";

interface HintDisplayProps extends HintState {
  onRequestHint: () => void;
  language: Language;
}

export function HintDisplay({
  revealedHints,
  scoreMultiplier,
  hasMore,
  loading,
  onRequestHint,
  language,
}: HintDisplayProps) {
  return (
    <div className="hint-display">
      {revealedHints.length > 0 && (
        <ul className="hint-list">
          {revealedHints.map((hint) => (
            <li key={hint.level} className="hint-item" data-level={hint.level}>
              <span className="hint-level">{t(language, "hints.level", { n: hint.level })}</span>
              <span className="hint-text">{hint.text}</span>
            </li>
          ))}
        </ul>
      )}

      {scoreMultiplier < 1 && (
        <p className="hint-penalty">
          {t(language, "hints.multiplier", { pct: Math.round(scoreMultiplier * 100) })}
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
            ? t(language, "hints.loading")
            : revealedHints.length === 0
              ? t(language, "hints.showHint")
              : t(language, "hints.showNextHint")}
        </button>
      )}

      {!hasMore && revealedHints.length > 0 && (
        <p className="hint-exhausted">{t(language, "hints.noMore")}</p>
      )}
    </div>
  );
}
