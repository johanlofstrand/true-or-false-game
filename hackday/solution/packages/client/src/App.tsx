import { useEffect, useState } from 'react'
import { Room, Player, LeaderboardEntry } from '@game/shared'
import { useSocket } from './hooks/useSocket'
import { Home } from './screens/Home'
import { Lobby } from './screens/Lobby'
import { Game } from './screens/Game'
import { Scores } from './screens/Scores'
import { Results } from './screens/Results'

type Screen = 'connecting' | 'home' | 'lobby' | 'game' | 'results'

interface QuestionData {
  id: string
  statement: string
  category: string
  source: string
  index: number
  total: number
}

interface ResultData {
  correct: boolean
  correctAnswer: boolean
  scoreAwarded: number
}

export default function App() {
  const socket = useSocket()
  const [screen, setScreen] = useState<Screen>('connecting')
  const [room, setRoom] = useState<Room | null>(null)
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [result, setResult] = useState<ResultData | null>(null)
  const [scores, setScores] = useState<Player[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [answered, setAnswered] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [showScores, setShowScores] = useState(false)

  useEffect(() => {
    if (!socket) {
      setScreen('connecting')
      return
    }
    setScreen('home')

    socket.on('room:created', (r) => {
      setRoom(r)
      setScreen('lobby')
    })

    socket.on('room:joined', (r) => {
      setRoom(r)
      setScreen('lobby')
    })

    socket.on('room:playerJoined', (player) => {
      setRoom((prev) =>
        prev ? { ...prev, players: [...prev.players, player] } : null
      )
    })

    socket.on('room:playerLeft', (playerId) => {
      setRoom((prev) => {
        if (!prev) return null
        const players = prev.players.filter((p) => p.id !== playerId)
        const hostId =
          prev.hostId === playerId
            ? (players[0]?.id ?? '')
            : prev.hostId
        return { ...prev, players, hostId }
      })
    })

    socket.on('game:started', () => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              status: 'playing',
              currentQuestionIndex: 0,
              players: prev.players.map((p) => ({ ...p, score: 0 })),
            }
          : null
      )
      setQuestion(null)
      setResult(null)
      setAnswered(false)
      setTimeUp(false)
      setShowScores(false)
      setScreen('game')
    })

    socket.on('game:question', (q, index, total) => {
      setQuestion({ ...q, index, total })
      setResult(null)
      setAnswered(false)
      setTimeUp(false)
      setShowScores(false)
    })

    socket.on('game:timeUp', () => {
      setTimeUp(true)
    })

    socket.on('game:result', (correct, correctAnswer, scoreAwarded) => {
      setResult({ correct, correctAnswer, scoreAwarded })
    })

    socket.on('game:scores', (players) => {
      setScores(players)
      setRoom((prev) => (prev ? { ...prev, players } : null))
      setShowScores(true)
    })

    socket.on('game:finished', (lb) => {
      setLeaderboard(lb)
      setScreen('results')
    })

    socket.on('error', (msg) => alert(`Error: ${msg}`))

    return () => {
      socket.removeAllListeners()
    }
  }, [socket])

  const myId = socket?.id ?? ''
  const isHost = !!room && myId === room.hostId

  const handleLeave = () => {
    socket?.emit('room:leave')
    setRoom(null)
    setScreen('home')
  }

  if (screen === 'connecting') {
    return (
      <div className="screen">
        <div className="spinner" />
        <p className="text-muted">Connecting…</p>
      </div>
    )
  }

  if (screen === 'home' && socket) {
    return <Home socket={socket} />
  }

  if (screen === 'lobby' && room) {
    return (
      <Lobby
        room={room}
        myId={myId}
        isHost={isHost}
        onStart={() => socket?.emit('game:start')}
        onLeave={handleLeave}
      />
    )
  }

  if (screen === 'game' && room) {
    if (showScores) {
      return <Scores players={scores} myId={myId} />
    }
    return (
      <Game
        question={question}
        timePerQuestion={room.settings.timePerQuestion}
        answered={answered}
        timeUp={timeUp}
        result={result}
        onAnswer={(a) => {
          if (!answered && !timeUp) {
            socket?.emit('game:answer', a)
            setAnswered(true)
          }
        }}
      />
    )
  }

  if (screen === 'results') {
    return (
      <Results
        leaderboard={leaderboard}
        myId={myId}
        isHost={isHost}
        onPlayAgain={() => socket?.emit('game:start')}
        onLeave={handleLeave}
      />
    )
  }

  return null
}
