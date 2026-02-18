import { useSocket } from "./useSocket";
import { useRoom } from "./useRoom";
import { useLanguage, LanguageProvider } from "./LanguageContext";
import { HomeScreen } from "./HomeScreen";
import { LobbyScreen } from "./LobbyScreen";
import { GameScreen } from "./GameScreen";
import { ResultsScreen } from "./ResultsScreen";
import { t } from "./i18n";
import { useEffect, useState } from "react";

function AppInner() {
  const socket = useSocket();
  const { language, setLanguage } = useLanguage();
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    fetch("/config")
      .then((r) => r.json())
      .then((data) => setAiAvailable(Boolean(data.aiAvailable)))
      .catch(() => setAiAvailable(false));
  }, [socket]);
  const {
    screen,
    room,
    playerId,
    error,
    loading,
    isHost,
    leaderboard,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateSettings,
    playAgain,
    clearError,
  } = useRoom(socket, language);

  // When joining a room, adopt the room's language
  const roomLanguage = room?.settings.language;
  useEffect(() => {
    if (roomLanguage && roomLanguage !== language) {
      setLanguage(roomLanguage);
    }
  }, [roomLanguage, language, setLanguage]);

  if (!socket) {
    return (
      <div className="home-screen">
        <p className="form-label">{t(language, "app.connecting")}</p>
      </div>
    );
  }

  if (screen === "results" && playerId) {
    return (
      <ResultsScreen
        leaderboard={leaderboard}
        playerId={playerId}
        isHost={isHost}
        onPlayAgain={playAgain}
        onLeave={leaveRoom}
        language={language}
      />
    );
  }

  if (screen === "game" && room && playerId) {
    return (
      <GameScreen
        socket={socket}
        room={room}
        playerId={playerId}
        language={language}
      />
    );
  }

  if (screen === "lobby" && room && playerId) {
    return (
      <LobbyScreen
        room={room}
        playerId={playerId}
        isHost={isHost}
        onStartGame={startGame}
        onUpdateSettings={updateSettings}
        onLeave={leaveRoom}
        language={language}
        aiAvailable={aiAvailable}
      />
    );
  }

  return (
    <HomeScreen
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      error={error}
      loading={loading}
      onClearError={clearError}
      language={language}
      onLanguageChange={setLanguage}
    />
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
