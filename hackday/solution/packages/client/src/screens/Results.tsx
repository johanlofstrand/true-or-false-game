import { LeaderboardEntry } from '@game/shared'

interface ResultsProps {
  leaderboard: LeaderboardEntry[]
  myId: string
  isHost: boolean
  onPlayAgain: () => void
  onLeave: () => void
}

function formatTime(ms: number): string {
  if (ms === 0) return '—'
  return `${(ms / 1000).toFixed(1)}s`
}

export function Results({ leaderboard, myId, isHost, onPlayAgain, onLeave }: ResultsProps) {
  return (
    <div className="screen-top">
      <h1 style={{ marginTop: 16 }}>Game Over!</h1>

      {leaderboard[0] && (
        <p className="subtitle">
          🏆 {leaderboard[0].player.name} wins with {leaderboard[0].player.score} pts
        </p>
      )}

      <div style={{ width: '100%', maxWidth: 480, overflowX: 'auto' }}>
        <table className="leaderboard">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Avg time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={entry.player.id}
                className={entry.player.id === myId ? 'me' : ''}
              >
                <td
                  className={
                    entry.rank === 1
                      ? 'rank-1'
                      : entry.rank === 2
                      ? 'rank-2'
                      : entry.rank === 3
                      ? 'rank-3'
                      : ''
                  }
                >
                  {entry.rank === 1
                    ? '🥇'
                    : entry.rank === 2
                    ? '🥈'
                    : entry.rank === 3
                    ? '🥉'
                    : entry.rank}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {entry.player.name}
                  {entry.player.id === myId && (
                    <span className="badge badge-you" style={{ marginLeft: 8 }}>
                      You
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {entry.player.score}
                </td>
                <td>
                  {entry.correctAnswers}/{entry.totalQuestions}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {formatTime(entry.averageTimeMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isHost && (
        <button
          className="btn btn-primary"
          style={{ maxWidth: 480, width: '100%' }}
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      )}

      <button
        className="btn btn-ghost"
        style={{ maxWidth: 480, width: '100%' }}
        onClick={onLeave}
      >
        Leave
      </button>
    </div>
  )
}
