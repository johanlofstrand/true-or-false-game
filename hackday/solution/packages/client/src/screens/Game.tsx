import { useEffect, useState } from 'react'

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

interface GameProps {
  question: QuestionData | null
  timePerQuestion: number
  answered: boolean
  timeUp: boolean
  result: ResultData | null
  onAnswer: (answer: boolean) => void
}

export function Game({ question, timePerQuestion, answered, timeUp, result, onAnswer }: GameProps) {
  const [timeLeft, setTimeLeft] = useState(1) // 1 = full, 0 = empty

  useEffect(() => {
    if (!question) return
    setTimeLeft(1)

    if (answered || timeUp) return

    const start = Date.now()
    const total = timePerQuestion * 1000

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 1 - elapsed / total)
      setTimeLeft(remaining)
      if (remaining === 0) clearInterval(interval)
    }, 50)

    return () => clearInterval(interval)
  }, [question, answered, timeUp, timePerQuestion])

  const timerColor =
    timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444'

  if (!question) {
    return (
      <div className="screen">
        <div className="spinner" />
        <p className="waiting">Loading question…</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <p className="question-meta">
        Question {question.index + 1} / {question.total}
        {question.category ? ` · ${question.category}` : ''}
      </p>

      <div className="timer-track" style={{ width: '100%', maxWidth: 480 }}>
        <div
          className="timer-fill"
          style={{ width: `${timeLeft * 100}%`, background: timerColor }}
        />
      </div>

      <p className="question-statement">{question.statement}</p>

      {!answered && !timeUp && (
        <div className="answer-buttons">
          <button className="btn btn-true" onClick={() => onAnswer(true)}>
            TRUE
          </button>
          <button className="btn btn-false" onClick={() => onAnswer(false)}>
            FALSE
          </button>
        </div>
      )}

      {(answered || timeUp) && !result && (
        <div className="result-banner result-timeout">
          <p className="waiting">Waiting for other players…</p>
        </div>
      )}

      {result && (
        <div
          className={`result-banner ${
            result.correct ? 'result-correct' : timeUp && !answered ? 'result-timeout' : 'result-wrong'
          }`}
        >
          {result.correct ? (
            <>
              <div>Correct! 🎉</div>
              <div style={{ fontSize: '1rem', marginTop: 4, opacity: 0.85 }}>
                +{result.scoreAwarded} pts
              </div>
            </>
          ) : (
            <>
              <div>Wrong!</div>
              <div style={{ fontSize: '0.9rem', marginTop: 4, opacity: 0.85 }}>
                The answer was {result.correctAnswer ? 'TRUE' : 'FALSE'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
