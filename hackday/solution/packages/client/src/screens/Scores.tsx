import { Player } from '@game/shared'

interface ScoresProps {
  players: Player[]
  myId: string
}

export function Scores({ players, myId }: ScoresProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="screen">
      <p className="scores-title">Scores</p>
      <div className="player-list" style={{ width: '100%', maxWidth: 480 }}>
        {sorted.map((player, i) => (
          <div
            className="player-item"
            key={player.id}
            style={player.id === myId ? { outline: '2px solid var(--accent)' } : {}}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span
                style={{ width: 24, fontWeight: 800, fontSize: '1rem' }}
                className={i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}
              >
                {i + 1}
              </span>
              <span className="player-name">{player.name}</span>
            </div>
            <span className="player-score">{player.score} pts</span>
          </div>
        ))}
      </div>
      <p className="waiting">Next question coming up…</p>
    </div>
  )
}
