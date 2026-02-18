# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Monorepo structure**: npm workspaces with `packages/*`. Three packages: `@facit/shared` (types), `@facit/server` (Express + Socket.io), `@facit/client` (Vite + React).
- **Shared types**: Import from `@facit/shared` in both server and client. Types include Socket.io event maps (`ClientToServerEvents`, `ServerToClientEvents`) for type-safe real-time communication. Hint types (`Hint`, `HintLevel`, `HINT_SCORE_MULTIPLIERS`, `MAX_HINTS`) also live here.
- **Server local imports**: Use `.js` extension for local imports in the server package (e.g. `import { foo } from "./hints.js"`). This is required by Node ESM resolution with `"type": "module"`.
- **Socket.io event pattern**: For request-response patterns, use paired events (e.g. `hint:request` → `hint:revealed` / `hint:none`). Register one-time listeners on the client before emitting, then clean up after response.
- **TypeScript config**: Base config in `tsconfig.base.json` at root, each package extends it. Client uses `jsx: "react-jsx"`. Do NOT use `.tsx` extensions in imports (causes TS5097 without `allowImportingTsExtensions`).
- **Dev commands**: `npm run dev:server` and `npm run dev:client` to run individually. Server uses `tsx watch`, client uses `vite`.
- **Ports**: Server on 3001, client on 5173 with Vite proxy for `/socket.io` to server.
- **Room management**: `RoomManager` class in `packages/server/src/rooms.ts` handles room lifecycle. Uses Socket.io rooms (`room:{roomId}`) for broadcasting. Tracks socket→room mapping for disconnect cleanup. Room codes are 4-char uppercase (no I/O to avoid confusion).
- **Question bank**: `packages/server/src/questions.ts` exports `getQuestions(count)` which returns a shuffled selection from the pre-generated bank. Used by `RoomManager.createRoom()` to populate room questions when AI is not enabled.
- **AI questions**: `packages/server/src/ai-questions.ts` provides optional OpenAI integration. `isAIAvailable()` checks for API key, `generateAIQuestions(count)` calls gpt-4o-mini and returns `Question[]`. Falls back to empty array on failure — callers use pre-generated bank as fallback. Requires `OPENAI_API_KEY` env var.
- **Client screen routing**: App.tsx uses a `useRoom` hook that tracks `screen` state ("home" | "lobby") and renders the corresponding screen component. No router library needed — state-driven rendering suffices for simple screen flows.
- **Socket singleton**: `useSocket` hook in client creates a single Socket.io connection on mount. Returns `null` until connected. All other hooks accept the socket as a parameter.
- **CSS approach**: Global CSS with custom properties (design tokens) in `index.css`. Dark theme, 8px grid spacing scale. No CSS framework — plain class names co-located with component usage.

---

## 2026-02-18 - US-001
- Created challenge README.md at project root
- Covers: project overview, features, tech stack, architecture, game flow, getting started, env vars, user stories table
- Files changed: README.md (new)
- **Learnings:**
  - PRD has empty acceptance criteria arrays for all stories — used project description and story titles to infer scope
  - Project uses Facit monorepo structure, Socket.io for real-time, and optional OpenAI integration
  - ralph-tui config lives in .ralph-tui/ with config.toml, session.json, session-meta.json, and progress.md
---

## 2026-02-18 - US-003
- Scaffolded facit monorepo with npm workspaces
- Created three packages: `@facit/shared`, `@facit/server`, `@facit/client`
- Files changed:
  - `package.json` - root monorepo config with workspace scripts
  - `tsconfig.base.json` - shared TypeScript base config
  - `.gitignore` - ignore node_modules, dist, env
  - `packages/shared/` - types for Question, Player, Room, GameSettings, Socket.io events
  - `packages/server/` - Express + Socket.io server with health check endpoint
  - `packages/client/` - Vite + React app with proxy to server
- **Learnings:**
  - npm workspaces resolve `@facit/shared` as `*` version automatically via symlinks
  - Client tsconfig should NOT use project references for `tsconfig.node.json` when running `tsc --noEmit` — the referenced project would need `composite: true` and cannot have `noEmit`
  - Vite handles `.tsx` imports fine but TypeScript's `tsc` rejects `.tsx` extensions in import paths without `allowImportingTsExtensions`
---

## 2026-02-18 - US-002
- Implemented progressive hints system across all three packages
- Files changed:
  - `packages/shared/src/types.ts` — Added `Hint`, `HintLevel`, `HINT_SCORE_MULTIPLIERS`, `MAX_HINTS`, `hints` field on `Question`, `hintsEnabled` on `GameSettings`, `hint:request`/`hint:revealed`/`hint:none` socket events
  - `packages/server/src/hints.ts` (new) — `generateHints()` function with 3-level progressive strategy (category → source → elimination), `HintTracker` class for per-player hint usage and score multiplier tracking
  - `packages/server/src/index.ts` — Integrated `hint:request` socket handler with hint generation and tracking
  - `packages/client/src/useHints.ts` (new) — React hook wrapping socket hint request/response with state management
  - `packages/client/src/HintDisplay.tsx` (new) — Presentational component showing revealed hints, score penalty, and request button
- **Learnings:**
  - Server local imports need `.js` extension for ESM (`"type": "module"`) even though source files are `.ts` — tsx runtime and tsc both resolve correctly
  - Socket.io event pattern for request-response: register temporary listeners before emit, clean up in both success and failure callbacks to avoid listener leaks
  - `Question.hints` optional array allows custom per-question hints to override auto-generated ones, keeping the system flexible for both pre-built and AI-generated question banks
---

## 2026-02-18 - US-005
- Implemented Socket.io room management on server
- Also created question bank (US-004 prerequisite) since it was needed for room creation
- Files changed:
  - `packages/server/src/questions.ts` (new) — Pre-generated question bank with 20 true/false questions across categories (history, science, animals, geography, etc.). Exports `getQuestions(count)` with Fisher-Yates shuffle.
  - `packages/server/src/rooms.ts` (new) — `RoomManager` class managing room lifecycle: create (with unique 4-char codes), join (by code), leave, disconnect cleanup. Tracks socket→room mapping. Uses Socket.io rooms for broadcasting.
  - `packages/server/src/index.ts` — Integrated room event handlers (`room:create`, `room:join`, `room:leave`) with Socket.io room broadcasting. Handles host reassignment on host leave, room cleanup when empty, and automatic leave-before-create for re-joining.
- **Learnings:**
  - Socket.io's `socket.join()` / `socket.leave()` and `io.to(room).emit()` / `socket.to(room).emit()` work well for room-scoped broadcasting. `socket.to()` excludes the sender, `io.to()` includes everyone.
  - Room codes exclude I and O to avoid confusion with 1 and 0
  - `crypto.randomUUID()` is available in Node.js without imports (global in modern Node)
  - When a player creates a new room, existing room membership should be cleaned up first to avoid ghost players
---

## 2026-02-18 - US-007
- Built client Home and Lobby screens with full Socket.io integration
- Files changed:
  - `packages/client/src/useSocket.ts` (new) — Singleton Socket.io connection hook. Creates connection on mount, exposes typed `AppSocket` or `null` while connecting.
  - `packages/client/src/useRoom.ts` (new) — Room state management hook. Handles `room:create`, `room:join`, `room:leave` emissions and listens for `room:created`, `room:joined`, `room:playerJoined`, `room:playerLeft`, and `error` events. Tracks screen state, room data, player ID, loading/error states, and host status. Maps server error messages to Swedish user-friendly strings.
  - `packages/client/src/HomeScreen.tsx` (new) — Home screen with player name input, "Skapa rum" button, divider, 4-cell room code input with auto-advance/backspace/paste handling, and "Gå med i rum" button. Full loading/error/disabled states.
  - `packages/client/src/LobbyScreen.tsx` (new) — Lobby screen showing room code with copy-to-clipboard, player list with real-time join/leave animations, host badge, "Starta spelet" button (host only, disabled with <2 players), waiting message with animated dots (non-host), and leave confirmation flow.
  - `packages/client/src/index.css` (new) — Global CSS with design tokens (dark theme, 8px grid, Inter font stack), shared form components, button variants (primary, secondary, ghost, loading), and all Home/Lobby screen styles. Accessible focus rings, skip-link, sr-only utility.
  - `packages/client/src/App.tsx` — Rewired to use `useSocket` + `useRoom` hooks with screen-based rendering (home → lobby).
  - `packages/client/src/main.tsx` — Added `index.css` import.
- **Learnings:**
  - Socket.io client `io()` with no URL argument connects to the current host, which combined with Vite proxy works seamlessly for dev
  - `socket.id` may be undefined briefly after connection — use `socket.id ?? null` for safe access
  - 4-cell code input needs careful event handling: `onChange` for character input, `onKeyDown` for backspace navigation, `onPaste` for distributing pasted text across cells
  - `aria-live="polite"` on the player list `<ul>` with `aria-relevant="additions removals"` lets screen readers announce player join/leave without re-reading the entire list
  - `autoCapitalize="characters"` on mobile inputs helps users enter uppercase room codes without manual Shift
---

## 2026-02-18 - US-010
- Added optional AI-generated question support via OpenAI integration
- Files changed:
  - `packages/shared/src/types.ts` — Added `useAI: boolean` to `GameSettings` (default `false`)
  - `packages/server/src/ai-questions.ts` (new) — OpenAI integration module with `isAIAvailable()` check and `generateAIQuestions(count)` function. Uses gpt-4o-mini with structured JSON output. Includes progressive hints in AI-generated questions. Returns empty array on failure for graceful fallback.
  - `packages/server/src/rooms.ts` — `RoomManager.createRoom()` is now `async`. When `useAI` is true and API key is configured, generates questions via OpenAI; falls back to pre-generated bank on failure or when AI is unavailable.
  - `packages/server/src/index.ts` — Updated `room:create` handler to `async`/`await` the now-async `createRoom()`.
  - `packages/server/package.json` — Added `openai` dependency.
  - `.env.example` (new) — Documents `PORT` and `OPENAI_API_KEY` environment variables.
- **Learnings:**
  - OpenAI SDK lazily reads `OPENAI_API_KEY` from `process.env` — no dotenv needed when env vars are set externally (e.g. shell, Docker, CI)
  - Making `createRoom` async required updating the Socket.io event handler to `async` — Socket.io supports async handlers natively
  - gpt-4o-mini is cost-effective for structured JSON generation (question bank) and responds quickly enough for room creation flow
  - Graceful fallback pattern: try AI → on empty result → fall back to pre-generated bank. This keeps the game functional regardless of API key configuration
---

## 2026-02-18 - US-009
- Built client results screen with leaderboard display
- Files changed:
  - `packages/client/src/ResultsScreen.tsx` (new) — Results screen component with podium visualization (top 3), full results table (rank, name, score, correct answers, average time), "Spela igen" button (host only), waiting message (non-host), and "Lämna spelet" action.
  - `packages/client/src/useRoom.ts` — Extended `Screen` type to include `"results"`, added `leaderboard` state (`LeaderboardEntry[]`), added `game:finished` listener to transition to results screen, added `playAgain` callback that returns to lobby. Leaderboard state is cleared on leave.
  - `packages/client/src/App.tsx` — Added `ResultsScreen` import and rendering when `screen === "results"`. Results screen check is placed before lobby check in render order.
  - `packages/client/src/index.css` — Added results screen styles: card layout, podium with CSS grid ordering (2nd-1st-3rd visual order), enter animation, responsive table with tabular-nums for numeric alignment, "you" highlight row and badge, and action buttons section.
- **Learnings:**
  - The `LeaderboardEntry` type in shared already contains `player`, `rank`, `correctAnswers`, `totalQuestions`, and `averageTimeMs` — enough for a complete results display without additional server changes
  - CSS `order` property is useful for podium layouts where visual order (2nd-1st-3rd) differs from DOM order (1st-2nd-3rd) while keeping accessible reading order
  - `font-variant-numeric: tabular-nums` ensures numeric columns align properly in the results table
  - `playAgain` returns to lobby screen rather than home — this preserves the room context so the host can start a new round without requiring everyone to rejoin
---

---

## Parallel Task: Build client results screen with leaderboard (US-009)

# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Monorepo structure**: npm workspaces with `packages/*`. Three packages: `@facit/shared` (types), `@facit/server` (Express + Socket.io), `@facit/client` (Vite + React).
- **Shared types**: Import from `@facit/shared` in both server and client. Types include Socket.io event maps (`ClientToServerEvents`, `ServerToClientEvents`) for type-safe real-time communication. Hint types (`Hint`, `HintLevel`, `HINT_SCORE_MULTIPLIERS`, `MAX_HINTS`) also live here.
- **Server local imports**: Use `.js` extension for local imports in the server package (e.g. `import { foo } from "./hints.js"`). This is required by Node ESM resolution with `"type": "module"`.
- **Socket.io event pattern**: For request-response patterns, use paired events (e.g. `hint:request` → `hint:revealed` / `hint:none`). Register one-time listeners on the client before emitting, then clean up after response.
- **TypeScript config**: Base config in `tsconfig.base.json` at root, each package extends it. Client uses `jsx: "react-jsx"`. Do NOT use `.tsx` extensions in imports (causes TS5097 without `allowImportingTsExtensions`).
- **Dev commands**: `npm run dev:server` and `npm run dev:client` to run individually. Server uses `tsx watch`, client uses `vite`.
- **Ports**: Server on 3001, client on 5173 with Vite proxy for `/socket.io` to server.
- **Room management**: `RoomManager` class in `packages/server/src/rooms.ts` handles room lifecycle. Uses Socket.io rooms (`room:{roomId}`) for broadcasting. Tracks socket→room mapping for disconnect cleanup. Room codes are 4-char uppercase (no I/O to avoid confusion).
- **Question bank**: `packages/server/src/questions.ts` exports `getQuestions(count)` which returns a shuffled selection from the pre-generated bank. Used by `RoomManager.createRoom()` to populate room questions.
- **Client screen routing**: App.tsx uses a `useRoom` hook that tracks `screen` state ("home" | "lobby") and renders the corresponding screen component. No router library needed — state-driven rendering suffices for simple screen flows.
- **Socket singleton**: `useSocket` hook in client creates a single Socket.io connection on mount. Returns `null` until connected. All other hooks accept the socket as a parameter.
- **CSS approach**: Global CSS with custom properties (design tokens) in `index.css`. Dark theme, 8px grid spacing scale. No CSS framework — plain class names co-located with component usage.

---

## 2026-02-18 - US-001
- Created challenge README.md at project root
- Covers: project overview, features, tech stack, architecture, game flow, getting started, env vars, user stories table
- Files changed: README.md (new)
- **Learnings:**
  - PRD has empty acceptance criteria arrays for all stories — used project description and story titles to infer scope
  - Project uses Facit monorepo structure, Socket.io for real-time, and optional OpenAI integration
  - ralph-tui config lives in .ralph-tui/ with config.toml, session.json, session-meta.json, and progress.md
---

## 2026-02-18 - US-003
- Scaffolded facit monorepo with npm workspaces
- Created three packages: `@facit/shared`, `@facit/server`, `@facit/client`
- Files changed:
  - `package.json` - root monorepo config with workspace scripts
  - `tsconfig.base.json` - shared TypeScript base config
  - `.gitignore` - ignore node_modules, dist, env
  - `packages/shared/` - types for Question, Player, Room, GameSettings, Socket.io events
  - `packages/server/` - Express + Socket.io server with health check endpoint
  - `packages/client/` - Vite + React app with proxy to server
- **Learnings:**
  - npm workspaces resolve `@facit/shared` as `*` version automatically via symlinks
  - Client tsconfig should NOT use project references for `tsconfig.node.json` when running `tsc --noEmit` — the referenced project would need `composite: true` and cannot have `noEmit`
  - Vite handles `.tsx` imports fine but TypeScript's `tsc` rejects `.tsx` extensions in import paths without `allowImportingTsExtensions`
---

## 2026-02-18 - US-002
- Implemented progressive hints system across all three packages
- Files changed:
  - `packages/shared/src/types.ts` — Added `Hint`, `HintLevel`, `HINT_SCORE_MULTIPLIERS`, `MAX_HINTS`, `hints` field on `Question`, `hintsEnabled` on `GameSettings`, `hint:request`/`hint:revealed`/`hint:none` socket events
  - `packages/server/src/hints.ts` (new) — `generateHints()` function with 3-level progressive strategy (category → source → elimination), `HintTracker` class for per-player hint usage and score multiplier tracking
  - `packages/server/src/index.ts` — Integrated `hint:request` socket handler with hint generation and tracking
  - `packages/client/src/useHints.ts` (new) — React hook wrapping socket hint request/response with state management
  - `packages/client/src/HintDisplay.tsx` (new) — Presentational component showing revealed hints, score penalty, and request button
- **Learnings:**
  - Server local imports need `.js` extension for ESM (`"type": "module"`) even though source files are `.ts` — tsx runtime and tsc both resolve correctly
  - Socket.io event pattern for request-response: register temporary listeners before emit, clean up in both success and failure callbacks to avoid listener leaks
  - `Question.hints` optional array allows custom per-question hints to override auto-generated ones, keeping the system flexible for both pre-built and AI-generated question banks
---

## 2026-02-18 - US-005
- Implemented Socket.io room management on server
- Also created question bank (US-004 prerequisite) since it was needed for room creation
- Files changed:
  - `packages/server/src/questions.ts` (new) — Pre-generated question bank with 20 true/false questions across categories (history, science, animals, geography, etc.). Exports `getQuestions(count)` with Fisher-Yates shuffle.
  - `packages/server/src/rooms.ts` (new) — `RoomManager` class managing room lifecycle: create (with unique 4-char codes), join (by code), leave, disconnect cleanup. Tracks socket→room mapping. Uses Socket.io rooms for broadcasting.
  - `packages/server/src/index.ts` — Integrated room event handlers (`room:create`, `room:join`, `room:leave`) with Socket.io room broadcasting. Handles host reassignment on host leave, room cleanup when empty, and automatic leave-before-create for re-joining.
- **Learnings:**
  - Socket.io's `socket.join()` / `socket.leave()` and `io.to(room).emit()` / `socket.to(room).emit()` work well for room-scoped broadcasting. `socket.to()` excludes the sender, `io.to()` includes everyone.
  - Room codes exclude I and O to avoid confusion with 1 and 0
  - `crypto.randomUUID()` is available in Node.js without imports (global in modern Node)
  - When a player creates a new room, existing room membership should be cleaned up first to avoid ghost players
---

## 2026-02-18 - US-007
- Built client Home and Lobby screens with full Socket.io integration
- Files changed:
  - `packages/client/src/useSocket.ts` (new) — Singleton Socket.io connection hook. Creates connection on mount, exposes typed `AppSocket` or `null` while connecting.
  - `packages/client/src/useRoom.ts` (new) — Room state management hook. Handles `room:create`, `room:join`, `room:leave` emissions and listens for `room:created`, `room:joined`, `room:playerJoined`, `room:playerLeft`, and `error` events. Tracks screen state, room data, player ID, loading/error states, and host status. Maps server error messages to Swedish user-friendly strings.
  - `packages/client/src/HomeScreen.tsx` (new) — Home screen with player name input, "Skapa rum" button, divider, 4-cell room code input with auto-advance/backspace/paste handling, and "Gå med i rum" button. Full loading/error/disabled states.
  - `packages/client/src/LobbyScreen.tsx` (new) — Lobby screen showing room code with copy-to-clipboard, player list with real-time join/leave animations, host badge, "Starta spelet" button (host only, disabled with <2 players), waiting message with animated dots (non-host), and leave confirmation flow.
  - `packages/client/src/index.css` (new) — Global CSS with design tokens (dark theme, 8px grid, Inter font stack), shared form components, button variants (primary, secondary, ghost, loading), and all Home/Lobby screen styles. Accessible focus rings, skip-link, sr-only utility.
  - `packages/client/src/App.tsx` — Rewired to use `useSocket` + `useRoom` hooks with screen-based rendering (home → lobby).
  - `packages/client/src/main.tsx` — Added `index.css` import.
- **Learnings:**
  - Socket.io client `io()` with no URL argument connects to the current host, which combined with Vite proxy works seamlessly for dev
  - `socket.id` may be undefined briefly after connection — use `socket.id ?? null` for safe access
  - 4-cell code input needs careful event handling: `onChange` for character input, `onKeyDown` for backspace navigation, `onPaste` for distributing pasted text across cells
  - `aria-live="polite"` on the player list `<ul>` with `aria-relevant="additions removals"` lets screen readers announce player join/leave without re-reading the entire list
  - `autoCapitalize="characters"` on mobile inputs helps users enter uppercase room codes without manual Shift
---

## 2026-02-18 - US-009
- Built client results screen with leaderboard display
- Files changed:
  - `packages/client/src/ResultsScreen.tsx` (new) — Results screen component with podium visualization (top 3), full results table (rank, name, score, correct answers, average time), "Spela igen" button (host only), waiting message (non-host), and "Lämna spelet" action.
  - `packages/client/src/useRoom.ts` — Extended `Screen` type to include `"results"`, added `leaderboard` state (`LeaderboardEntry[]`), added `game:finished` listener to transition to results screen, added `playAgain` callback that returns to lobby. Leaderboard state is cleared on leave.
  - `packages/client/src/App.tsx` — Added `ResultsScreen` import and rendering when `screen === "results"`. Results screen check is placed before lobby check in render order.
  - `packages/client/src/index.css` — Added results screen styles: card layout, podium with CSS grid ordering (2nd-1st-3rd visual order), enter animation, responsive table with tabular-nums for numeric alignment, "you" highlight row and badge, and action buttons section.
- **Learnings:**
  - The `LeaderboardEntry` type in shared already contains `player`, `rank`, `correctAnswers`, `totalQuestions`, and `averageTimeMs` — enough for a complete results display without additional server changes
  - CSS `order` property is useful for podium layouts where visual order (2nd-1st-3rd) differs from DOM order (1st-2nd-3rd) while keeping accessible reading order
  - `font-variant-numeric: tabular-nums` ensures numeric columns align properly in the results table
  - `playAgain` returns to lobby screen rather than home — this preserves the room context so the host can start a new round without requiring everyone to rejoin
---