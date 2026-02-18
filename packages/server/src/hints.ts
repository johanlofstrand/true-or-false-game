import type { Question, Hint, HintLevel } from "@facit/shared";
import { MAX_HINTS, HINT_SCORE_MULTIPLIERS } from "@facit/shared";

/**
 * Generate progressive hints for a question.
 *
 * Hint strategy (from least to most revealing):
 *  1. Category hint — tells the player what topic the statement is about
 *  2. Source hint — reveals where the fact comes from (or a general nudge)
 *  3. Elimination hint — strongly narrows it down without giving the answer
 */
export function generateHints(question: Question): Hint[] {
  const hints: Hint[] = [];

  // If the question already has custom hints, use those
  if (question.hints && question.hints.length > 0) {
    return question.hints.slice(0, MAX_HINTS).map((text, i) => ({
      level: (i + 1) as HintLevel,
      text,
    }));
  }

  // Level 1 — Category hint
  if (question.category) {
    hints.push({
      level: 1,
      text: `This statement is about: ${question.category}`,
    });
  } else {
    hints.push({
      level: 1,
      text: "Think carefully — does the wording seem absolute or nuanced?",
    });
  }

  // Level 2 — Source hint
  if (question.source) {
    hints.push({
      level: 2,
      text: `Source: ${question.source}`,
    });
  } else {
    hints.push({
      level: 2,
      text: "Look for key words that might make the statement extreme or unlikely.",
    });
  }

  // Level 3 — Elimination / strong nudge
  hints.push({
    level: 3,
    text: question.isTrue
      ? "This one is more likely than you think."
      : "This one sounds plausible, but is it really?",
  });

  return hints;
}

/** Tracks per-player hint usage during a game */
export class HintTracker {
  /** Map<playerId, Map<questionId, highestHintLevelUsed>> */
  private usage = new Map<string, Map<string, HintLevel>>();

  /** Record a hint being revealed. Returns the new highest level for this question. */
  recordHint(playerId: string, questionId: string, level: HintLevel): HintLevel {
    if (!this.usage.has(playerId)) {
      this.usage.set(playerId, new Map());
    }
    const playerMap = this.usage.get(playerId)!;
    const current = playerMap.get(questionId) ?? 0;
    const newLevel = Math.max(current, level) as HintLevel;
    playerMap.set(questionId, newLevel);
    return newLevel;
  }

  /** Get the next hint level for this player+question (or null if all used). */
  getNextLevel(playerId: string, questionId: string): HintLevel | null {
    const current = this.usage.get(playerId)?.get(questionId) ?? 0;
    const next = current + 1;
    return next <= MAX_HINTS ? (next as HintLevel) : null;
  }

  /** Get the score multiplier for a player's hint usage on a given question. */
  getScoreMultiplier(playerId: string, questionId: string): number {
    const level = this.usage.get(playerId)?.get(questionId);
    return level ? HINT_SCORE_MULTIPLIERS[level] : 1;
  }

  /** Reset all tracking (e.g. when a new game starts). */
  reset(): void {
    this.usage.clear();
  }
}
