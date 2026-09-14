import type { GameMode } from '../../../GameMode';
import type { ISwuDbFormatDecklist } from '../../../utils/deck/DeckInterfaces';
import type { CardType, DamageType, StateWatcherName, Trait, ZoneName } from '../Constants';
import type { UndoMode } from '../snapshot/SnapshotManager';

/**
 * Version of the {@link ISavedMatch} document shape. Bump this whenever a published field's meaning or
 * shape changes; a purely additive field does not require a bump.
 *
 * Exemption, in force only while the format has no producer outside tests: a shape change replaces
 * version `1` in place rather than bumping, because no durable document exists to migrate and
 * compatibility scaffolding for a format nobody has written would be dead weight. The exemption ends at
 * the first save produced outside a test (`P2-D`'s server plumbing); from that point the bump rule above
 * applies unconditionally.
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
 * `resources` array is named differently from the engine's singular `resource` zone), the two singleton
 * positions `leader`/`base`, and the two base-zone token positions.
 *
 * `creditTokens` and `forceToken` are *counted* positions rather than emitted array elements: the base
 * zone's Force and Credit tokens are canonically represented by {@link ISavedPlayer.hasTheForce} and
 * {@link ISavedPlayer.creditTokens}, from which a loader rebuilds the objects. They still need
 * coordinates, because a watcher entry can name one of them: `CreateForceTokenSystem` and
 * `CreateCreditTokenSystem` both fire `OnTokensCreated` and `moveTo(ZoneName.Base)`, so
 * `tokensCreatedThisPhase` routinely holds such a referent on an ordinary play path, and without a
 * coordinate that entry would be dropped rather than published. `{ zone: 'forceToken', ordinal: 0 }` is
 * the owner's Force token and exists exactly when `hasTheForce` is true; `{ zone: 'creditTokens',
 * ordinal: k }` is the `k`-th of that player's `creditTokens` Credit tokens, in base-zone order.
 *
 * Credit tokens are interchangeable, so the ordinal is a position rather than an identity; it is dense and
 * stable within one document, which is all a referent needs.
 */
export type SavedArrayRefZone = 'hand' | 'deck' | 'discard' | 'resources' | 'groundArena' | 'spaceArena' | 'outsideTheGame';
export type SavedRefZone = SavedArrayRefZone | 'leader' | 'base' | 'forceToken' | 'creditTokens';

/** The subset of {@link SavedRefZone} a card carrying attachments can occupy; see {@link ISavedCardRef.parent}. */
export type SavedParentRefZone = SavedArrayRefZone | 'leader' | 'base';

/**
 * A resolvable coordinate to a card position within this document. `zone` and `ordinal` are nullable
 * **together**: both null means "this card is not in any emitted position" (reachable only for a
 * zone-less card that is still an active effect's source); nothing else may be null. `parent` is present
 * only for a card nested under another card's `upgrades`/`capturedCards` list.
 *
 * `parent.seat` is the seat whose arrays `parent.zone`/`parent.ordinal` index into, and is **not**
 * redundant with `controllerSeat`: a nested card's controller can differ from its parent's. Two live ways
 * to reach that: `AttachUpgradeSystem.getFinalController` gives an upgrade played from hand the playing
 * player's control regardless of the host's controller, and `TakeControlOfUnitSystem` re-controls only
 * *token* upgrades, so a non-token upgrade keeps its controller when its host changes hands. Resolving
 * `parent.ordinal` in the nested card's own controller's arrays would bind to the wrong unit.
 */
export interface ISavedCardRef {
    card: string;
    controllerSeat: string;
    zone: SavedRefZone | null;
    ordinal: number | null;
    parent?: {
        seat: string;

        /** Narrower than {@link SavedRefZone}: only a card at one of these positions carries attachments. */
        zone: SavedParentRefZone;
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
 * count, no pilot-deployed leader, and no dropped watcher entry.
 *
 * `watcherEntry` no longer means "this watcher's state was not encoded" — watcher state *is* encoded now.
 * It means exactly one thing: a single watcher entry referenced a card with no position anywhere in this
 * document (a token removed from the game is the reachable producer), so that entry was dropped and
 * enumerated here.
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

/* ------------------------------------------------------------------------------------------------- *
 * State-watcher entry encoding.
 *
 * Each interface below mirrors one entry struct under `server/game/stateWatchers/` row for row, with
 * every `GameObjectId` replaced by an {@link ISavedCardRef} (cards) or a seat string (players), and every
 * runtime counter replaced by one of the two encoded forms declared here. A member whose live value was
 * absent is emitted as explicit `null`, never `undefined`.
 *
 * **Nullability is a contract, not an accident, and it is symmetric.** A member declared without `| null`
 * is guaranteed present in every emitted entry, and a consumer may treat a `null` there as a schema
 * violation: the corresponding live struct member is non-optional, and where the live value is
 * nevertheless absent the writer drops the whole entry and enumerates it as a `watcherEntry` fact rather
 * than emitting `null`. A member declared `| null` is usually one the live struct marks optional
 * (`defeatedBy?`, `parentCard?`, `originalZone?`, `inPlayId?`, `hasWhenDefeatedAbilities?`, …), for which
 * `null` means "absent" and is not degradation.
 *
 * Six members are declared `| null` although their live struct member is **not** optional. Each carries
 * its own note saying why, and in each case `null` still means "absent", never "degraded":
 * {@link ISavedAttackEntry.attackerAttributes}, both `lastKnownInformation` members
 * ({@link ISavedDefeatedCardEntry.lastKnownInformation}, {@link ISavedCardLeftPlayEntry.lastKnownInformation}),
 * and the three `damageDealtThisPhase` members whose updater writes a value the live declaration
 * overstates — {@link ISavedDamageDealtEntry.damageSourcePlayer},
 * {@link ISavedDamageDealtEntry.targetController} and {@link ISavedDamageDealtEntry.isIndirect}.
 *
 * Degradation inside this section is *always* enumerated. There is exactly one degraded outcome — the
 * entry is dropped and a `watcherEntry` fact names the watcher, the entry index, the offending field and
 * the reason. No member silently widens.
 * ------------------------------------------------------------------------------------------------- */

/** Tagged JSON encoding for a `Set` payload, matching Plan 3's `$set` form. Members are sorted lexicographically so the document is diff-stable. */
export interface ISavedTaggedSet<T extends string> {
    $set: T[];
}

/**
 * How a saved entry's in-play-id field related to its referent at save time. The raw number is never
 * published: it is meaningful only relative to the referent card's own live comparison key, which the
 * loader re-mints.
 *
 * - `'live'` — the saved id equalled the referent's live comparison key; the loader writes the loaded card's key.
 * - `'prior'` — the saved id named a superseded stint; the loader writes {@link PRIOR_STINT_ID}.
 * - `null` — no id was recorded (the referent sat in a hidden zone, is not an in-play-capable card, or the field was absent).
 *
 * Collapsing every superseded stint to one sentinel is behaviour-preserving because every consumer pairs
 * its id test with an identity test on the same card, so two distinct prior stints of one card are already
 * indistinguishable to every reader.
 */
export type ISavedStintRef = 'live' | 'prior' | null;

/**
 * The id the loader writes for a `'prior'` stint. Safe against every card at every time because
 * `InPlayCard._mostRecentInPlayId` is initialised `-1` and only ever incremented, so the global minimum
 * over all cards and all times is `-1 > -2`. The argument rests on that global minimum alone, not on any
 * per-card value: a deck-origin card is already at `0` before it is ever played.
 */
export const PRIOR_STINT_ID = -2;

/**
 * The document-scoped counter spaces an {@link ISavedCounterOrdinal} is minted into. Document-scoped rather
 * than per-watcher because two different watchers record ids drawn from the *same* live generator and are
 * compared against each other.
 */
export type SavedCounterSpaceName = 'gameEventIds' | 'attackIds';

/**
 * A dense, save-local ordinal into one of the document's counter spaces, or null when the field was absent.
 *
 * **Which space a member belongs to is part of this schema, not an inference.** Every declaration site
 * below names its space, and `deriveCounterSpaceSizes(document)` — exported from
 * `WatcherEntryEncoding.ts`, alongside `mintCounterId` and `resolveStintId` — is the only supported way to
 * obtain a space's size: deriving it per section is wrong, because a space's members are spread across
 * sections and a section holding only the smaller ordinals yields too small a size. Which members share a
 * space is declared once, in that module's `counterSpaceMembers` table, which the writer also mints
 * through. `mintCounterId`'s range guard does
 * **not** catch that — it fires only when the supplied size falls below an ordinal in the section being
 * decoded, which an under-derived size need not do.
 */
export type ISavedCounterOrdinal = number | null;

export interface ISavedCardAttributes {
    traits: ISavedTaggedSet<Trait>;
}

export interface ISavedLastKnownInformation {
    traits: ISavedTaggedSet<Trait>;
    type: CardType;
    power: number | null;
    arena: ZoneName | null;
}

export interface ISavedActionEntry {
    player: string;

    /** Preserved verbatim, never re-minted: `game.actionNumber` is itself restored verbatim, and `ActionsThisPhaseWatcher.previousActionNumberForPlayer` compares the two in the same restored space. */
    actionNumber: number;
}

export interface ISavedAttackEntry {
    attacker: ISavedCardRef;
    attackerInPlayId: ISavedStintRef;

    /**
     * `null` only when the live entry carried no attributes at all, which is **not reachable today**:
     * `AttackEntry.attackerAttributes` is declared non-optional, the sole updater writes
     * `event.attack.attacker.attributes`, and `Card.attributes` is a single unconditional getter that
     * always returns an object. The member stays nullable, and the writer keeps its guard, because the
     * alternative on a future absent value is dropping an otherwise-intact attack entry over a missing
     * trait snapshot — a worse trade than a `null` a consumer can test. A present value always carries a
     * real {@link ISavedTaggedSet}; there is no partially-encoded form.
     */
    attackerAttributes: ISavedCardAttributes | null;
    attackingPlayer: string;
    targets: ISavedCardRef[];

    /**
     * Always `null`: `AttacksThisPhaseWatcher`'s updater reads `event.attack.targetInPlayId`, but `Attack`
     * exposes `targetInPlayMap`, never `targetInPlayId`, so the live field is permanently `undefined`.
     * Published rather than omitted to keep this shape row-for-row with the live struct and to reserve the
     * coordinate should that engine bug be repaired.
     */
    targetInPlayId: null;
    defendingPlayer: string;
    actionNumber: number;

    /** Space: `attackIds`. Shares that space with {@link ISavedDamageDealtEntry.activeAttackId}. */
    attackId: ISavedCounterOrdinal;
}

export interface ISavedHealedBaseEntry {
    base: ISavedCardRef;
}

export interface ISavedDefeatedCardEntry {
    card: ISavedCardRef;
    inPlayId: ISavedStintRef;
    controlledBy: string;
    defeatedBy: string | null;
    wasDefeatedWhileAttacking: boolean;

    /** `null` only when the live entry carried none; see {@link ISavedAttackEntry.attackerAttributes}. */
    lastKnownInformation: ISavedLastKnownInformation | null;
}

export interface ISavedDiscardedCardEntry {
    card: ISavedCardRef;
    discardedFromPlayer: string;
    discardedFromZone: ZoneName;
    discardedPlayId: ISavedStintRef;
}

export interface ISavedDrawnCardEntry {
    player: string;
    card: ISavedCardRef;
}

export interface ISavedEnteredCardEntry {
    card: ISavedCardRef;
    playedBy: string;
}

export interface ISavedCardLeftPlayEntry {
    card: ISavedCardRef;
    controlledBy: string;

    /** `null` only when the live entry carried none; see {@link ISavedAttackEntry.attackerAttributes}. */
    lastKnownInformation: ISavedLastKnownInformation | null;
    inPlayId: ISavedStintRef;
}

export interface ISavedPlayedCardEntry {
    card: ISavedCardRef;

    /** Space: `gameEventIds`. The only member of that space. */
    playEventId: ISavedCounterOrdinal;
    originalZone: ZoneName | null;
    inPlayId: ISavedStintRef;
    playedBy: string;

    /** Explicitly `null` when the played card is not an attached upgrade. */
    parentCard: ISavedCardRef | null;

    /** Classified against {@link parentCard}, not against `card`. */
    parentCardInPlayId: ISavedStintRef;

    /**
     * `null` means absent under the ordinary rule: `PlayedCardEntry` declares the member optional. Its one
     * updater always writes a boolean, so `null` is not reachable today; the member follows the live
     * struct's own optionality rather than the updater's current behaviour.
     */
    hasWhenDefeatedAbilities: boolean | null;
    playedAsType: CardType;
}

export interface ISavedDamageDealtEntry {
    damageType: DamageType;

    /**
     * Empty is a legal, reachable shape, not corruption: `DamageDealtThisPhaseWatcher`'s updater branches
     * on `Combat`/`Overwhelm`/`Ability` only, so a `damageType: 'excess'` entry (reachable through
     * `BlizzardAssaultAtat` and `WipeThemOut`) records no sources and no targets at all. The same is true
     * of {@link targets}. A loader must not read either empty array as a schema violation.
     */
    damageSourceCards: ISavedCardRef[];

    /** Index-aligned with {@link damageSourceCards}; each element is classified against its own referent. */
    damageSourceInPlayIds: ISavedStintRef[];

    /** Index-aligned with {@link damageSourceCards}. */
    damageSourceCardTypes: CardType[];

    /**
     * `null` when absent. Unlike every other seat member in this section, `DamageDealtThisPhaseWatcher`
     * writes this one through an optional chain (`event.damageSource.player?.getObjectId()`), so the live
     * struct's non-optional declaration overstates what the updater guarantees.
     */
    damageSourcePlayer: string | null;

    /**
     * Always `null`: `DamageDealtThisPhaseWatcher`'s updater reads `event.damageSource.eventId`, but no
     * variant of `IDamageSource` declares `eventId` and no site under `server/` writes one, so the live
     * field is permanently `undefined`. It contributes nothing to the game-event-id counter space.
     * Published rather than omitted for the same reason as {@link ISavedAttackEntry.targetInPlayId}.
     */
    damageSourceEventId: null;

    /** Empty is legal for a `damageType: 'excess'` entry; see {@link damageSourceCards}. */
    targets: ISavedCardRef[];
    targetType: CardType;

    /** `null` when absent; written through an optional chain, like {@link damageSourcePlayer}. */
    targetController: string | null;
    amount: number;

    /**
     * `null` when absent. A fourth engine member whose declared type overstates it: `DamageDealtEntry`
     * declares it `boolean`, but the updater copies `event.isIndirect`, which combat and overwhelm damage
     * events never set. Observed absent on every combat damage entry, so this is the live shape rather
     * than a theoretical gap.
     */
    isIndirect: boolean | null;

    /** Space: `attackIds`. Shares that space with {@link ISavedAttackEntry.attackId}. */
    activeAttackId: ISavedCounterOrdinal;
}

export interface ISavedForceUsedEntry {
    player: string;
}

export interface ISavedDeployedLeaderEntry {
    card: ISavedCardRef;
}

export interface ISavedCreatedTokenEntry {
    token: ISavedCardRef;
    createdBy: string;
}

export interface ISavedDamagedUnitEntry {
    unit: ISavedCardRef;
    inPlayId: ISavedStintRef;
    controlledBy: string;
}

export interface ISavedHealedUnitEntry {
    unit: ISavedCardRef;
    inPlayId: ISavedStintRef;
    controlledBy: string;
}

/** The flat union of every entry shape, for a consumer walking entries generically. */
export type ISavedWatcherEntry =
  | ISavedActionEntry
  | ISavedAttackEntry
  | ISavedHealedBaseEntry
  | ISavedDefeatedCardEntry
  | ISavedDiscardedCardEntry
  | ISavedDrawnCardEntry
  | ISavedEnteredCardEntry
  | ISavedCardLeftPlayEntry
  | ISavedPlayedCardEntry
  | ISavedDamageDealtEntry
  | ISavedForceUsedEntry
  | ISavedDeployedLeaderEntry
  | ISavedCreatedTokenEntry
  | ISavedDamagedUnitEntry
  | ISavedHealedUnitEntry;

/**
 * One section per registered watcher that holds at least one surviving entry, discriminated on `watcher`.
 * A watcher with no entries emits no section at all: absent and empty mean the same thing, and the absent
 * form is the smaller canonical one.
 */
export type ISavedStateWatcherSection =
  | { watcher: StateWatcherName.ActionsThisPhase; entries: ISavedActionEntry[] }
  | { watcher: StateWatcherName.AttacksThisPhase; entries: ISavedAttackEntry[] }
  | { watcher: StateWatcherName.BasesHealedThisPhase; entries: ISavedHealedBaseEntry[] }
  | { watcher: StateWatcherName.CardsDefeatedThisPhase; entries: ISavedDefeatedCardEntry[] }
  | { watcher: StateWatcherName.CardsDiscardedThisPhase; entries: ISavedDiscardedCardEntry[] }
  | { watcher: StateWatcherName.CardsDrawnThisPhase; entries: ISavedDrawnCardEntry[] }
  | { watcher: StateWatcherName.CardsEnteredPlayThisPhase; entries: ISavedEnteredCardEntry[] }
  | { watcher: StateWatcherName.CardsLeftPlayThisPhase; entries: ISavedCardLeftPlayEntry[] }
  | { watcher: StateWatcherName.CardsPlayedThisPhase; entries: ISavedPlayedCardEntry[] }
  | { watcher: StateWatcherName.DamageDealtThisPhase; entries: ISavedDamageDealtEntry[] }
  | { watcher: StateWatcherName.ForceUsedThisPhase; entries: ISavedForceUsedEntry[] }
  | { watcher: StateWatcherName.LeadersDeployedThisPhase; entries: ISavedDeployedLeaderEntry[] }
  | { watcher: StateWatcherName.TokensCreatedThisPhase; entries: ISavedCreatedTokenEntry[] }
  | { watcher: StateWatcherName.UnitsDamagedThisPhase; entries: ISavedDamagedUnitEntry[] }
  | { watcher: StateWatcherName.UnitsHealedThisPhase; entries: ISavedHealedUnitEntry[] };

export type ISavedStateWatchers = ISavedStateWatcherSection[];

/**
 * The `v1` save-format document produced by `MatchSerializer.save`. Every field is non-optional except
 * those explicitly marked `?`, so a consumer inherits one shape per position and `JSON.stringify` can
 * never silently drop a member. No member is ever emitted as `undefined`; no uuid and no *raw* runtime
 * counter appears anywhere in the document; no `Date` object appears anywhere (dates are ISO strings).
 *
 * The `stateWatchers` section publishes members literally named `inPlayId`, `playEventId`, `attackId` and
 * `activeAttackId`, but none of them carries a raw runtime value: an in-play id is encoded as an
 * {@link ISavedStintRef} and a generated counter as an {@link ISavedCounterOrdinal}, both of which the
 * loader re-mints. The name ban therefore applies outside that section; inside it the stronger obligation
 * is the encoded form itself.
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
