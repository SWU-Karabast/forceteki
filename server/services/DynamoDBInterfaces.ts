export enum ModerationType {
    Mute = 'Mute',
    Ban = 'Ban',
}

export enum ModerationFieldState {
    Enabled = 'enabled',
    EnabledAndSeen = 'enabledAndSeen',
}

export enum CardImageLocale {
    English = 'en',
    French = 'fr',
    German = 'de',
    Spanish = 'es',
    Italian = 'it',
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
    moderation?: IModerationAction;
    undoPopupSeenDate?: string;
    timerPopupSeenDate?: string;
}

/**
 * Client-facing representation of an active ReportingDisabled restriction.
 * Presence (non-null) means reporting is disabled; `hasSeen` drives the one-time notification popup.
 */
export interface IReportingDisabledState {
    hasSeen: boolean;
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

export enum TimerVisibility {
    Standard = 'standard',
    HideTurnTimer = 'hideTurnTimer',
    HideAll = 'hideAll',
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
        cardLanguage?: CardImageLocale;
        timerVisibility?: TimerVisibility;

        // Prompt-reduction settings: auto-resolve prompts that have only one sensible outcome.
        // Grouped so future automations (e.g. auto-select opponent for indirect damage,
        // auto-select the enemy/own base for damage/heal) can live alongside singleTarget.
        autoResolve?: {
            singleTarget?: boolean;
        };
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
    stats?: IDeckStatsEntity;
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
    ReportingDisabled = 'ReportingDisabled',
}

/**
 * Action types that are tracked as "active" — indexed in the ACTIVE_MODACTION sparse GSI and held in
 * the in-memory ModActionService cache. This is distinct from having a duration: Mute is timed, while
 * Rename and ReportingDisabled are indefinite but still tracked. Warning is untracked (paper trail).
 */
export type TrackedModActionType = ModActionType.Mute | ModActionType.Rename | ModActionType.ReportingDisabled;

export interface IModActionEntity {
    id: string;
    playerId: string;
    actionType: ModActionType;
    durationDays?: number;
    note?: string;
    moderatorId: string;
    moderatorUsername: string;
    createdAt: string;
    startedAt?: string;
    expiresAt?: string;
    cancelledAt?: string;
    cancelledById?: string;
    cancelledByUsername?: string;
    // Notification-style flag, currently only meaningful for ReportingDisabled: whether the user has
    // seen the one-time popup informing them of the restriction.
    hasSeen?: boolean;
}

export interface IActiveModActionCacheEntry {
    id: string;
    actionType: ModActionType;
    durationDays?: number;
    startedAt?: string;
    expiresAt?: string;
    modActionId: string;
    hasSeen?: boolean;
}

export enum UsernameChangeSource {
    AccountCreation = 'AccountCreation', // new account creation (previousUsername = null)
    Migration = 'Migration', // backfill seed for pre-existing accounts (previousUsername = null)
    UserInitiated = 'UserInitiated',
    ForcedRename = 'ForcedRename', // result of a Rename mod action
}

export interface IUsernameChangeEntity {
    id: string;
    playerId: string;
    previousUsername: string | null; // null only for Initial
    newUsername: string;
    source: UsernameChangeSource;
    relatedModActionId?: string; // set only when source === ForcedRename
    createdAt: string;
}