import OpenAI from "openai";
import type { Question, Language } from "@facit/shared";
import { RateLimiter } from "./rate-limiter.js";

const AI_HOURLY_LIMIT = Number(process.env.AI_HOURLY_LIMIT ?? 10);
const aiRateLimiter = new RateLimiter();

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/** Check whether OpenAI integration is available (API key configured) */
export function isAIAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface RawAIQuestion {
  statement: string;
  isTrue: boolean;
  category: string;
  source: string;
  hints: string[];
}

function getSystemPrompt(language: Language): string {
  const langInstruction = language === "sv"
    ? "\nIMPORTANT: All statements, categories, sources, and hints MUST be written in Swedish."
    : "";

  return `You are a quiz question generator for a "True or False" trivia game.
Generate unique, interesting, and factually accurate true/false questions.

Rules:
- Each question must be a clear factual claim that is definitively true or false.
- Aim for a mix of roughly 50% true and 50% false statements.
- Cover diverse categories: science, history, geography, animals, culture, language, sports, technology, etc.
- False statements should be plausible misconceptions, not obviously wrong.
- Include a short source or explanation for each answer.
- Include 3 progressive hints per question, from vague to specific:
  - Hint 1: A general category clue
  - Hint 2: A narrower contextual clue
  - Hint 3: A strong clue that nearly gives away the answer
${langInstruction}

Respond with a JSON array of objects. Each object must have:
- "statement": the true/false claim (string)
- "isTrue": whether it is true (boolean)
- "category": topic category (string)
- "source": brief attribution or explanation (string)
- "hints": array of 3 hint strings, ordered from least to most revealing

Respond ONLY with valid JSON. No markdown, no explanation.`;
}

/**
 * Generate quiz questions using OpenAI.
 * Falls back to an empty array on failure — callers should use the
 * pre-generated bank as a fallback.
 */
export async function generateAIQuestions(
  count: number,
  language: Language = "en",
): Promise<Question[]> {
  if (!isAIAvailable()) {
    return [];
  }

  if (!aiRateLimiter.allow("ai:global", AI_HOURLY_LIMIT, 60 * 60 * 1000)) {
    console.warn(`AI rate limit reached (max ${AI_HOURLY_LIMIT}/hour). Falling back to question bank.`);
    return [];
  }

  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(language) },
        {
          role: "user",
          content: `Generate ${count} true/false quiz questions.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("AI question generation: empty response");
      return [];
    }

    const parsed: RawAIQuestion[] = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      console.warn("AI question generation: response is not an array");
      return [];
    }

    return parsed.map(
      (q, i): Question => ({
        id: `ai-${Date.now()}-${i}`,
        statement: q.statement,
        isTrue: q.isTrue,
        category: q.category,
        source: q.source,
        hints: q.hints,
      }),
    );
  } catch (err) {
    console.error("AI question generation failed:", err);
    return [];
  }
}
