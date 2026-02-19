import { randomUUID } from 'crypto'
import { Room, Player, GameSettings, DEFAULT_SETTINGS, Question } from '@game/shared'
import { getQuestions } from './questions'

export interface ServerRoom extends Room {
  questions: Question[]
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I or O to avoid confusion

function generateCode(existing: Set<string>): string {
  let code: string
  do {
    code = Array.from({ length: 4 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('')
  } while (existing.has(code))
  return code
}

export class RoomManager {
  private rooms = new Map<string, ServerRoom>()
  private socketToRoomId = new Map<string, string>()
  private codeToRoomId = new Map<string, string>()

  createRoom(socketId: string, playerName: string): ServerRoom {
    const code = generateCode(new Set(this.codeToRoomId.keys()))
    const id = randomUUID()
    const player: Player = { id: socketId, name: playerName, score: 0 }
    const settings: GameSettings = { ...DEFAULT_SETTINGS }

    const room: ServerRoom = {
      id,
      code,
      hostId: socketId,
      players: [player],
      status: 'lobby',
      currentQuestionIndex: 0,
      settings,
      questions: getQuestions(settings.questionCount),
    }

    this.rooms.set(id, room)
    this.socketToRoomId.set(socketId, id)
    this.codeToRoomId.set(code, id)
    return room
  }

  joinRoom(
    socketId: string,
    roomCode: string,
    playerName: string
  ): { room: ServerRoom; player: Player } | null {
    const roomId = this.codeToRoomId.get(roomCode.toUpperCase())
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room || room.status !== 'lobby') return null

    const player: Player = { id: socketId, name: playerName, score: 0 }
    room.players.push(player)
    this.socketToRoomId.set(socketId, roomId)
    return { room, player }
  }

  leaveRoom(socketId: string): { room: ServerRoom | null; playerId: string } {
    const roomId = this.socketToRoomId.get(socketId)
    this.socketToRoomId.delete(socketId)

    if (!roomId) return { room: null, playerId: socketId }

    const room = this.rooms.get(roomId)
    if (!room) return { room: null, playerId: socketId }

    room.players = room.players.filter((p) => p.id !== socketId)

    if (room.players.length === 0) {
      this.rooms.delete(roomId)
      this.codeToRoomId.delete(room.code)
      return { room: null, playerId: socketId }
    }

    if (room.hostId === socketId) {
      room.hostId = room.players[0].id
    }

    return { room, playerId: socketId }
  }

  getRoomBySocket(socketId: string): ServerRoom | null {
    const roomId = this.socketToRoomId.get(socketId)
    if (!roomId) return null
    return this.rooms.get(roomId) ?? null
  }

  socketRoomName(roomId: string): string {
    return `room:${roomId}`
  }
}
