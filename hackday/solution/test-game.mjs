// Simulates two players connecting, joining a room, and playing a full game.
// Run with: node test-game.mjs (server must be running on port 3001)

import { io } from 'socket.io-client'

const SERVER = 'http://localhost:3001'
const QUESTION_COUNT = 5 // use fewer questions for a faster test

function connect(name) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER, { transports: ['websocket'] })
    socket.on('connect', () => {
      console.log(`  ${name} connected (${socket.id})`)
      resolve(socket)
    })
    socket.on('connect_error', reject)
    setTimeout(() => reject(new Error(`${name} timed out connecting`)), 5000)
  })
}

function waitFor(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve))
}

async function main() {
  console.log('\n══════════════════════════════════════')
  console.log('  True or False — Automated Game Test ')
  console.log('══════════════════════════════════════\n')

  console.log('[1/7] Connecting players...')
  const alice = await connect('Alice')
  const bob   = await connect('Bob  ')

  console.log('\n[2/7] Alice creates a room...')
  alice.emit('room:create', 'Alice')
  const room = await waitFor(alice, 'room:created')
  console.log(`  Room code: ${room.code} (${room.settings.questionCount} questions, ${room.settings.timePerQuestion}s per question)`)

  console.log('\n[3/7] Bob joins the room...')
  const bobRoomPromise = waitFor(bob, 'room:joined')
  const aliceNotifyPromise = waitFor(alice, 'room:playerJoined')
  bob.emit('room:join', room.code, 'Bob')
  await Promise.all([bobRoomPromise, aliceNotifyPromise])
  console.log('  Bob is in the lobby. Alice sees Bob arrive.')

  console.log('\n[4/7] Alice starts the game...')
  const gameStartedAlice = waitFor(alice, 'game:started')
  const gameStartedBob   = waitFor(bob,   'game:started')
  alice.emit('game:start')
  await Promise.all([gameStartedAlice, gameStartedBob])
  console.log('  Game started!\n')

  // ── Play through all questions ──────────────────────────────────────────────
  console.log('[5/7] Playing through questions...\n')

  const aliceStats = { score: 0, correct: 0 }
  const bobStats   = { score: 0, correct: 0 }
  let questionsDone = 0

  await new Promise((resolveGame) => {
    function onQuestion(player, name, stats, isAlice) {
      player.on('game:question', (q, index, total) => {
        if (isAlice) {
          console.log(`  Q${index + 1}/${total} [${q.category}]`)
          console.log(`  "${q.statement}"`)
        }

        // Alice answers true after ~300ms, Bob answers false after ~600ms
        // This means if the answer is TRUE, Alice is right; if FALSE, Bob is right
        const aliceAnswer = true
        const bobAnswer   = false
        const delay = isAlice ? 300 + Math.random() * 400 : 600 + Math.random() * 600
        setTimeout(() => player.emit('game:answer', isAlice ? aliceAnswer : bobAnswer), delay)
      })

      player.on('game:result', (correct, correctAnswer, scoreAwarded) => {
        stats.score += scoreAwarded
        if (correct) stats.correct++
        const icon = correct ? '✓' : '✗'
        console.log(`    ${name.padEnd(6)} ${icon}  answer was ${correctAnswer ? 'TRUE ' : 'FALSE'} → +${scoreAwarded} pts`)
      })
    }

    onQuestion(alice, 'Alice', aliceStats, true)
    onQuestion(bob,   'Bob  ', bobStats,   false)

    alice.on('game:scores', (players) => {
      const sorted = [...players].sort((a, b) => b.score - a.score)
      console.log(`    ── scores: ${sorted.map(p => `${p.name} ${p.score}`).join(' | ')} ──`)
      questionsDone++
    })

    alice.once('game:finished', (leaderboard) => resolveGame(leaderboard))
    bob.once('game:finished', () => {}) // consume event
  }).then((leaderboard) => {
    console.log('\n[6/7] Game finished!\n')
    console.log('══════════════════════════════════════')
    console.log('         FINAL LEADERBOARD            ')
    console.log('══════════════════════════════════════')
    leaderboard.forEach((entry) => {
      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
      const avgTime = entry.averageTimeMs > 0
        ? `avg ${(entry.averageTimeMs / 1000).toFixed(2)}s`
        : 'no correct answers'
      console.log(
        `  ${medal} ${entry.rank}. ${entry.player.name.padEnd(8)} ` +
        `${String(entry.player.score).padStart(5)} pts  ` +
        `${entry.correctAnswers}/${entry.totalQuestions} correct  ` +
        `(${avgTime})`
      )
    })
    console.log('══════════════════════════════════════')
  })

  console.log('\n[7/7] Disconnecting players...')
  alice.disconnect()
  bob.disconnect()
  console.log('  Done. Test passed! ✓\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('\nTest failed:', err.message)
  process.exit(1)
})
