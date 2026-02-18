/** Supported languages */
export type Language = "en" | "sv";

/** A single quiz question */
export interface Question {
  id: string;
  statement: string;
  isTrue: boolean;
  category?: string;
  source?: string;
  hints?: string[];
}

// ── Progressive Hints ────────────────────────────────────

/** Hint levels from least to most revealing */
export type HintLevel = 1 | 2 | 3;

/** A single hint returned to the player */
export interface Hint {
  level: HintLevel;
  text: string;
}

/** Score multipliers applied when hints are used. The multiplier for the
 *  highest hint level requested is used for the final score calculation. */
export const HINT_SCORE_MULTIPLIERS: Record<HintLevel, number> = {
  1: 0.75, // 25% penalty
  2: 0.5,  // 50% penalty
  3: 0.25, // 75% penalty
};

/** Maximum number of hints available per question */
export const MAX_HINTS = 3;

/** Player in a game room */
export interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

/** Game room state */
export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  status: RoomStatus;
  currentQuestionIndex: number;
  questions: Question[];
  settings: GameSettings;
}

export type RoomStatus = "lobby" | "playing" | "finished";

/** Configurable game settings */
export interface GameSettings {
  questionCount: number;
  timePerQuestion: number; // seconds
  hintsEnabled: boolean;
  useAI: boolean;
  language: Language;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  questionCount: 10,
  timePerQuestion: 15,
  hintsEnabled: true,
  useAI: false,
  language: "sv",
};

/** Answer submitted by a player */
export interface PlayerAnswer {
  playerId: string;
  questionId: string;
  answer: boolean;
  timeMs: number; // time taken in ms
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  player: Player;
  rank: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTimeMs: number;
}

// ── Socket.io event types ──────────────────────────────────

/** Events sent from client to server */
export interface ClientToServerEvents {
  "room:create": (playerName: string, language: Language) => void;
  "room:join": (roomCode: string, playerName: string) => void;
  "room:leave": () => void;
  "game:start": () => void;
  "game:answer": (answer: boolean) => void;
  "hint:request": () => void;
}

/** Events sent from server to client */
export interface ServerToClientEvents {
  "room:created": (room: Room) => void;
  "room:joined": (room: Room) => void;
  "room:playerJoined": (player: Player) => void;
  "room:playerLeft": (playerId: string) => void;
  "game:started": () => void;
  "game:question": (question: Omit<Question, "isTrue">, index: number) => void;
  "game:timeUp": () => void;
  "game:result": (correct: boolean, correctAnswer: boolean, scoreAwarded: number) => void;
  "game:scores": (players: Player[]) => void;
  "game:finished": (leaderboard: LeaderboardEntry[]) => void;
  "hint:revealed": (hint: Hint, scoreMultiplier: number) => void;
  "hint:none": () => void;
  error: (message: string) => void;
}
