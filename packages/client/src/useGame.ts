import { useCallback, useEffect, useRef, useState } from "react";
import type { Player, Question } from "@facit/shared";
import type { AppSocket } from "./useSocket";

export type GamePhase = "waiting" | "question" | "result" | "scores";

export interface LastResult {
  correct: boolean;
  correctAnswer: boolean;
  scoreAwarded: number;
}

export interface GameState {
  phase: GamePhase;
  currentQuestion: Omit<Question, "isTrue"> | null;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  timePerQuestion: number;
  answered: boolean;
  lastResult: LastResult | null;
  scores: Player[] | null;
}

export function useGame(socket: AppSocket | null, totalQuestions: number, timePerQuestion: number) {
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [currentQuestion, setCurrentQuestion] = useState<Omit<Question, "isTrue"> | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [scores, setScores] = useState<Player[] | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    questionStartRef.current = performance.now();
    setTimeRemaining(timePerQuestion);

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - questionStartRef.current) / 1000;
      const remaining = Math.max(0, timePerQuestion - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearTimer();
      }
    }, 100);
  }, [timePerQuestion, clearTimer]);

  useEffect(() => {
    if (!socket) return;

    const onQuestion = (question: Omit<Question, "isTrue">, index: number) => {
      setCurrentQuestion(question);
      setQuestionIndex(index);
      setAnswered(false);
      setLastResult(null);
      setScores(null);
      setPhase("question");
      startTimer();
    };

    const onTimeUp = () => {
      clearTimer();
      setTimeRemaining(0);
    };

    const onResult = (correct: boolean, correctAnswer: boolean, scoreAwarded: number) => {
      clearTimer();
      setAnswered(true);
      setLastResult({ correct, correctAnswer, scoreAwarded });
      setPhase("result");
    };

    const onScores = (players: Player[]) => {
      setScores(players);
      setPhase("scores");
    };

    socket.on("game:question", onQuestion);
    socket.on("game:timeUp", onTimeUp);
    socket.on("game:result", onResult);
    socket.on("game:scores", onScores);

    return () => {
      socket.off("game:question", onQuestion);
      socket.off("game:timeUp", onTimeUp);
      socket.off("game:result", onResult);
      socket.off("game:scores", onScores);
      clearTimer();
    };
  }, [socket, startTimer, clearTimer]);

  const answer = useCallback(
    (value: boolean) => {
      if (!socket || answered) return;
      setAnswered(true);
      socket.emit("game:answer", value);
    },
    [socket, answered],
  );

  return {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    timeRemaining,
    timePerQuestion,
    answered,
    lastResult,
    scores,
    answer,
  };
}
