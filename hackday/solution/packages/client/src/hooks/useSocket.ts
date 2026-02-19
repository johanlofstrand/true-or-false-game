import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@game/shared'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function useSocket(): AppSocket | null {
  const [socket, setSocket] = useState<AppSocket | null>(null)

  useEffect(() => {
    const s: AppSocket = io({ transports: ['websocket', 'polling'] })

    s.on('connect', () => setSocket(s))
    s.on('disconnect', () => setSocket(null))

    return () => {
      s.disconnect()
    }
  }, [])

  return socket
}
