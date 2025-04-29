export interface IUserDataEntity {
    id: string;
    username: string;
    preferences?: UserPreferences;
    welcomeMessage: boolean;
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


export interface UserPreferences {
    cardback?: string;
    isAdmin?: boolean;
}

// Define user interface
export interface IUserProfileDataEntity extends IUserDataEntity {
    id: string;
    username: string;
    lastLogin: string;
    createdAt: string;
    usernameLastUpdatedAt?: string; // When username was set/changed
    preferences?: UserPreferences;
}

export interface ILocalStorageDeckData {
    leader: { id: string };
    base: { id: string };
    name: string;
    favourite: boolean;
    deckLink: string;
    deckLinkID?: string;
    deckID?: string; // we need this for backwards compatibility
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
    firstInitiativePlayer: string;
    winner: string;
    winnerBaseHealthRemaining: number;
    player1LeaderId: string;
    player1BaseId: string;
    player2LeaderId: string;
    player2BaseId: string;
    timestampStart: Date;
    timestampEnd: Date;
}