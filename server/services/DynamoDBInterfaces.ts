export interface IUserData {
    id: string;
    username: string;
    preferences?: Record<string, any>;
    playerId?: string;
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
    stats?: {
        wins: number;
        losses: number;
        draws: number;
    };
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