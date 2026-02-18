import { useSocket } from "./useSocket";
import { useRoom } from "./useRoom";
import { HomeScreen } from "./HomeScreen";
import { LobbyScreen } from "./LobbyScreen";
import { GameScreen } from "./GameScreen";
import { ResultsScreen } from "./ResultsScreen";

export function App() {
  const socket = useSocket();
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
    playAgain,
    clearError,
  } = useRoom(socket);

  if (!socket) {
    return (
      <div className="home-screen">
        <p className="form-label">Ansluter...</p>
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
      />
    );
  }

  if (screen === "game" && room && playerId) {
    return (
      <GameScreen
        socket={socket}
        room={room}
        playerId={playerId}
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
        onLeave={leaveRoom}
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
    />
  );
}
