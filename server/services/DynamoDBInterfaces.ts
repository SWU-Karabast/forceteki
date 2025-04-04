export interface IUserDataEntity {
    id: string;
    username: string;
    preferences?: Record<string, any>;
}

// Interface for matchups a win here means the OP wins not opponents wins.
export interface IMatchupStatEntity {
    leaderId: string;
    baseId: string;
    wins: number;
    losses: number;
    draws: number;
}

// Updated stats interface
export interface IDeckStatsEntity {
    wins: number;
    losses: number;
    draws: number;
    statsByMatchup?: IMatchupStatEntity[];
}

// Define user interface
export interface IUserProfileDataEntity extends IUserDataEntity {
    id: string;
    username: string;
    lastLogin: string;
    createdAt: string;
    usernameLastUpdatedAt?: string; // When username was set/changed
    preferences?: Record<string, any>;
}

export interface ILocalStorageDeckData {
    leader: { id: string };
    base: { id: string };
    name: string;
    favourite: boolean;
    deckLink: string;
    deckLinkID: string;
    source?: string;
}

// Interface for deck data
export interface IDeckDataEntity {
    id: string;
    userId: string;
    deck: {
        leader: { id: string };
        base: { id: string };
        name: string;
        favourite: boolean;
        deckLink: string;
        deckLinkID: string;
        source?: string;
    };
    stats?: IDeckStatsEntity;
}

// Interface for game record
export interface IGameRecordEntity {
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
    timestampStart: string;
    timestampEnd: string;
}