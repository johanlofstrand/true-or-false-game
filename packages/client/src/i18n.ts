import type { Language } from "@facit/shared";

const translations: Record<Language, Record<string, string>> = {
  sv: {
    // App
    "app.connecting": "Ansluter...",

    // HomeScreen
    "home.title": "Facit",
    "home.subtitle": "Sant eller Falskt",
    "home.nameLabel": "Ditt namn",
    "home.namePlaceholder": "Ange ditt namn",
    "home.createRoom": "Skapa rum",
    "home.or": "eller",
    "home.codeLabel": "Rumskod",
    "home.joinRoom": "Gå med i rum",
    "home.codeCharLabel": "Tecken {n} av 4",
    "home.createRoomAriaLabel": "Skapa ett rum",

    // LobbyScreen
    "lobby.title": "Lobby",
    "lobby.waitingForPlayers": "Väntar på spelare...",
    "lobby.roomCodeLabel": "Rumskod",
    "lobby.roomCodeSection": "Rumskod att dela",
    "lobby.copied": "Kopierat!",
    "lobby.copyCode": "Kopiera rumskod",
    "lobby.roomCodeCopied": "Rumskod kopierad",
    "lobby.playersHeading": "Spelare",
    "lobby.playersSection": "Spelare i rummet",
    "lobby.you": "du",
    "lobby.host": "Värd",
    "lobby.shareCode": "Dela rumskoden för att bjuda in spelare",
    "lobby.startGame": "Starta spelet",
    "lobby.waitingForHost": "Väntar på att värden startar",
    "lobby.controls": "Spelkontroller",
    "lobby.confirmLeave": "Lämna lobby?",
    "lobby.cancel": "Avbryt",
    "lobby.leave": "Lämna",
    "lobby.leaveLobby": "Lämna lobby",

    // GameScreen
    "game.screen": "Spelskärm",
    "game.question": "Fråga",
    "game.questionOf": "Fråga {current} av {total}",
    "game.secondsLeft": "{n} sekunder kvar",
    "game.timeLeft": "Tid kvar",
    "game.questionArea": "Fråga",
    "game.statement": "Påstående",
    "game.false": "FALSKT",
    "game.true": "SANT",
    "game.correct": "Rätt!",
    "game.incorrect": "Fel!",
    "game.correctAnswer": "Rätt svar: {answer}",
    "game.answerTrue": "Sant",
    "game.answerFalse": "Falskt",
    "game.answerOptions": "Svarsalternativ",
    "game.falseBtn": "Falskt",
    "game.trueBtn": "Sant",
    "game.swipeHint": "Svep kortet eller tryck på en knapp för att svara",
    "game.preparing": "Förbereder frågor...",
    "game.standingsAfter": "Ställning efter fråga {n}",
    "game.points": "p",
    "game.nextSoon": "Nästa fråga snart...",

    // ResultsScreen
    "results.title": "Resultat",
    "results.youWon": "Grattis, du vann!",
    "results.yourRank": "Du kom på plats {rank}",
    "results.leaderboard": "Resultattavla",
    "results.top3": "Topp 3",
    "results.rank": "Plats {rank}",
    "results.fullResults": "Fullständiga resultat",
    "results.colRank": "#",
    "results.colPlayer": "Spelare",
    "results.colScore": "Poäng",
    "results.colCorrect": "Rätt",
    "results.colAvgTime": "Snitt",
    "results.actions": "Åtgärder",
    "results.playAgain": "Spela igen",
    "results.waitingForHost": "Väntar på att värden startar nytt spel",
    "results.leaveGame": "Lämna spelet",

    // HintDisplay
    "hints.level": "Hint {n}",
    "hints.multiplier": "Poängmultiplikator: {pct}%",
    "hints.loading": "Laddar...",
    "hints.showHint": "Visa ledtråd",
    "hints.showNextHint": "Visa nästa ledtråd",
    "hints.noMore": "Inga fler ledtrådar",
    "hints.section": "Ledtrådar",

    // Errors (useRoom)
    "error.roomNotFound": "Rummet hittades inte. Kontrollera koden.",
    "error.gameAlreadyStarted": "Det spelet har redan börjat.",
    "error.roomFull": "Rummet är fullt.",
  },

  en: {
    // App
    "app.connecting": "Connecting...",

    // HomeScreen
    "home.title": "Facit",
    "home.subtitle": "True or False",
    "home.nameLabel": "Your name",
    "home.namePlaceholder": "Enter your name",
    "home.createRoom": "Create room",
    "home.or": "or",
    "home.codeLabel": "Room code",
    "home.joinRoom": "Join room",
    "home.codeCharLabel": "Character {n} of 4",
    "home.createRoomAriaLabel": "Create a room",

    // LobbyScreen
    "lobby.title": "Lobby",
    "lobby.waitingForPlayers": "Waiting for players...",
    "lobby.roomCodeLabel": "Room code",
    "lobby.roomCodeSection": "Room code to share",
    "lobby.copied": "Copied!",
    "lobby.copyCode": "Copy room code",
    "lobby.roomCodeCopied": "Room code copied",
    "lobby.playersHeading": "Players",
    "lobby.playersSection": "Players in room",
    "lobby.you": "you",
    "lobby.host": "Host",
    "lobby.shareCode": "Share the room code to invite players",
    "lobby.startGame": "Start game",
    "lobby.waitingForHost": "Waiting for the host to start",
    "lobby.controls": "Game controls",
    "lobby.confirmLeave": "Leave lobby?",
    "lobby.cancel": "Cancel",
    "lobby.leave": "Leave",
    "lobby.leaveLobby": "Leave lobby",

    // GameScreen
    "game.screen": "Game screen",
    "game.question": "Question",
    "game.questionOf": "Question {current} of {total}",
    "game.secondsLeft": "{n} seconds left",
    "game.timeLeft": "Time left",
    "game.questionArea": "Question",
    "game.statement": "Statement",
    "game.false": "FALSE",
    "game.true": "TRUE",
    "game.correct": "Correct!",
    "game.incorrect": "Wrong!",
    "game.correctAnswer": "Correct answer: {answer}",
    "game.answerTrue": "True",
    "game.answerFalse": "False",
    "game.answerOptions": "Answer options",
    "game.falseBtn": "False",
    "game.trueBtn": "True",
    "game.swipeHint": "Swipe the card or press a button to answer",
    "game.preparing": "Preparing questions...",
    "game.standingsAfter": "Standings after question {n}",
    "game.points": "pts",
    "game.nextSoon": "Next question soon...",

    // ResultsScreen
    "results.title": "Results",
    "results.youWon": "Congratulations, you won!",
    "results.yourRank": "You placed {rank}",
    "results.leaderboard": "Leaderboard",
    "results.top3": "Top 3",
    "results.rank": "Place {rank}",
    "results.fullResults": "Full results",
    "results.colRank": "#",
    "results.colPlayer": "Player",
    "results.colScore": "Score",
    "results.colCorrect": "Correct",
    "results.colAvgTime": "Avg",
    "results.actions": "Actions",
    "results.playAgain": "Play again",
    "results.waitingForHost": "Waiting for the host to start a new game",
    "results.leaveGame": "Leave game",

    // HintDisplay
    "hints.level": "Hint {n}",
    "hints.multiplier": "Score multiplier: {pct}%",
    "hints.loading": "Loading...",
    "hints.showHint": "Show hint",
    "hints.showNextHint": "Show next hint",
    "hints.noMore": "No more hints",
    "hints.section": "Hints",

    // Errors (useRoom)
    "error.roomNotFound": "Room not found. Check the code.",
    "error.gameAlreadyStarted": "That game has already started.",
    "error.roomFull": "The room is full.",
  },
};

/**
 * Translate a key to the given language.
 * Supports simple interpolation: {key} in the string is replaced by params[key].
 */
export function t(
  lang: Language,
  key: string,
  params?: Record<string, string | number>,
): string {
  const str = translations[lang][key] ?? translations.sv[key] ?? key;
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`,
  );
}
