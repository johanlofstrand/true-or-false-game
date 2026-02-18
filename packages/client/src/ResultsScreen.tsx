import type { LeaderboardEntry } from "@facit/shared";

interface ResultsScreenProps {
  leaderboard: LeaderboardEntry[];
  playerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
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
}: ResultsScreenProps) {
  const winner = leaderboard[0];
  const currentPlayer = leaderboard.find((e) => e.player.id === playerId);
  const isWinner = winner?.player.id === playerId;

  return (
    <div className="results-screen">
      <div className="results-card">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-header__title">Resultat</h1>
          {currentPlayer && (
            <p className="results-header__subtitle">
              {isWinner
                ? "Grattis, du vann!"
                : `Du kom på plats ${currentPlayer.rank}`}
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <section
          className="results-leaderboard"
          aria-label="Resultattavla"
        >
          <h2 className="sr-only">Resultattavla</h2>

          {/* Podium for top 3 */}
          {leaderboard.length >= 2 && (
            <div
              className="results-podium"
              role="list"
              aria-label="Topp 3"
            >
              {leaderboard.slice(0, 3).map((entry) => (
                <div
                  key={entry.player.id}
                  className={`results-podium__place results-podium__place--${entry.rank}${entry.player.id === playerId ? " results-podium__place--you" : ""}`}
                  role="listitem"
                >
                  <span className="results-podium__rank" aria-label={`Plats ${entry.rank}`}>
                    {RANK_LABELS[entry.rank] ?? entry.rank}
                  </span>
                  <span className="results-podium__name">
                    {entry.player.name}
                    {entry.player.id === playerId && " (du)"}
                  </span>
                  <span className="results-podium__score">
                    {entry.player.score} p
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Full results table */}
          <div className="results-table-wrapper">
            <table className="results-table" aria-label="Fullständiga resultat">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Spelare</th>
                  <th scope="col">Poäng</th>
                  <th scope="col">Rätt</th>
                  <th scope="col" className="results-table__col-time">Snitt</th>
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
                        <span className="results-table__you-badge">du</span>
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
        <div className="results-actions" role="region" aria-label="Åtgärder">
          {isHost ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={onPlayAgain}
            >
              Spela igen
            </button>
          ) : (
            <p className="waiting-message" aria-live="polite">
              Väntar på att värden startar nytt spel
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
            Lämna spelet
          </button>
        </div>
      </div>
    </div>
  );
}
