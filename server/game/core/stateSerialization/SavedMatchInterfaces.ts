import type { GameMode } from '../../../GameMode';
import type { ISwuDbFormatDecklist } from '../../../utils/deck/DeckInterfaces';
import type { UndoMode } from '../snapshot/SnapshotManager';

/**
 * Version of the {@link ISavedMatch} document shape. Bump this whenever a published field's meaning or
 * shape changes; a purely additive field does not require a bump.
 */
export const SAVED_MATCH_FORMAT_VERSION = 1;

/**
 * Thrown by the save-format writer when it cannot trust the coordinates it is about to publish, rather
 * than degrading. Distinct from {@link Contract.fail}'s plain `Error` so that callers (and tests) can
 * distinguish "the save is untrustworthy" from any other engine assertion failure.
 */
export class SaveIntegrityError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'SaveIntegrityError';
    }
}

export interface ISaveTrigger {
    kind: 'immediate' | 'deferred';
    requestedAtActionNumber: number;
    requestedAtPhase: string;
}

export interface ISaveOptions {
    saveTrigger?: Partial<ISaveTrigger>;
    savedAt?: string;

    /** Diagnostic-only; no `server/` code currently reads `card-data-version.txt` at runtime. */
    cardDataVersion?: string | null;
}

/**
 * The zones a {@link ISavedCardRef} can point into: the per-player array positions (named after this
 * document's own field names, not the engine's {@link ZoneName} values, since e.g. the document's
 * `resources` array is named differently from the engine's singular `resource` zone) plus the two
 * singleton positions.
 */
export type SavedArrayRefZone = 'hand' | 'deck' | 'discard' | 'resources' | 'groundArena' | 'spaceArena' | 'outsideTheGame';
export type SavedRefZone = SavedArrayRefZone | 'leader' | 'base';

/**
 * A resolvable coordinate to a card position within this document. `zone` and `ordinal` are nullable
 * **together**: both null means "this card is not in any emitted position" (reachable only for a
 * zone-less card that is still an active effect's source); nothing else may be null. `parent` is present
 * only for a card nested under another card's `upgrades`/`capturedCards` list.
 */
export interface ISavedCardRef {
    card: string;
    controllerSeat: string;
    zone: SavedRefZone | null;
    ordinal: number | null;
    parent?: {
        zone: SavedRefZone;
        ordinal: number;
        list: 'upgrades' | 'capturedCards';
    };
}

export interface ISavedAttachedCard {
    card: string;
    ownerSeat: string;
}

/**
 * The two shapes an ability limit's use count can take, keyed on which {@link AbilityLimit} subclass
 * produced it. `currentUserSeat` is forward-compatible and always `null` today: `PerGameAbilityLimit`'s
 * `currentUser` field is undecorated with no writer under `server/`.
 */
export interface ISavedPlayerKeyedAbilityLimit {
    abilityIdentifier: string;
    usesByPlayer: Record<string, number>;
}

export interface ISavedPerGameAbilityLimit {
    abilityIdentifier: string;
    useCount: number;
    currentUserSeat: string | null;
}

export type ISavedAbilityLimit = ISavedPlayerKeyedAbilityLimit | ISavedPerGameAbilityLimit;

export interface ISavedArenaEntry {
    card: string;
    damage: number;
    exhausted: boolean;

    /** Present only when `card.owner !== card.controller`, e.g. after `TakeControlOfUnitSystem`. */
    ownerSeat?: string;
    upgrades: ISavedAttachedCard[];
    capturedCards: ISavedAttachedCard[];
    limits: ISavedAbilityLimit[];
}

export interface ISavedBaseEntry {
    card: string;
    damage: number;
    upgrades: ISavedAttachedCard[];
    capturedCards: ISavedAttachedCard[];
    limits: ISavedAbilityLimit[];
}

/**
 * One uniform shape across `LeaderUnitCard` and `DoubleSidedLeaderCard`, so a consumer inherits a single
 * shape per position rather than a union. For a `DoubleSidedLeaderCard` (no `WithDamage`, not deployable
 * as a unit), the writer emits a fixed sub-shape: `deployed: false`, `epicDeployUsed: false`, `damage: 0`,
 * `upgrades: []`, `capturedCards: []`.
 */
export interface ISavedLeaderEntry {
    card: string;
    deployed: boolean;
    exhausted: boolean;
    damage: number;
    epicDeployUsed: boolean;

    /** Present only for a `DoubleSidedLeaderCard`. */
    onStartingSide?: boolean;
    upgrades: ISavedAttachedCard[];
    capturedCards: ISavedAttachedCard[];
    limits: ISavedAbilityLimit[];
}

export interface ISavedResourceEntry {
    card: string;
    exhausted: boolean;

    /** Present only when `card.owner !== card.controller`, e.g. after `TakeControlOfResourceSystem`. */
    ownerSeat?: string;
}

export interface ISavedPlayer {
    seat: string;
    name: string;
    decklist: ISwuDbFormatDecklist;
    base: ISavedBaseEntry;
    leader: ISavedLeaderEntry;
    hand: string[];
    deck: string[];
    discard: string[];
    resources: ISavedResourceEntry[];
    groundArena: ISavedArenaEntry[];
    spaceArena: ISavedArenaEntry[];
    outsideTheGame: string[];
    hasTheForce: boolean;
    creditTokens: number;
}

/**
 * The category of state that `v1` cannot represent directly and instead records as an enumerated,
 * described fact rather than dropping silently. `engineOnlyFacts: []` means the saved position carries no
 * fact the `v1` format cannot represent: no non-re-derivable ongoing effect, no dropped gained-ability use
 * count, no pilot-deployed leader, and no watcher history.
 */
export type EngineOnlyFactCategory = 'lastingEffect' | 'gainedAbility' | 'delayedEffect' | 'watcherEntry' | 'pilotLeader';

export interface IEngineOnlyFact {
    category: EngineOnlyFactCategory;
    source: ISavedCardRef | null;

    /**
     * A single card or player target resolves to `ISavedCardRef` or a seat string (e.g. `"p1"`)
     * respectively. For `lastingEffect`/`delayedEffect` facts with more than one target -- not
     * one-fact-per-target the way `gainedAbility` is -- this is instead a human-readable,
     * comma-joined list of target display names, bypassing seat/ref resolution entirely. A consumer
     * cannot distinguish a seat string from a joined name list by shape alone; it must switch on
     * `category` and known single- vs multi-target semantics to tell them apart.
     */
    target: ISavedCardRef | string | null;
    duration: string | null;

    /** Never null: where the engine's own `describeEffect` yields `undefined`, this coalesces to a deterministic `` `${category} from ${sourceInternalName}` ``. */
    description: string;
}

/**
 * A scrubbed chat message: `date` is an ISO string (never a live `Date`), and `message` has had every
 * object carrying a `name` (a `getShortSummary()` shape, or the `{ name, id, type: 'playerChat' }` player
 * marker) replaced with that `name` string, recursively. The result contains neither a `uuid` nor a
 * player/user id.
 */
export type IScrubbedMessageValue = string | number | IScrubbedMessageValue[] | { alert: { type: string; message: IScrubbedMessageValue } };

export interface ISavedChatMessage {
    date: string;
    message: IScrubbedMessageValue;
}

/**
 * A2's per-watcher entry encoding is out of scope for this unit (`TODO(P2-A2)`): `stateWatchers` always
 * publishes as an empty tuple here, and the state a non-empty watcher holds is instead recorded as a
 * `watcherEntry` {@link IEngineOnlyFact}.
 */
export type ISavedStateWatchers = readonly [];

/**
 * The `v1` save-format document produced by `MatchSerializer.save`. Every field is non-optional except
 * those explicitly marked `?`, so a consumer inherits one shape per position and `JSON.stringify` can
 * never silently drop a member. No member is ever emitted as `undefined`; no uuid or runtime counter
 * (`playEventId`, `inPlayId`, `attackId`, `eventId`) appears anywhere in the document; no `Date` object
 * appears anywhere (dates are ISO strings).
 */
export interface ISavedMatch {
    formatVersion: typeof SAVED_MATCH_FORMAT_VERSION;

    /** Diagnostic-only; no runtime source exists yet (`Feasibility` in the owning plan). */
    cardDataVersion: string | null;
    savedAt: string;
    saveTrigger: ISaveTrigger;
    gameId: string;
    settings: {
        gameMode: GameMode;
        undoMode: UndoMode;
        useActionTimer: boolean;
    };
    rng: {
        seed: string;
        state: unknown;
    };
    game: {
        roundNumber: number;
        phase: string | null;

        /** The owning player's seat (`"p1"`/`"p2"`), or null. */
        initiativePlayer: string | null;

        /** The owning player's seat (`"p1"`/`"p2"`), or null. */
        actionPhaseActivePlayer: string | null;
        isInitiativeClaimed: boolean;
        actionNumber: number;
        prevActionPhasePlayerPassed: boolean | null;
    };
    players: ISavedPlayer[];
    stateWatchers: ISavedStateWatchers;
    engineOnlyFacts: IEngineOnlyFact[];
    chat: ISavedChatMessage[];
    timers: Record<string, { mainRemainingSeconds: number }>;
}
