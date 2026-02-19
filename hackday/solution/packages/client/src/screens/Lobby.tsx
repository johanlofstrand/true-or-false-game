import { Room } from '@game/shared'

interface LobbyProps {
  room: Room
  myId: string
  isHost: boolean
  onStart: () => void
  onLeave: () => void
}

export function Lobby({ room, myId, isHost, onStart, onLeave }: LobbyProps) {
  const canStart = room.players.length >= 2

  return (
    <div className="screen">
      <p className="room-code-label">Room code</p>
      <div className="room-code">{room.code}</div>
      <p className="subtitle">Share this code with your friends</p>

      <div className="player-list">
        {room.players.map((player) => (
          <div className="player-item" key={player.id}>
            <span className="player-name">{player.name}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {player.id === room.hostId && (
                <span className="badge">Host</span>
              )}
              {player.id === myId && (
                <span className="badge badge-you">You</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {room.players.length < 2 && (
        <p className="waiting">Waiting for more players to join…</p>
      )}

      {isHost && (
        <button
          className="btn btn-primary"
          style={{ maxWidth: 480, width: '100%' }}
          onClick={onStart}
          disabled={!canStart}
          title={!canStart ? 'Need at least 2 players' : undefined}
        >
          Start Game
        </button>
      )}

      <button
        className="btn btn-ghost"
        style={{ maxWidth: 480, width: '100%' }}
        onClick={onLeave}
      >
        Leave Room
      </button>
    </div>
  )
}
