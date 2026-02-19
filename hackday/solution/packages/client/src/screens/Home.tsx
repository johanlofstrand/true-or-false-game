import { useState } from 'react'
import { AppSocket } from '../hooks/useSocket'

interface HomeProps {
  socket: AppSocket
}

export function Home({ socket }: HomeProps) {
  const [createName, setCreateName] = useState('')
  const [joinName, setJoinName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    socket.emit('room:create', createName.trim())
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinName.trim() || !joinCode.trim()) return
    socket.emit('room:join', joinCode.trim().toUpperCase(), joinName.trim())
  }

  return (
    <div className="screen">
      <h1>True or False</h1>
      <p className="subtitle">A real-time multiplayer quiz game</p>

      <form onSubmit={handleCreate} className="card" style={{ maxWidth: 480, width: '100%' }}>
        <h2 className="card-title">Create a room</h2>
        <div className="form-group">
          <label htmlFor="create-name">Your name</label>
          <input
            id="create-name"
            type="text"
            placeholder="Enter your name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!createName.trim()}
        >
          Create Room
        </button>
      </form>

      <div className="divider">or</div>

      <form onSubmit={handleJoin} className="card" style={{ maxWidth: 480, width: '100%' }}>
        <h2 className="card-title">Join a room</h2>
        <div className="form-group">
          <label htmlFor="join-name">Your name</label>
          <input
            id="join-name"
            type="text"
            placeholder="Enter your name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="join-code">Room code</label>
          <input
            id="join-code"
            className="code-input"
            type="text"
            placeholder="ABCD"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            autoComplete="off"
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!joinName.trim() || joinCode.length < 4}
        >
          Join Room
        </button>
      </form>
    </div>
  )
}
