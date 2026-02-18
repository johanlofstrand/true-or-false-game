import type { Server } from "socket.io";
import type {
  Room,
  Question,
  LeaderboardEntry,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@facit/shared";
import type { HintTracker } from "./hints.js";

interface PlayerQuestionState {
  answered: boolean;
  answer: boolean | null;
  correct: boolean;
  timeMs: number;
  scoreAwarded: number;
}

interface ActiveGame {
  roomId: string;
  currentQuestionIndex: number;
  questionStartTime: number;
  timer: ReturnType<typeof setTimeout> | null;
  playerStates: Map<string, PlayerQuestionState>;
  answerHistory: Map<string, PlayerQuestionState[]>;
  advancing: boolean;
}

type GameIO = Server<ClientToServerEvents, ServerToClientEvents>;

export class GameManager {
  private games = new Map<string, ActiveGame>();

  getGame(roomId: string): ActiveGame | undefined {
    return this.games.get(roomId);
  }

  startGame(
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): boolean {
    if (room.status !== "lobby") return false;
    if (room.players.length < 2) return false;
    if (room.questions.length === 0) return false;

    // Reset scores
    for (const player of room.players) {
      player.score = 0;
    }

    hintTracker.reset();
    room.status = "playing";
    room.currentQuestionIndex = 0;

    const game: ActiveGame = {
      roomId: room.id,
      currentQuestionIndex: 0,
      questionStartTime: 0,
      timer: null,
      playerStates: new Map(),
      answerHistory: new Map(),
      advancing: false,
    };

    for (const player of room.players) {
      game.answerHistory.set(player.id, []);
    }

    this.games.set(room.id, game);

    const socketRoom = `room:${room.id}`;
    io.to(socketRoom).emit("game:started");

    // Send first question after short delay
    setTimeout(() => {
      this.sendQuestion(room, io, hintTracker, playerCurrentQuestion);
    }, 500);

    return true;
  }

  handleAnswer(
    socketId: string,
    answer: boolean,
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): void {
    const game = this.games.get(room.id);
    if (!game) return;

    const playerState = game.playerStates.get(socketId);
    if (!playerState || playerState.answered) return;

    // Ensure this answer is for the current question
    const question = room.questions[game.currentQuestionIndex];
    if (!question) return;

    const timeMs = Date.now() - game.questionStartTime;
    const correct = answer === question.isTrue;

    let scoreAwarded = 0;
    if (correct) {
      const timeLimitMs = room.settings.timePerQuestion * 1000;
      const timeRatio = Math.min(timeMs / timeLimitMs, 1);
      const speedMultiplier = 1 - timeRatio * 0.5;
      const hintMultiplier = hintTracker.getScoreMultiplier(
        socketId,
        question.id,
      );
      scoreAwarded = Math.round(1000 * speedMultiplier * hintMultiplier);
    }

    playerState.answered = true;
    playerState.answer = answer;
    playerState.correct = correct;
    playerState.timeMs = timeMs;
    playerState.scoreAwarded = scoreAwarded;

    // Update player score
    const player = room.players.find((p) => p.id === socketId);
    if (player) {
      player.score += scoreAwarded;
    }

    // Record in history
    const history = game.answerHistory.get(socketId);
    if (history) {
      history.push({ ...playerState });
    }

    // Emit result to the answering player
    io.to(socketId).emit("game:result", correct, question.isTrue, scoreAwarded);

    // Check if all players have answered
    if (this.allAnswered(game, room)) {
      this.advanceOrFinish(room, io, hintTracker, playerCurrentQuestion);
    }
  }

  handlePlayerDisconnect(
    socketId: string,
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): void {
    const game = this.games.get(room.id);
    if (!game) return;

    // Mark as answered if they haven't
    const playerState = game.playerStates.get(socketId);
    if (playerState && !playerState.answered) {
      playerState.answered = true;
      playerState.answer = null;
      playerState.correct = false;
      playerState.timeMs = 0;
      playerState.scoreAwarded = 0;

      const history = game.answerHistory.get(socketId);
      if (history) {
        history.push({ ...playerState });
      }
    }

    // Remove from player states
    game.playerStates.delete(socketId);

    // If 1 or fewer players remain, end game
    const remainingPlayers = room.players.filter((p) =>
      game.playerStates.has(p.id),
    );
    if (remainingPlayers.length <= 1) {
      this.finishGame(room, io);
      return;
    }

    // Check if all remaining players have answered
    if (this.allAnswered(game, room)) {
      this.advanceOrFinish(room, io, hintTracker, playerCurrentQuestion);
    }
  }

  private sendQuestion(
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): void {
    const game = this.games.get(room.id);
    if (!game) return;

    const question = room.questions[game.currentQuestionIndex];
    if (!question) return;

    // Reset player states for new question
    game.playerStates.clear();
    game.advancing = false;
    for (const player of room.players) {
      game.playerStates.set(player.id, {
        answered: false,
        answer: null,
        correct: false,
        timeMs: 0,
        scoreAwarded: 0,
      });
      playerCurrentQuestion.set(player.id, question);
    }

    game.questionStartTime = Date.now();

    // Send question without the answer
    const socketRoom = `room:${room.id}`;
    const { isTrue: _, ...safeQuestion } = question;
    io.to(socketRoom).emit(
      "game:question",
      safeQuestion,
      game.currentQuestionIndex,
    );

    // Start timer
    if (game.timer) clearTimeout(game.timer);
    game.timer = setTimeout(() => {
      this.handleTimeUp(room, io, hintTracker, playerCurrentQuestion);
    }, room.settings.timePerQuestion * 1000);
  }

  private handleTimeUp(
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): void {
    const game = this.games.get(room.id);
    if (!game) return;

    const socketRoom = `room:${room.id}`;
    io.to(socketRoom).emit("game:timeUp");

    const question = room.questions[game.currentQuestionIndex];

    // Mark unanswered players
    for (const [playerId, state] of game.playerStates) {
      if (!state.answered) {
        state.answered = true;
        state.answer = null;
        state.correct = false;
        state.timeMs = room.settings.timePerQuestion * 1000;
        state.scoreAwarded = 0;

        const history = game.answerHistory.get(playerId);
        if (history) {
          history.push({ ...state });
        }

        // Send result to timed-out players
        if (question) {
          io.to(playerId).emit("game:result", false, question.isTrue, 0);
        }
      }
    }

    this.advanceOrFinish(room, io, hintTracker, playerCurrentQuestion);
  }

  private advanceOrFinish(
    room: Room,
    io: GameIO,
    hintTracker: HintTracker,
    playerCurrentQuestion: Map<string, Question>,
  ): void {
    const game = this.games.get(room.id);
    if (!game) return;

    // Race guard: prevent double-advance per question
    if (game.advancing) return;
    game.advancing = true;

    // Clear timer
    if (game.timer) {
      clearTimeout(game.timer);
      game.timer = null;
    }

    // Emit current scores
    const socketRoom = `room:${room.id}`;
    io.to(socketRoom).emit("game:scores", room.players);

    game.currentQuestionIndex++;
    room.currentQuestionIndex = game.currentQuestionIndex;

    if (game.currentQuestionIndex >= room.questions.length) {
      // Game finished — wait a moment then send final results
      setTimeout(() => {
        this.finishGame(room, io);
      }, 2000);
    } else {
      // Send next question after brief delay
      setTimeout(() => {
        this.sendQuestion(room, io, hintTracker, playerCurrentQuestion);
      }, 2000);
    }
  }

  private finishGame(room: Room, io: GameIO): void {
    const game = this.games.get(room.id);
    if (!game) return;

    // Clear any remaining timer
    if (game.timer) {
      clearTimeout(game.timer);
      game.timer = null;
    }

    room.status = "finished";

    // Build leaderboard
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    const leaderboard: LeaderboardEntry[] = sorted.map((player, i) => {
      const history = game.answerHistory.get(player.id) ?? [];
      const correctAnswers = history.filter((h) => h.correct).length;
      const answeredQuestions = history.filter((h) => h.answer !== null);
      const totalTime = answeredQuestions.reduce(
        (sum, h) => sum + h.timeMs,
        0,
      );
      const averageTimeMs =
        answeredQuestions.length > 0
          ? totalTime / answeredQuestions.length
          : 0;

      return {
        player,
        rank: i + 1,
        correctAnswers,
        totalQuestions: room.questions.length,
        averageTimeMs,
      };
    });

    const socketRoom = `room:${room.id}`;
    io.to(socketRoom).emit("game:finished", leaderboard);

    // Clean up
    this.games.delete(room.id);
  }

  private allAnswered(game: ActiveGame, room: Room): boolean {
    for (const player of room.players) {
      const state = game.playerStates.get(player.id);
      if (state && !state.answered) return false;
    }
    return true;
  }
}
