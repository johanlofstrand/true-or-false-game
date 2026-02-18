import { useCallback, useState } from "react";
import type { GameSettings, Room, Language } from "@facit/shared";
import { t } from "./i18n";

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS = [10, 15, 20, 30];

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onLeave: () => void;
  language: Language;
  aiAvailable: boolean;
}

export function LobbyScreen({
  room,
  playerId,
  isHost,
  onStartGame,
  onUpdateSettings,
  onLeave,
  language,
  aiAvailable,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { settings } = room;

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  }, [room.code]);

  const handleLeave = useCallback(() => {
    if (confirmLeave) {
      onLeave();
      setConfirmLeave(false);
    } else {
      setConfirmLeave(true);
    }
  }, [confirmLeave, onLeave]);

  const cancelLeave = useCallback(() => {
    setConfirmLeave(false);
  }, []);

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1 className="lobby-header__title">{t(language, "lobby.title")}</h1>
          <p className="lobby-header__subtitle">
            {t(language, "lobby.waitingForPlayers")}
          </p>
        </div>

        {/* Room code */}
        <section className="room-code-section" aria-label={t(language, "lobby.roomCodeSection")}>
          <p className="room-code-label">{t(language, "lobby.roomCodeLabel")}</p>
          <div className="room-code-display">
            <output className="room-code-value" aria-label={t(language, "lobby.roomCodeLabel")}>
              {room.code}
            </output>
            <button
              className={`room-code-copy-btn${copied ? " room-code-copy-btn--copied" : ""}`}
              onClick={copyCode}
              type="button"
              aria-label={copied ? t(language, "lobby.copied") : t(language, "lobby.copyCode")}
            >
              {copied ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10l4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="6"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 14V4a2 2 0 012-2h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="sr-only" aria-live="polite">
              {t(language, "lobby.roomCodeCopied")}
            </p>
          )}
        </section>

        {/* Player list */}
        <section className="player-list-section" aria-label={t(language, "lobby.playersSection")}>
          <h2 className="player-list-heading">
            {t(language, "lobby.playersHeading")} ({room.players.length})
          </h2>
          <ul className="player-list" aria-live="polite" aria-relevant="additions removals">
            {room.players.map((player) => (
              <li
                key={player.id}
                className="player-item"
              >
                <span className="player-item__indicator" aria-hidden="true" />
                <span className="player-item__name">
                  {player.name}
                  {player.id === playerId && ` (${t(language, "lobby.you")})`}
                </span>
                {player.id === room.hostId && (
                  <span className="player-item__badge">{t(language, "lobby.host")}</span>
                )}
              </li>
            ))}
          </ul>
          {room.players.length === 1 && (
            <p className="player-list-empty">
              {t(language, "lobby.shareCode")}
            </p>
          )}
        </section>

        {/* Settings */}
        {isHost ? (
          <section className="lobby-settings" aria-label={t(language, "settings.title")}>
            <h2 className="lobby-settings__heading">{t(language, "settings.title")}</h2>

            <fieldset className="settings-field">
              <legend className="settings-field__label">
                {t(language, "settings.questionCount")}
              </legend>
              <div className="settings-options">
                {QUESTION_COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`settings-option${settings.questionCount === n ? " settings-option--active" : ""}`}
                    aria-pressed={settings.questionCount === n}
                    onClick={() => onUpdateSettings({ questionCount: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="settings-field">
              <legend className="settings-field__label">
                {t(language, "settings.timePerQuestion")}
              </legend>
              <div className="settings-options">
                {TIME_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`settings-option${settings.timePerQuestion === n ? " settings-option--active" : ""}`}
                    aria-pressed={settings.timePerQuestion === n}
                    onClick={() => onUpdateSettings({ timePerQuestion: n })}
                  >
                    {n}{t(language, "settings.seconds")}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="settings-toggle-row">
              <span className="settings-toggle-row__label" id="toggle-hints-label">
                {t(language, "settings.hints")}
              </span>
              <div className="settings-toggle" role="group" aria-labelledby="toggle-hints-label">
                <button
                  type="button"
                  className={`settings-toggle__btn${!settings.hintsEnabled ? " settings-toggle__btn--active" : ""}`}
                  aria-pressed={!settings.hintsEnabled}
                  onClick={() => onUpdateSettings({ hintsEnabled: false })}
                >
                  {t(language, "settings.off")}
                </button>
                <button
                  type="button"
                  className={`settings-toggle__btn${settings.hintsEnabled ? " settings-toggle__btn--active" : ""}`}
                  aria-pressed={settings.hintsEnabled}
                  onClick={() => onUpdateSettings({ hintsEnabled: true })}
                >
                  {t(language, "settings.on")}
                </button>
              </div>
            </div>

            <div className="settings-toggle-row">
              <span className="settings-toggle-row__label" id="toggle-ai-label">
                {t(language, "settings.aiQuestions")}
                {!aiAvailable && (
                  <span className="settings-toggle-row__note">
                    {t(language, "settings.aiNotConfigured")}
                  </span>
                )}
              </span>
              <div
                className="settings-toggle"
                role="group"
                aria-labelledby="toggle-ai-label"
                aria-disabled={!aiAvailable}
              >
                <button
                  type="button"
                  className={`settings-toggle__btn${!settings.useAI ? " settings-toggle__btn--active" : ""}`}
                  aria-pressed={!settings.useAI}
                  disabled={!aiAvailable}
                  onClick={() => onUpdateSettings({ useAI: false })}
                >
                  {t(language, "settings.off")}
                </button>
                <button
                  type="button"
                  className={`settings-toggle__btn${settings.useAI ? " settings-toggle__btn--active" : ""}`}
                  aria-pressed={settings.useAI}
                  disabled={!aiAvailable}
                  onClick={() => onUpdateSettings({ useAI: true })}
                >
                  {t(language, "settings.on")}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="lobby-settings lobby-settings--readonly" aria-label={t(language, "settings.title")}>
            <h2 className="lobby-settings__heading">{t(language, "settings.title")}</h2>
            <p className="lobby-settings__summary" aria-live="polite">
              {settings.questionCount} {t(language, "settings.questionCount").toLowerCase()}
              <span aria-hidden="true"> &middot; </span>
              {settings.timePerQuestion}{t(language, "settings.seconds")}
              <span aria-hidden="true"> &middot; </span>
              {t(language, "settings.hints")}{" "}
              <span className={`lobby-settings__badge${settings.hintsEnabled ? " lobby-settings__badge--on" : " lobby-settings__badge--off"}`}>
                {settings.hintsEnabled ? t(language, "settings.on") : t(language, "settings.off")}
              </span>
              <span aria-hidden="true"> &middot; </span>
              AI{" "}
              <span className={`lobby-settings__badge${settings.useAI ? " lobby-settings__badge--on" : " lobby-settings__badge--off"}`}>
                {settings.useAI ? t(language, "settings.on") : t(language, "settings.off")}
              </span>
            </p>
          </section>
        )}

        {/* Actions */}
        <div className="lobby-actions" role="region" aria-label={t(language, "lobby.controls")}>
          {isHost ? (
            <button
              type="button"
              className="btn btn--primary"
              disabled={room.players.length < 2}
              onClick={onStartGame}
            >
              {t(language, "lobby.startGame")}
            </button>
          ) : (
            <p className="waiting-message" aria-live="polite">
              {t(language, "lobby.waitingForHost")}
              <span className="waiting-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}

          {confirmLeave ? (
            <div className="leave-confirm">
              <span className="leave-confirm__text">{t(language, "lobby.confirmLeave")}</span>
              <button
                type="button"
                className="btn--ghost"
                onClick={cancelLeave}
                autoFocus
              >
                {t(language, "lobby.cancel")}
              </button>
              <button
                type="button"
                className="btn--ghost btn--ghost-danger"
                onClick={handleLeave}
              >
                {t(language, "lobby.leave")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn--ghost"
              onClick={handleLeave}
            >
              {t(language, "lobby.leaveLobby")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
