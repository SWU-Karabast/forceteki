export enum ModerationType {
    Mute = 'Mute',
    Ban = 'Ban',
}

export enum ModerationFieldState {
    Enabled = 'enabled',
    EnabledAndSeen = 'enabledAndSeen',
}

export interface IModerationAction {
    daysRemaining: number;
    endDate?: string;
    hasSeen?: boolean;
    moderationType?: ModerationType;
}

export interface IUserDataEntity {
    id: string;
    username: string;
    preferences?: IUserPreferences;
    swuStatsRefreshToken?: string;
    swubaseRefreshToken?: string;
    showWelcomeMessage: boolean;
    needsUsernameChange?: boolean;
    mustRequestUsernameChange?: ModerationFieldState;
    reportingDisabled?: ModerationFieldState;
    moderation?: IModerationAction;
    undoPopupSeenDate?: string;
}

export interface IFeMatchupStatEntity extends IMatchupStatEntity {
    leaderMelee: string;
    baseMelee: string;
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


export interface IUserPreferences {
    sound?: {
        muteAllSound?: boolean;
        muteCardAndButtonClickSound?: boolean;
        muteYourTurn?: boolean;
        muteChatSound?: boolean;
        muteOpponentFoundSound?: boolean;
    };
    cosmetics?: {
        cardback?: string;
        background?: string;
    };
    gameOptions?: {
        muteChat?: boolean;
    };
}

// Define user interface
export interface IUserProfileDataEntity extends IUserDataEntity {
    id: string;
    username: string;
    lastLogin: string;
    createdAt: string;
    usernameLastUpdatedAt?: string; // When username was set/changed
    preferences?: IUserPreferences;
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

export enum ServerRole {
    Admin = 'admin',
    Developer = 'developer',
    Moderator = 'moderator',
    Contributor = 'contributor'
}

export interface IServerRoleUserEntity {
    id: string;
}

export interface IServerRoleUsersListsEntity {
    admins: IServerRoleUserEntity[];
    developers: IServerRoleUserEntity[];
    moderators: IServerRoleUserEntity[];
    contributors: IServerRoleUserEntity[];
}

export enum ModActionType {
    Mute = 'Mute',
    Warning = 'Warning',
    Rename = 'Rename',
}

export type TimedModActionType = ModActionType.Mute | ModActionType.Rename;

export interface IModActionEntity {
    id: string;
    playerId: string;
    actionType: ModActionType;
    durationDays?: number;
    note?: string;
    moderatorId: string;
    createdAt: string;
    startedAt?: string;
    expiresAt?: string;
    cancelledAt?: string;
    cancelledBy?: string;
}

export interface IActiveModActionCacheEntry {
    id: string;
    actionType: ModActionType;
    durationDays?: number;
    startedAt?: string;
    expiresAt?: string;
    modActionId: string;
}