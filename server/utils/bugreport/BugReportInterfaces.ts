
export interface IBugReportCardState {
    card: string;
    damage?: number;
    upgrades?: string[];
    deployed?: boolean;
}

export interface IPlayerBugReportState {
    hand?: string[];
    groundArena?: (string | IBugReportCardState)[];
    spaceArena?: (string | IBugReportCardState)[];
    discard?: string[];
    resources?: number;
    base?: string | IBugReportCardState;
    leader?: string | IBugReportCardState;
    deck?: string[];
    hasInitiative?: boolean;
}

export interface IBugReportGameState {
    phase: string;
    player1: IPlayerBugReportState;
    player2: IPlayerBugReportState;
}

export interface IBugReport {
    description: string;
    gameState: IBugReportGameState;
    reporter: {
        id: string;
        username: string;
    };
    lobbyId: string;
    timestamp: string;
    gameId?: string;
}

export interface IBugReportResponse {
    success: boolean;
    message: string;
}