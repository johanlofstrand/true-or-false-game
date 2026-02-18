import type { LeaderboardEntry, Language } from "@facit/shared";
import { t } from "./i18n";

interface ResultsScreenProps {
  leaderboard: LeaderboardEntry[];
  playerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
  language: Language;
}

function formatTime(ms: number): string {
  const seconds = ms / 1000;
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}

const RANK_LABELS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function ResultsScreen({
  leaderboard,
  playerId,
  isHost,
  onPlayAgain,
  onLeave,
  language,
}: ResultsScreenProps) {
  const winner = leaderboard[0];
  const currentPlayer = leaderboard.find((e) => e.player.id === playerId);
  const isWinner = winner?.player.id === playerId;

  return (
    <div className="results-screen">
      <div className="results-card">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-header__title">{t(language, "results.title")}</h1>
          {currentPlayer && (
            <p className="results-header__subtitle">
              {isWinner
                ? t(language, "results.youWon")
                : t(language, "results.yourRank", { rank: currentPlayer.rank })}
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <section
          className="results-leaderboard"
          aria-label={t(language, "results.leaderboard")}
        >
          <h2 className="sr-only">{t(language, "results.leaderboard")}</h2>

          {/* Podium for top 3 */}
          {leaderboard.length >= 2 && (
            <div
              className="results-podium"
              role="list"
              aria-label={t(language, "results.top3")}
            >
              {leaderboard.slice(0, 3).map((entry) => (
                <div
                  key={entry.player.id}
                  className={`results-podium__place results-podium__place--${entry.rank}${entry.player.id === playerId ? " results-podium__place--you" : ""}`}
                  role="listitem"
                >
                  <span className="results-podium__rank" aria-label={t(language, "results.rank", { rank: entry.rank })}>
                    {RANK_LABELS[entry.rank] ?? entry.rank}
                  </span>
                  <span className="results-podium__name">
                    {entry.player.name}
                    {entry.player.id === playerId && ` (${t(language, "lobby.you")})`}
                  </span>
                  <span className="results-podium__score">
                    {entry.player.score} {t(language, "game.points")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Full results table */}
          <div className="results-table-wrapper">
            <table className="results-table" aria-label={t(language, "results.fullResults")}>
              <thead>
                <tr>
                  <th scope="col">{t(language, "results.colRank")}</th>
                  <th scope="col">{t(language, "results.colPlayer")}</th>
                  <th scope="col">{t(language, "results.colScore")}</th>
                  <th scope="col">{t(language, "results.colCorrect")}</th>
                  <th scope="col" className="results-table__col-time">{t(language, "results.colAvgTime")}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.player.id}
                    className={entry.player.id === playerId ? "results-table__row--you" : ""}
                  >
                    <td className="results-table__rank">
                      {RANK_LABELS[entry.rank] ?? entry.rank}
                    </td>
                    <td className="results-table__name">
                      {entry.player.name}
                      {entry.player.id === playerId && (
                        <span className="results-table__you-badge">{t(language, "lobby.you")}</span>
                      )}
                    </td>
                    <td className="results-table__score">
                      {entry.player.score}
                    </td>
                    <td className="results-table__correct">
                      {entry.correctAnswers}/{entry.totalQuestions}
                    </td>
                    <td className="results-table__time">
                      {formatTime(entry.averageTimeMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Actions */}
        <div className="results-actions" role="region" aria-label={t(language, "results.actions")}>
          {isHost ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={onPlayAgain}
            >
              {t(language, "results.playAgain")}
            </button>
          ) : (
            <p className="waiting-message" aria-live="polite">
              {t(language, "results.waitingForHost")}
              <span className="waiting-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}
          <button
            type="button"
            className="btn--ghost"
            onClick={onLeave}
          >
            {t(language, "results.leaveGame")}
          </button>
        </div>
      </div>
    </div>
  );
}
