/**
 * The commands a player's client may send on the `lobby` socket event: each names the `Lobby` method that handles it.
 * Every other method on `Lobby` is server-internal, and a command not listed here is refused.
 */
export enum LobbyCommand {
    ConcedeBo3 = 'concedeBo3',
    MuteChat = 'muteChat',
    ProceedToNextBo3Game = 'proceedToNextBo3Game',
    Rematch = 'rematch',
    ReportScreenResolution = 'reportScreenResolution',
    RequestRematch = 'requestRematch',
    RetransmitGameMessages = 'retransmitGameMessages',
    SendChatMessage = 'sendChatMessage',
    SetReadyStatus = 'setReadyStatus',
    StartGameAsync = 'startGameAsync',
    SubmitReport = 'submitReport',
    TypingState = 'typingState',
    UpdateDeck = 'updateDeck',
    UpdateSetting = 'updateSetting',
}

/**
 * The commands a player's client may send on the `game` socket event: each names the `Game` method that handles it,
 * including the commands the engine puts on prompt buttons. Every other method on `Game` is server-internal, and a
 * command not listed here is refused.
 */
export enum GameCommand {
    CardClicked = 'cardClicked',
    Chat = 'chat',
    Concede = 'concede',
    MenuButton = 'menuButton',
    PerCardMenuButton = 'perCardMenuButton',
    RollbackToSnapshot = 'rollbackToSnapshot',
    StatefulPromptResults = 'statefulPromptResults',
    ToggleOptionSetting = 'toggleOptionSetting',
}

/** The lobby commands a spectator's client may send. A spectator has no `game` event, and any other command is ignored. */
export const spectatorCommands: ReadonlySet<string> = new Set<string>([LobbyCommand.RetransmitGameMessages]);
