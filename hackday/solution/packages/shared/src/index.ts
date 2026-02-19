export interface Question {
  id: string
  statement: string
  isTrue: boolean
  category: string
  source: string
}

export interface Player {
  id: string
  name: string
  score: number
}

export type RoomStatus = 'lobby' | 'playing' | 'finished'

export interface GameSettings {
  questionCount: number
  timePerQuestion: number
}

export const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 10,
  timePerQuestion: 15,
}

export interface Room {
  id: string
  code: string
  hostId: string
  players: Player[]
  status: RoomStatus
  currentQuestionIndex: number
  settings: GameSettings
}

export interface LeaderboardEntry {
  player: Player
  rank: number
  correctAnswers: number
  totalQuestions: number
  averageTimeMs: number
}

export interface ClientToServerEvents {
  'room:create': (playerName: string) => void
  'room:join': (roomCode: string, playerName: string) => void
  'room:leave': () => void
  'game:start': () => void
  'game:answer': (answer: boolean) => void
}

export interface ServerToClientEvents {
  'room:created': (room: Room) => void
  'room:joined': (room: Room) => void
  'room:playerJoined': (player: Player) => void
  'room:playerLeft': (playerId: string) => void
  'game:started': () => void
  'game:question': (question: Omit<Question, 'isTrue'>, index: number, total: number) => void
  'game:timeUp': () => void
  'game:result': (correct: boolean, correctAnswer: boolean, scoreAwarded: number) => void
  'game:scores': (players: Player[]) => void
  'game:finished': (leaderboard: LeaderboardEntry[]) => void
  'error': (message: string) => void
}
