import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { ClientToServerEvents, ServerToClientEvents } from '@game/shared'
import { RoomManager } from './rooms'
import { GameManager } from './game'
import { getQuestions } from './questions'

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
})

const roomManager = new RoomManager()
const gameManager = new GameManager()

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('room:create', (playerName) => {
    const room = roomManager.createRoom(socket.id, playerName)
    socket.join(roomManager.socketRoomName(room.id))
    socket.emit('room:created', room)
    console.log(`Room ${room.code} created by ${playerName}`)
  })

  socket.on('room:join', (roomCode, playerName) => {
    const result = roomManager.joinRoom(socket.id, roomCode, playerName)
    if (!result) {
      socket.emit('error', 'Room not found or game already started')
      return
    }
    const { room, player } = result
    socket.join(roomManager.socketRoomName(room.id))
    socket.emit('room:joined', room)
    socket.to(roomManager.socketRoomName(room.id)).emit('room:playerJoined', player)
    console.log(`${playerName} joined room ${room.code}`)
  })

  socket.on('room:leave', () => {
    handleLeave(socket.id)
  })

  socket.on('game:start', () => {
    const room = roomManager.getRoomBySocket(socket.id)
    if (!room) return

    if (room.hostId !== socket.id) {
      socket.emit('error', 'Only the host can start the game')
      return
    }
    if (room.players.length < 2) {
      socket.emit('error', 'Need at least 2 players to start')
      return
    }
    if (room.status === 'playing') {
      socket.emit('error', 'Game already in progress')
      return
    }

    // Allow restarting from finished state
    if (room.status === 'finished') {
      room.questions = getQuestions(room.settings.questionCount)
    }

    gameManager.startGame(room, io)
  })

  socket.on('game:answer', (answer) => {
    const room = roomManager.getRoomBySocket(socket.id)
    if (!room) return
    gameManager.handleAnswer(socket.id, answer, room, io)
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    handleLeave(socket.id)
  })

  function handleLeave(socketId: string) {
    const room = roomManager.getRoomBySocket(socketId)
    if (!room) return

    const roomName = roomManager.socketRoomName(room.id)

    if (room.status === 'playing') {
      gameManager.handleDisconnect(socketId, room, io)
    }

    const { room: updatedRoom, playerId } = roomManager.leaveRoom(socketId)

    if (updatedRoom) {
      io.to(roomName).emit('room:playerLeft', playerId)
    }

    socket.leave(roomName)
  }
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
