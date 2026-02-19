import { useCallback, useEffect, useRef, useState } from "react";
import type { Room, Language } from "@facit/shared";
import type { AppSocket } from "./useSocket";
import { useGame } from "./useGame";
import { useSwipe } from "./useSwipe";
import { useHints } from "./useHints";
import { HintDisplay } from "./HintDisplay";
import { t } from "./i18n";

interface GameScreenProps {
  socket: AppSocket;
  room: Room;
  playerId: string;
  language: Language;
}

export function GameScreen({ socket, room, playerId, language }: GameScreenProps) {
  const {
    phase,
    currentQuestion,
    questionIndex,
    timeRemaining,
    timePerQuestion,
    answered,
    lastResult,
    scores,
    answer,
  } = useGame(socket, room.questions.length, room.settings.timePerQuestion);

  const hints = useHints(socket);
  const [cardExiting, setCardExiting] = useState<"left" | "right" | null>(null);
  const [showFirstHint, setShowFirstHint] = useState(true);
  const cardAreaRef = useRef<HTMLElement>(null);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      setCardExiting(direction);
      setTimeout(() => {
        answer(direction === "right");
        setCardExiting(null);
      }, 300);
    },
    [answer],
  );

  const swipe = useSwipe({
    enabled: phase === "question" && !answered && !cardExiting,
    threshold: 80,
    onSwipe: handleSwipe,
  });

  const handleButtonAnswer = useCallback(
    (value: boolean) => {
      if (answered || cardExiting) return;
      const dir = value ? "right" : "left";
      setCardExiting(dir);
      setTimeout(() => {
        answer(value);
        setCardExiting(null);
      }, 300);
    },
    [answer, answered, cardExiting],
  );

  // Reset hints and swipe on new question
  useEffect(() => {
    if (phase === "question") {
      hints.reset();
      swipe.reset();
      setCardExiting(null);
    }
  }, [phase, questionIndex, hints.reset, swipe.reset]);

  // Hide first-question hint after first answer
  useEffect(() => {
    if (questionIndex > 0) setShowFirstHint(false);
  }, [questionIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase !== "question" || answered || cardExiting) return;

      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleButtonAnswer(true);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleButtonAnswer(false);
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        hints.requestHint();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, answered, cardExiting, handleButtonAnswer, hints]);

  // Timer bar color and ratio
  const timeRatio = timePerQuestion > 0 ? timeRemaining / timePerQuestion : 0;
  const timerSeconds = Math.ceil(timeRemaining);

  // Card transform
  const getCardStyle = (): React.CSSProperties => {
    if (cardExiting === "right") {
      return { animation: "card-exit-right 300ms ease-in forwards" };
    }
    if (cardExiting === "left") {
      return { animation: "card-exit-left 300ms ease-in forwards" };
    }
    if (swipe.isDragging) {
      return {
        transform: `translateX(${swipe.offsetX}px) rotate(${swipe.offsetX * 0.1}deg)`,
        transition: "none",
        cursor: "grabbing",
      };
    }
    return {};
  };

  // Direction indicator opacity
  const indicatorOpacity = (dir: "left" | "right") => {
    const offset = swipe.offsetX;
    if (dir === "right" && offset > 20) {
      return Math.min(1, (offset - 20) / 60);
    }
    if (dir === "left" && offset < -20) {
      return Math.min(1, (Math.abs(offset) - 20) / 60);
    }
    return 0;
  };

  // Scores phase
  if (phase === "scores" && scores) {
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    return (
      <main className="game-screen" aria-label={t(language, "game.screen")}>
        <div className="scores-phase">
          <h2 className="scores-phase__title">
            {t(language, "game.standingsAfter", { n: questionIndex + 1 })}
          </h2>
          <ol className="scores-list">
            {sorted.map((player, i) => (
              <li
                key={player.id}
                className={`scores-list__item${player.id === playerId ? " scores-list__item--you" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="scores-list__rank">{i + 1}.</span>
                <span className="scores-list__name">
                  {player.name}
                  {player.id === playerId && ` (${t(language, "lobby.you")})`}
                </span>
                <span className="scores-list__score">{player.score} {t(language, "game.points")}</span>
              </li>
            ))}
          </ol>
          <p className="scores-phase__next">{t(language, "game.nextSoon")}</p>
        </div>
      </main>
    );
  }

  // Waiting phase
  if (phase === "waiting" && !currentQuestion) {
    return (
      <main className="game-screen" aria-label={t(language, "game.screen")}>
        <div className="game-waiting">
          <p className="game-waiting__text">{t(language, "game.preparing")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen" aria-label={t(language, "game.screen")}>
      {/* Header */}
      <header className="game-header">
        <p className="game-header__progress">
          {t(language, "game.questionOf", { current: questionIndex + 1, total: room.questions.length })}
        </p>
        <p
          className={`game-header__timer${timeRatio < 0.25 ? " game-header__timer--critical" : ""}`}
          aria-label={t(language, "game.secondsLeft", { n: timerSeconds })}
        >
          {timerSeconds}s
        </p>
      </header>

      {/* Timer bar */}
      <div
        className={`timer-bar${answered ? " timer-bar--answered" : ""}`}
        role="progressbar"
        aria-valuenow={timerSeconds}
        aria-valuemin={0}
        aria-valuemax={timePerQuestion}
        aria-label={t(language, "game.timeLeft")}
      >
        <div
          className={`timer-bar__fill${timeRatio < 0.25 ? " timer-bar__fill--critical" : timeRatio < 0.5 ? " timer-bar__fill--warning" : ""}`}
          style={{ "--time-ratio": timeRatio } as React.CSSProperties}
        />
      </div>

      {/* Card area */}
      <section className="game-card-area" ref={cardAreaRef} aria-label={t(language, "game.questionArea")}>
        {/* Direction indicators */}
        <span
          className="direction-label direction-label--left"
          aria-hidden="true"
          style={{ opacity: indicatorOpacity("left") }}
        >
          {t(language, "game.false")}
        </span>
        <span
          className="direction-label direction-label--right"
          aria-hidden="true"
          style={{ opacity: indicatorOpacity("right") }}
        >
          {t(language, "game.true")}
        </span>

        {/* Question card */}
        {currentQuestion && (
          <div
            ref={swipe.ref}
            className={`question-card${phase === "question" && !cardExiting ? " question-card--enter" : ""}${answered ? " question-card--answered" : ""}`}
            style={getCardStyle()}
            role="group"
            aria-label={t(language, "game.statement")}
          >
            <p className="question-card__statement">
              {currentQuestion.statement}
            </p>
            {currentQuestion.category && (
              <p className="question-card__category">
                {currentQuestion.category}
              </p>
            )}
          </div>
        )}

        {/* Hint display */}
        {phase === "question" && !answered && room.settings.hintsEnabled && (
          <section className="game-hints" aria-label={t(language, "hints.section")}>
            <HintDisplay
              revealedHints={hints.revealedHints}
              scoreMultiplier={hints.scoreMultiplier}
              hasMore={hints.hasMore}
              loading={hints.loading}
              onRequestHint={hints.requestHint}
              language={language}
            />
          </section>
        )}

        {/* Feedback overlay */}
        {phase === "result" && lastResult && (
          <div className="feedback-overlay" role="alert" aria-live="assertive">
            <div className={`feedback-overlay__icon${lastResult.correct ? " feedback-overlay__icon--correct" : " feedback-overlay__icon--incorrect"}`}>
              {lastResult.correct ? (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" />
                  <path d="M14 24l7 7 13-13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" />
                  <path d="M16 16l16 16M32 16l-16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <p className="feedback-overlay__label">
              {lastResult.correct ? t(language, "game.correct") : t(language, "game.incorrect")}
            </p>
            <p className="feedback-overlay__score">
              +{lastResult.scoreAwarded} {t(language, "game.points")}
            </p>
            <p className="feedback-overlay__answer">
              {t(language, "game.correctAnswer", {
                answer: lastResult.correctAnswer
                  ? t(language, "game.answerTrue")
                  : t(language, "game.answerFalse"),
              })}
            </p>
            <p className="feedback-overlay__waiting" aria-live="polite">
              {t(language, "game.waitingForPlayers")}
              <span className="waiting-dots" aria-hidden="true">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </p>
          </div>
        )}
      </section>

      {/* Answer buttons */}
      <div className="answer-buttons" role="group" aria-label={t(language, "game.answerOptions")}>
        <button
          type="button"
          className="answer-btn answer-btn--false"
          onClick={() => handleButtonAnswer(false)}
          disabled={answered || !!cardExiting || phase !== "question"}
          aria-keyshortcuts="ArrowLeft"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t(language, "game.falseBtn")}
        </button>
        <button
          type="button"
          className="answer-btn answer-btn--true"
          onClick={() => handleButtonAnswer(true)}
          disabled={answered || !!cardExiting || phase !== "question"}
          aria-keyshortcuts="ArrowRight"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t(language, "game.trueBtn")}
        </button>
      </div>

      {/* First-question hint */}
      {showFirstHint && questionIndex === 0 && phase === "question" && !answered && (
        <p className="game-instruction">
          {t(language, "game.swipeHint")}
        </p>
      )}
    </main>
  );
}
