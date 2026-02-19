import { Server } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents, Player, LeaderboardEntry } from '@game/shared'
import { ServerRoom } from './rooms'

type IO = Server<ClientToServerEvents, ServerToClientEvents>

interface PlayerState {
  answered: boolean
  correct: boolean
  timeMs: number
  scoreAwarded: number
  correctAnswers: number
  totalTimeMs: number
}

interface ActiveGame {
  questionStartTime: number
  timer: ReturnType<typeof setTimeout> | null
  playerStates: Map<string, PlayerState>
  advancing: boolean
}

export class GameManager {
  private games = new Map<string, ActiveGame>()

  startGame(room: ServerRoom, io: IO): void {
    room.status = 'playing'
    room.currentQuestionIndex = 0
    room.players.forEach((p) => { p.score = 0 })

    const game: ActiveGame = {
      questionStartTime: 0,
      timer: null,
      playerStates: new Map(),
      advancing: false,
    }
    this.initPlayerStates(game, room.players)
    this.games.set(room.id, game)

    io.to(this.roomName(room.id)).emit('game:started')
    setTimeout(() => this.sendQuestion(room, io), 500)
  }

  private sendQuestion(room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    if (!game) return

    const question = room.questions[room.currentQuestionIndex]
    if (!question) return

    // Reset per-question answered state
    game.advancing = false
    game.questionStartTime = Date.now()
    room.players.forEach((p) => {
      const state = game.playerStates.get(p.id)
      if (state) {
        state.answered = false
        state.correct = false
        state.timeMs = 0
        state.scoreAwarded = 0
      }
    })

    const { isTrue: _isTrue, ...questionForClient } = question
    io.to(this.roomName(room.id)).emit(
      'game:question',
      questionForClient,
      room.currentQuestionIndex,
      room.questions.length
    )

    if (game.timer) clearTimeout(game.timer)
    game.timer = setTimeout(
      () => this.handleTimeUp(room, io),
      room.settings.timePerQuestion * 1000
    )
  }

  handleAnswer(socketId: string, answer: boolean, room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    if (!game) return

    const state = game.playerStates.get(socketId)
    if (!state || state.answered) return

    const question = room.questions[room.currentQuestionIndex]
    if (!question) return

    const timeMs = Date.now() - game.questionStartTime
    const correct = answer === question.isTrue
    const timeRatio = Math.min(1, timeMs / (room.settings.timePerQuestion * 1000))
    const scoreAwarded = correct ? Math.round(1000 * (1 - timeRatio * 0.5)) : 0

    state.answered = true
    state.correct = correct
    state.timeMs = timeMs
    state.scoreAwarded = scoreAwarded
    if (correct) {
      state.correctAnswers += 1
      state.totalTimeMs += timeMs
    }

    const player = room.players.find((p) => p.id === socketId)
    if (player) player.score += scoreAwarded

    io.to(socketId).emit('game:result', correct, question.isTrue, scoreAwarded)

    const allAnswered = room.players.every(
      (p) => game.playerStates.get(p.id)?.answered === true
    )
    if (allAnswered) {
      this.advanceOrFinish(room, io)
    }
  }

  private handleTimeUp(room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    if (!game || game.advancing) return

    const question = room.questions[room.currentQuestionIndex]
    if (!question) return

    io.to(this.roomName(room.id)).emit('game:timeUp')

    // Mark unanswered players as wrong
    room.players.forEach((p) => {
      const state = game.playerStates.get(p.id)
      if (state && !state.answered) {
        state.answered = true
        state.correct = false
        state.timeMs = room.settings.timePerQuestion * 1000
        state.scoreAwarded = 0
        io.to(p.id).emit('game:result', false, question.isTrue, 0)
      }
    })

    this.advanceOrFinish(room, io)
  }

  private advanceOrFinish(room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    if (!game || game.advancing) return
    game.advancing = true

    if (game.timer) {
      clearTimeout(game.timer)
      game.timer = null
    }

    io.to(this.roomName(room.id)).emit('game:scores', [...room.players])
    room.currentQuestionIndex += 1

    if (room.currentQuestionIndex < room.questions.length) {
      setTimeout(() => this.sendQuestion(room, io), 2000)
    } else {
      setTimeout(() => this.finishGame(room, io), 2000)
    }
  }

  private finishGame(room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    room.status = 'finished'

    const sorted = [...room.players].sort((a, b) => b.score - a.score)
    const leaderboard: LeaderboardEntry[] = sorted.map((player, i) => {
      const state = game?.playerStates.get(player.id)
      const correctAnswers = state?.correctAnswers ?? 0
      const avgTime =
        correctAnswers > 0
          ? Math.round((state?.totalTimeMs ?? 0) / correctAnswers)
          : 0
      return {
        player,
        rank: i + 1,
        correctAnswers,
        totalQuestions: room.questions.length,
        averageTimeMs: avgTime,
      }
    })

    io.to(this.roomName(room.id)).emit('game:finished', leaderboard)
    this.games.delete(room.id)
  }

  handleDisconnect(socketId: string, room: ServerRoom, io: IO): void {
    const game = this.games.get(room.id)
    if (!game || room.status !== 'playing') return

    if (room.players.length === 0) {
      if (game.timer) clearTimeout(game.timer)
      this.games.delete(room.id)
      return
    }

    // If all remaining players have answered, advance
    const allAnswered = room.players.every(
      (p) => game.playerStates.get(p.id)?.answered === true
    )
    if (allAnswered) {
      this.advanceOrFinish(room, io)
    }
  }

  private initPlayerStates(game: ActiveGame, players: Player[]): void {
    players.forEach((p) => {
      game.playerStates.set(p.id, {
        answered: false,
        correct: false,
        timeMs: 0,
        scoreAwarded: 0,
        correctAnswers: 0,
        totalTimeMs: 0,
      })
    })
  }

  private roomName(roomId: string): string {
    return `room:${roomId}`
  }
}
