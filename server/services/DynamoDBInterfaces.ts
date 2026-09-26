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

    /**
     * Id of the ReportingDisabled mod action whose one-time notice the user has acknowledged.
     * Stored on the profile (not the action) so it is authoritative across server instances and
     * survives cache refreshes; a re-issued restriction has a new id and so shows the notice again.
     */
    reportingDisabledSeenActionId?: string;

    /** @deprecated Superseded by the ReportingDisabled mod action. Removed by scripts/migrateReportingDisabled.ts. */
    reportingDisabled?: ModerationFieldState;
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

/**
 * Global, runtime-toggleable server settings. Stored as a single item so that moderators can
 * change them without a redeploy of either the client or the server.
 */
export interface IServerSettingsEntity {

    /** When false, no new games may be created, joined or requeued. In-progress games are unaffected. */
    gamesEnabled: boolean;
    maintenanceMessage?: string;
    updatedBy?: string;
    updatedAt?: string;
}

export enum ModActionType {
    Mute = 'Mute',
    Warning = 'Warning',
    Rename = 'Rename',
    ReportingDisabled = 'ReportingDisabled',
}

/**
 * Per-type behaviour for mod actions. This is the single source of truth — validation, GSI indexing,
 * caching and the dashboard UI all derive from it rather than enumerating action types themselves.
 *
 * `tracked` means indexed in the ACTIVE_MODACTION sparse GSI and held in the ModActionService cache.
 * That is distinct from having a duration: Mute is timed, while Rename and ReportingDisabled are
 * indefinite but still tracked. Warning is untracked (paper trail only).
 */
export interface IModActionDefinition {
    tracked: boolean;
    requiresNote: boolean;
    requiresDuration: boolean;

    /** Resolves on its own (expiry or user action) rather than requiring a moderator to cancel it. */
    selfResolving: boolean;
    cancellable: boolean;
}

export const ModActionDefinitions: Record<ModActionType, IModActionDefinition> = {
    [ModActionType.Mute]: {
        tracked: true,
        requiresNote: true,
        requiresDuration: true,
        selfResolving: true,
        cancellable: true,
    },
    [ModActionType.Warning]: {
        tracked: false,
        requiresNote: true,
        requiresDuration: false,
        selfResolving: false,
        cancellable: false,
    },
    [ModActionType.Rename]: {
        tracked: true,
        requiresNote: false,
        requiresDuration: false,
        selfResolving: true,
        cancellable: false,
    },
    [ModActionType.ReportingDisabled]: {
        tracked: true,
        requiresNote: true,
        requiresDuration: false,
        selfResolving: false,
        cancellable: true,
    },
};

export const isTrackedModAction = (actionType: ModActionType): boolean =>
    ModActionDefinitions[actionType]?.tracked === true;

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
}

export interface IActiveModActionCacheEntry {
    id: string;
    actionType: ModActionType;
    durationDays?: number;
    startedAt?: string;
    expiresAt?: string;
    modActionId: string;
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