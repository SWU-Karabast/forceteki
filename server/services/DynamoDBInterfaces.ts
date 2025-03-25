export interface IUserData {
    id: string;
    username: string;
    preferences?: Record<string, any>;
    playerId?: string;
}

// Interface for opponent stats
export interface IOpponentStat {
    leaderId: string;
    baseId: string;
    wins: number;
    losses: number;
    draws: number;
}

// Updated stats interface
export interface IDeckStats {
    wins: number;
    losses: number;
    draws: number;
    opponentStats?: IOpponentStat[];
}

// Define user interface
export interface IUserProfileData extends IUserData {
    id: string;
    username: string;
    lastLogin: string;
    createdAt: string;
    username_set_at?: string; // When username was set/changed
    preferences?: Record<string, any>;
}

export interface ILocalStorageDeckData {
    leader: { id: string };
    base: { id: string };
    name: string;
    favourite: boolean;
    deckLink: string;
    deckLID: string;
    source?: string;
}

// Interface for deck data
export interface IDeckData {
    id: string;
    userId: string;
    deck: {
        leader: { id: string };
        base: { id: string };
        name: string;
        favourite: boolean;
        deckLink: string;
        deckLID: string;
        source?: string;
    };
    stats?: IDeckStats;
}

// Interface for game record
export interface IGameRecord {
    id: string;
    player1: string;
    player2: string;
    firstTurn: string;
    winner: string;
    winnerBaseHealthRemaining: number;
    player1LeaderId: string;
    player1BaseId: string;
    player2LeaderId: string;
    player2BaseId: string;
    timestamp?: string;
}