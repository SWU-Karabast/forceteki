import type { Game } from '../Game';
import { AbilityType, CardType, DeployType, Duration, EffectName, EventName, PhaseName, PlayType, Stage, ZoneName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { logger } from '../../../logger';
import type { AbilityKind, AbilityUse, ActiveEffect, DefeatReason, EffectDuration, EffectEndReason, Header, GameEvent, LimitPer, ReducedState, Seat, SetupInitRecord } from '../../../../swupgn/src/types';
import { anonymizedGameId, anonymizedMatchId, saltedPlayerId, anonymizePlayerLabel } from './swuPgnIdentity';
import { isTopLevelActionRecord, markPlaySetup } from '../../../../swupgn/src/actionLinks';
import { ResourcePrompt } from '../gameSteps/prompts/ResourcePrompt';
import { isArena } from '../../../../swupgn/src/fold';

export interface HeaderContext {

    /** The engine's own game id. Host-internal: it salts the fallback player ids and is hashed
     *  into the `GameId` tag, never written as is (spec §17). */
    gameId: string;
    date: string;            // ISO-8601 UTC
    format?: string;
    cardPool: string;
    engineVersion: string;   // "forceteki@<version>"
    seed: string;
    perspective: 'P1' | 'P2' | null;
    rounds: number;
    result: 'P1' | 'P2' | 'Draw' | 'Incomplete';
    reason: string;

    /** Each seat's account id on the platform (spec §17): hashed into P1Id/P2Id, never written. */
    p1: { accountId: string; leader: string; base: string };
    p2: { accountId: string; leader: string; base: string };

    /** Handler failures during recording; omitted from the header when zero. */
    recorderErrors?: number;

    /** Undos performed during the game; omitted from the header when zero. */
    undos?: number;

    /** When the game ended (ISO-8601 UTC); with `date` this gives its duration. */
    endDate?: string;

    /** The lobby this game was played in. Anonymized into the `Match` tag by buildHeader -- the
     *  raw id never reaches the file, exactly as a username never does. */
    lobbyId?: string;

    /** Which game of the match this is. The game itself does not know, so this is for a caller
     *  that does (a delivery that knows the series); omitted otherwise. */
    gameNumber?: number;
}

/**
 * The reference writer's revision (spec §5.2): bumped on every change to what it writes that a
 * reader can observe, so two files that both say `SWU-PGN/1.0` can still be told apart. Files
 * written before the tag existed (the 1.0 pilot) carry none.
 */
export const SWU_PGN_WRITER_REVISION = 6;

export function buildHeader(ctx: HeaderContext): Header {
    return {
        game: 'SWU-PGN/1.0',
        writerRevision: SWU_PGN_WRITER_REVISION,
        gameId: anonymizedGameId(ctx.gameId),
        date: ctx.date,
        format: ctx.format,
        cardPool: ctx.cardPool,
        engine: ctx.engineVersion,
        seed: ctx.seed,
        perspective: ctx.perspective,
        ...(ctx.endDate ? { endDate: ctx.endDate } : {}),
        ...(ctx.lobbyId ? { match: anonymizedMatchId(ctx.lobbyId) } : {}),
        ...(ctx.gameNumber ? { gameNumber: ctx.gameNumber } : {}),
        p1Id: saltedPlayerId(ctx.p1.accountId, ctx.gameId),
        p2Id: saltedPlayerId(ctx.p2.accountId, ctx.gameId),
        p1: anonymizePlayerLabel(1),
        p2: anonymizePlayerLabel(2),
        p1Leader: ctx.p1.leader, p1Base: ctx.p1.base,
        p2Leader: ctx.p2.leader, p2Base: ctx.p2.base,
        result: ctx.result, reason: ctx.reason, rounds: ctx.rounds,
        ...(ctx.recorderErrors ? { recorderErrors: ctx.recorderErrors } : {}),
        ...(ctx.undos ? { undos: ctx.undos } : {}),
    };
}

/**
 * Maps engine identities to the stable, anonymized identifiers used by SWU-PGN/1.0.
 * The Game-side implementation (SwuPgnGameAdapter) owns copy-suffix logic and the omniscient
 * keyframe/deck-order projections; the recorder only needs uuid->id and playerId->seat.
 *
 * `reducedState`/`deckOrder` are the omniscient projections required to emit round
 * keyframes and the SETUP INIT record. They are optional so the recorder stays usable
 * with just `{ cardId, seat }` (unit tests, partial setups); when absent the recorder
 * emits a valid ROUND_START with no keyframe and recordInit() is a safe no-op.
 */
export interface SwuPgnResolver {
    cardId(uuid: string): string;
    seat(playerId: string): Seat;
    reducedState?(round: number): ReducedState;                 // engine board → 1.0 reduced state
    deckOrder?(): { p1: string[]; p2: string[] };               // initial deck order after shuffle
}

/**
 * What a card IS, from its printed type — stable for the whole game. Read from the TYPE rather
 * than from isShield/isExperience/isAdvantage predicates, so it is right for every token,
 * including Weakness (a token upgrade matching none of those predicates) and any upgrade token
 * printed in future.
 *
 * Distinct from `cardKind`, which reports the role a card is currently PLAYING. The two
 * disagree for pilots: a Pilot is printed as a unit (`printedType: 'basicUnit'`) but, once
 * flown onto a vehicle, its live `type` becomes `nonLeaderUnitUpgrade` and `isUpgrade()`
 * starts returning true. `%%% CARDS` is an identity index keyed by base id, so it must use
 * this one: keying it off the live role would make a pilot's entry say `unit` or `upgrade`
 * depending on whether it happened to be attached when the file was written.
 */
export function printedCardKind(card: any): 'unit' | 'upgrade' | undefined {
    try {
        switch (card?.printedType) {
            case CardType.BasicUnit:
            case CardType.NonTokenLeaderUnit:
            case CardType.TokenLeaderUnit:
            case CardType.TokenUnit:
                return 'unit';
            case CardType.BasicUpgrade:
            case CardType.LeaderUpgrade:
            case CardType.TokenUpgrade:
            case CardType.NonLeaderUnitUpgrade:
                return 'upgrade';
            default:
                // Base, Event, Leader, TokenCard: neither. See spec §6.5 on absent `kind`.
                return undefined;
        }
    } catch {
        return undefined;
    }
}

/**
 * The role a card is currently playing (`isUpgrade()`/`isUnit()` follow the live `type`).
 * This is what an EVENT's `kind` needs: an event states what it did, not what the card is.
 */
export function cardKind(card: any): 'unit' | 'upgrade' | undefined {
    try {
        if (card?.isUpgrade?.()) {
            return 'upgrade';
        }
        if (card?.isUnit?.()) {
            return 'unit';
        }
    } catch {
        // fall through: an unclassifiable card simply omits `kind`
    }
    return undefined;
}

/**
 * Read an engine property that is only valid in some zones, falling back rather than throwing.
 *
 * The engine guards zone-specific properties with Contract assertions: reading `upgrades` (and
 * so any computed stat) on a card in `outsideTheGame` throws. A recorder handler that throws is
 * caught, counted into `RecorderErrors`, and its whole record is dropped -- so one unguarded
 * read costs the file an event AND tells every reader the file is under-recorded.
 */
export function readOr<T>(get: () => T, fallback: T): T {
    try {
        const v = get();
        return v === undefined ? fallback : v;
    } catch {
        return fallback;
    }
}

/**
 * The engine's ability types, mapped to the format's `ABILITY_ACTIVATE.kind` vocabulary.
 *
 * Typed as `Record<AbilityType, AbilityKind>` for the reason the switch it replaced was not:
 * that switch ended in `default: return undefined`, so an engine type nobody had mapped fell
 * silently out of the file with no `kind` at all. Two did -- `Event` (every event card's own
 * ability) and `DelayedEffect` -- and the first of them reached a real export before anyone
 * noticed. A Record makes the compiler name the next one instead.
 *
 * `keyword` and `epic` are NOT here: neither is an `AbilityType`. A keyword ability is built as
 * an ordinary TriggeredAbility and only its identifier's `keyword_<name>` descriptor says
 * otherwise; an Epic Action is an ActionAbility with an epic limit. Both are decided before
 * this map is consulted.
 */
const ABILITY_KIND_OF: Record<AbilityType, AbilityKind> = {
    [AbilityType.Action]: 'action',
    [AbilityType.Triggered]: 'triggered',
    [AbilityType.ReplacementEffect]: 'replacement',
    [AbilityType.DamageModification]: 'replacement',
    [AbilityType.Constant]: 'constant',
    [AbilityType.Event]: 'event',
    [AbilityType.DelayedEffect]: 'delayed',
};

/**
 * The engine's defeat causes, mapped to the format's CLOSED `DEFEAT.reason` set (spec §6.4).
 *
 * Typed as `Record<DefeatSourceType, DefeatReason>` on purpose: the two vocabularies are
 * maintained separately -- the engine's in `IDamageOrDefeatSource.ts`, the format's in the
 * spec, the schema enum and `swupgn/src/types.ts` -- and a plain `source.type` passthrough let
 * a NEW engine cause widen into the file silently, producing a value no schema or reader knew.
 * This map makes the compiler name the day that happens, at the one line that bridges them.
 *
 * A source the engine did not supply at all falls through to `unknown` at the call site.
 */
const DEFEAT_REASON_OF: Record<DefeatSourceType, DefeatReason> = {
    [DefeatSourceType.Attack]: 'attack',
    [DefeatSourceType.Ability]: 'ability',
    [DefeatSourceType.NonCombatDamage]: 'nonCombatDamage',
    [DefeatSourceType.UniqueRule]: 'uniqueRule',
    [DefeatSourceType.FrameworkEffect]: 'frameworkEffect',
};


/** What a `STATS` record and a keyframe card both state about an in-play unit. */
export interface LiveStats {
    power: number; hp: number; keywords: string[];
    traits: string[];
    blank?: true;
    leaderUnit?: true;
    copyOf?: string; name?: string; cost?: number; aspects?: string[];
}

/**
 * A unit's live power, HP and keywords AS THE ENGINE COMPUTES THEM -- printed values, upgrades,
 * tokens, lasting effects, Raid while attacking, Grit, everything. Read here and nowhere else,
 * so the STATS deltas and the keyframe snapshot can never disagree. A numeric keyword is
 * `"raid 2"`; keywords the engine has blanked are left out; the list is sorted. Returns null
 * when the card cannot answer (not a unit, or not in a zone where stats apply).
 *
 * The rest of the unit's attributes ride along (spec §10.1 STATS, `[W-55]`): its current
 * `traits`, sorted; `blank` only while it has lost ALL its abilities (CR 8.14.2: a partial
 * blank, which keeps keywords or one card's grants, is not); `leaderUnit` only when an ability
 * made it a leader unit (CR 3.4.7: a vehicle a leader pilots), never for the seat's own leader
 * card, which is a leader unit by being one; and, only while the unit is a copy (CR 8.5,
 * Clone), `copyOf` naming the copied card by `idOf`, with the copied `name`, `cost` and
 * `aspects` as the copy now reads them. A field that cannot be read is left out.
 */
export function liveStats(card: any, idOf?: (card: any) => string): LiveStats | null {
    try {
        if (typeof card?.getPower !== 'function' || typeof card?.getHp !== 'function') {
            return null;
        }
        const keywords: string[] = [];
        for (const k of card.keywords ?? []) {
            if (k?.isBlank) {
                continue;
            }
            const name = String(k?.name ?? '');
            if (!name) {
                continue;
            }
            keywords.push(typeof k.hasNumericValue === 'function' && k.hasNumericValue() ? `${name} ${k.value}` : name);
        }
        keywords.sort();
        const stats: LiveStats = { power: card.getPower(), hp: card.getHp(), keywords, traits: liveTraits(card) };
        if (readOr(() => card.isFullyBlanked?.() === true, false)) {
            stats.blank = true;
        }
        if (readOr(() => card.isLeaderUnit?.() === true && card.isDeployableLeader?.() !== true, false)) {
            stats.leaderUnit = true;
        }
        const copied = readOr<any>(() => (card.isClonedUnit === true ? card.getOngoingEffectValues(EffectName.CloneUnit)[0] : null), null);
        const copyOf = copied != null && idOf ? readOr(() => idOf(copied), 'unknown') : 'unknown';
        if (copyOf !== 'unknown') {
            stats.copyOf = copyOf;
            const title = readOr<string>(() => card.title, '');
            const subtitle = readOr<string>(() => card.subtitle, '');
            if (title) {
                stats.name = subtitle ? `${title}, ${subtitle}` : title;
            }
            const cost = readOr<unknown>(() => card.printedCost, undefined);
            if (typeof cost === 'number') {
                stats.cost = cost;
            }
            stats.aspects = readOr<string[]>(() => [...(card.aspects ?? [])].map(String), []);
        }
        return stats;
    } catch {
        return null;
    }
}

/** A card's current traits, printed or gained, less any it lost: sorted, lower case as printed. */
function liveTraits(card: any): string[] {
    return readOr<string[]>(() => [...(card.traits ?? [])].map(String), []).sort();
}

/**
 * The unit an upgrade is attached to, or null. The public `parentCard` getter throws once an
 * upgrade has been unattached (which happens during shield defeat), so the internal
 * `_parentCard` is read first and the guarded getter is only a fallback. Shared with the
 * adapter's keyframe projection so both sides answer "is this card attached?" the same way.
 */
export function attachedHost(upgrade: any): any {
    try {
        const internal = upgrade?._parentCard;
        if (internal != null) {
            return internal;
        }
        return upgrade?.parentCard ?? null;
    } catch {
        return null;
    }
}

/**
 * How the fold models a token-upgrade: the two named counters (`shields`, `experience`), or a
 * status token counted under its own name in `statusTokens` (advantage, weakness, and any
 * token upgrade printed later).
 */
export type TokenUpgradeKind = 'shield' | 'experience' | { status: string };

/**
 * Classify a token-upgrade card. Returns null for a normally-played (non-token) upgrade,
 * which is covered by PLAY_UPGRADE and must not produce a token record.
 *
 * Derived from the card's TYPE (`isTokenUpgrade`), not from a list of names, so a new token
 * upgrade classifies itself the day it is printed: Weakness used to fall through here and was
 * recorded as if it were a printed upgrade. Shared with the adapter's keyframe projection so
 * the writer's two views of a host — the deltas and the snapshot — can never disagree about
 * which tokens are counters and which are `upgrades[]` entries (none: token upgrades are
 * never listed there, spec §11).
 */
export function tokenUpgradeKind(upgrade: any): TokenUpgradeKind | null {
    try {
        if (upgrade?.isShield?.()) {
            return 'shield';
        }
        if (upgrade?.isExperience?.()) {
            return 'experience';
        }
        if (upgrade?.isTokenUpgrade?.()) {
            const name = upgrade.internalName ?? upgrade.title;
            return typeof name === 'string' && name.length > 0 ? { status: name } : null;
        }
    } catch {
        // fall through: an unclassifiable card is treated as a printed upgrade
    }
    return null;
}

/** What the recorder keeps about one effect it has written an `EFFECT_START` for (spec §10.1). */
interface RecordedEffect {
    duration: EffectDuration;
    delayed: boolean;
    sourceCard: any;
}

/**
 * The engine objects one `OnEffectApplied` window created for one stated effect, waiting for the
 * window to resolve their targets before the `EFFECT_START` is written (see `collectEffect`).
 */
interface PendingEffectGroup {
    context: any;
    window: any;
    kind: 'card' | 'player' | 'delayed';
    engineDuration: unknown;
    system: object | null;
    sourceCard: any;
    objects: any[];
}

/**
 * The words that end a `Duration.Custom` effect, read after "until" (`untilText`, spec §10.1): one
 * phrase per engine event the effect listens for, joined with "or". The engine states the
 * condition as event names and functions, so the phrase names the event, not the function's test.
 */
const untilEventPhrases: Partial<Record<string, string>> = {
    [EventName.OnPhaseEnded]: 'the phase ends',
    [EventName.OnRoundEnded]: 'the round ends',
    [EventName.OnActionTaken]: 'an action is taken',
    [EventName.OnCardLeavesPlay]: 'a card leaves play',
    [EventName.OnAttackDeclared]: 'an attack is declared',
    [EventName.OnAttackEnd]: 'an attack ends',
    [EventName.OnCardPlayed]: 'a card is played',
    [EventName.OnCardDefeated]: 'a card is defeated',
};

export function untilTextOf(until: unknown): string {
    const names = until != null && typeof until === 'object' ? Object.keys(until) : [];
    const spelledOut = (name: string): string => name
        .replace(/^on(?=[A-Z])/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .toLowerCase();
    const phrases = names.map((name) => untilEventPhrases[name] ?? spelledOut(name));
    return phrases.length > 0 ? phrases.join(' or ') : 'a condition is met';
}

/** The `duration` vocabulary (spec §10.1) for an engine lasting effect's `Duration`. */
export function effectDurationOf(engineDuration: unknown, delayed: boolean): EffectDuration {
    if (delayed) {
        return 'delayed';
    }
    switch (engineDuration) {
        case Duration.UntilEndOfAttack: return 'attack';
        case Duration.UntilEndOfPhase: return 'phase';
        case Duration.UntilEndOfRound: return 'round';
        case Duration.WhileSourceInPlay: return 'whileSourceInPlay';
        case Duration.Custom: return 'until';
        default: return 'game';
    }
}

/**
 * The `limit` an engine ability limit is written with (spec §10.1 `#limited-abilities`), for
 * `player`, or undefined for a limit the format does not count: an unlimited ability, the Epic
 * Action (which keeps its own `epic` fields), and a repeatable limit reset by anything other than
 * a phase's or a round's end. `max` is the engine's per-player modified maximum.
 */
export function limitRecordOf(limit: any, player: any): { max: number; per: LimitPer } | undefined {
    if (limit == null || readOr(() => limit.isEpicActionLimit?.() === true, true)) {
        return undefined;
    }
    let per: LimitPer | undefined;
    if (readOr(() => limit.isRepeatable?.() === true, false)) {
        // An unlimited ability is "repeatable" too, and has no boundary.
        per = readOr<LimitPer | undefined>(() => limit.resetsOn, undefined);
    } else if (typeof limit.maxForPlayer === 'function') {
        per = 'game';
    }
    if (per == null || typeof limit.maxForPlayer !== 'function') {
        return undefined;
    }
    const max = readOr<unknown>(() => limit.maxForPlayer(player), undefined);
    if (typeof max !== 'number' || !Number.isInteger(max) || max < 1) {
        return undefined;
    }
    return { max, per };
}

/**
 * Emits SWU-PGN/1.0 `GameEvent`s by subscribing to engine events. Every handler is
 * wrapped in try/catch with rate-limited error logging so a recording bug can never
 * crash gameplay.
 */
export class SwuPgnRecorder {
    private readonly game: Game;
    private readonly resolver: SwuPgnResolver;
    private readonly events: GameEvent[] = [];

    /** %%% SETUP section records (currently the INIT deck-order record). */
    private readonly setup: (SetupInitRecord | GameEvent)[] = [];

    /** Fallback origin for `ms`, for a game that reports neither `startedAt` nor `createdAt`. */
    private readonly startedRecordingMs = Date.now();

    /** Current round number. */
    private currentRound = 0;

    /** Current phase abbreviation: 'S', 'A', or 'G' (port of v1.0 scheme). */
    private currentPhase = 'S';

    /**
     * Cards seen going resource -> resource whose control change has not been recorded yet (see
     * OnCardMoved). Held only between that move and the event that completes it.
     */
    private readonly resourceRowChanges = new Set<string>();

    /** Incremented for top-level player actions during the Action Phase. */
    private actionCounter = 0;

    /** Incremented for events in Setup/Regroup phases. */
    private phaseEventCounter = 0;

    /** Incremented for sub-events within an action; reset when actionCounter increments. */
    private subEventCounter = 0;

    /** Caps repeated recorder-error logging so a broken handler can't flood the logs. */
    private static readonly maxLoggedErrors = 20;
    private loggedErrorCount = 0;

    /**
     * Every handler failure, capped or not. Surfaced in the header as `RecorderErrors` so a
     * file that silently dropped events past the logging cap does not pass for a clean one.
     */
    private errorCount = 0;

    /**
     * Undos performed during this game, surfaced as the header's `Undos`.
     *
     * Deliberately NOT held in a checkpoint and never restored by `rollbackTo`: every other
     * counter here describes the RECORDING, which a rollback rewinds, while this one describes
     * the SESSION, which it does not. Undoing a second time does not un-happen the first.
     */
    private undoCount = 0;

    /**
     * Remembers which unit each token-upgrade is attached to, and what kind it is
     * (token uuid → { parent unit object, kind }).
     *
     * Needed for every token REMOVAL record. A token-upgrade is removed by being defeated, but
     * DefeatCardSystem unattaches the upgrade in its eventHandler before our OnCardDefeated
     * `.on()` listener runs, so the token's parentCard is already null by then. We capture the
     * parent at attach time instead.
     *
     * This used to hold shields only, which is why SHIELD_USE was emitted but experience and
     * advantage were never decremented: a reader folding the stream kept every Advantage token
     * on its host for the rest of the replay. All three token kinds now round-trip.
     */
    private readonly tokenParents = new Map<string, { parent: any; kind: TokenUpgradeKind }>();

    /**
     * The last `STATS` written per in-play unit (uuid -> JSON of the record's fields), so the
     * sync after each engine event writes a record only when something changed. Checkpointed
     * with the rest of the recorder state: after an undo the engine's stats revert, and a stale
     * map would suppress the record that says so.
     */
    private readonly lastStats = new Map<string, string>();

    /**
     * The controller of each in-play upgrade an `OnUpgradeAttached` is about to re-attach (upgrade
     * uuid -> seat), read at the event's `preResolve`, so its handler can tell that the attach
     * took control of the upgrade (Pre Vizsla, spec §10.1 upgrade `TAKE_CONTROL`, `[W-56]`). The
     * engine changes an attached upgrade's controller inside `attachTo` with no event of its own.
     * Empty between events; held in each checkpoint and restored by `rollbackTo` all the same.
     */
    private readonly upgradeControllerBefore = new Map<string, Seat>();

    /**
     * The MOVE into the resource row whose `exhausted` flag is not final yet.
     *
     * `Player.resourceCard` moves the card and only THEN sets `exhausted` (the regroup phase's
     * resourcing enters exhausted, CR 5.5.1.c; so do abilities'), and OnCardMoved fires inside
     * the move, so the flag cannot be read in the move's own handler. It is read at the start of
     * the next engine event or any read of the record (`settleResourceMove`), by which time the
     * flag is final, and written onto this record. Transient: dropped by `rollbackTo`, never
     * held across a checkpoint (the record it points at is truncated with the rest).
     */
    private pendingResourceMove: { event: GameEvent; card: any } | null = null;

    /**
     * Lasting and delayed effects written so far and still active (spec §10.1, `[W-48]`), all held
     * in each checkpoint: an undo past an `EFFECT_START` must forget the effect, and one past an
     * `EFFECT_END` must bring it back, or `syncEffects` would end an effect twice or never.
     *
     * - `effectIds`: engine OngoingEffect uuid -> the `fx@N` it belongs to. One stated effect can
     *   be several engine objects (one per target, one per effect factory).
     * - `effectObjects`: the same uuids -> the engine objects, to tell why one ended.
     * - `effectTargets`: `fx@N` -> the targets it still has, as written (card ids, `base@N`).
     * - `effectTargetObjects`: target id -> the engine card, and whether it was in play when the
     *   effect began: only a target that was in play can leave play (an effect can name a card
     *   in a discard pile, "your opponent may play this unit from its owner's discard pile").
     * - `effectInfo`: `fx@N` -> what is needed to end it, in start order.
     * - `nextEffectNumber`: the last N given out; ids are never reused (spec §6.1).
     */
    private readonly effectIds = new Map<string, string>();
    private readonly effectObjects = new Map<string, any>();
    private readonly effectTargets = new Map<string, Set<string>>();
    private readonly effectTargetObjects = new Map<string, { card: any; inPlay: boolean }>();
    private readonly effectInfo = new Map<string, RecordedEffect>();
    private nextEffectNumber = 0;

    /**
     * Effects applied in the event window resolving now, not written yet: their targets are
     * resolved by the window's game-state check, after every `OnEffectApplied` of the window.
     * Transient: always empty between windows, so never checkpointed; `rollbackTo` clears it.
     */
    private pendingEffects: PendingEffectGroup[] = [];

    /** The engine's effects just before the `OnEffectApplied` handler that is running now. */
    private effectsBeforeApply: Set<any> | null = null;

    /**
     * Limited-ability uses written since the last boundary that clears them (`seat|card ref` -> the
     * `per` values used, the seat being the one that used them), so a zone change writes
     * `ABILITY_RESET` only for a card the fold still counts uses for (spec §10.1, `[W-49]`). Held
     * in each checkpoint: an undo past a use must forget it, and one past a reset must bring it back.
     */
    private readonly limitedUses = new Map<string, Set<LimitPer>>();

    /**
     * Uses of a GAINED limited ability (`seat|card|ability` -> the engine limit and player counted).
     * A gained ability shares its granting card's limit object, and when the grant ends the engine
     * removes the ability but keeps the limit's count (and restores it if the ability is granted
     * again), so the keyframe cannot find the count on the card any more; the projection reads it
     * from here (see `heldGainedUses`). Dropped with the card's `ABILITY_RESET` and at the boundary
     * its `per` names. Held in each checkpoint.
     */
    private readonly gainedUses = new Map<string, { seat: Seat; card: string; ability: string; per: LimitPer; limit: any; player: any }>();

    /**
     * The ask whose card picks are `blind` (spec §10.2 simultaneous groups): the ability context
     * that asked several players to choose at once, and the seq of the record that asked. Held in
     * each checkpoint.
     */
    private blindAsk: { context: any; seq: string } | null = null;

    /**
     * The `simul` group being written: the engine event window it resolves in, its first record,
     * and that record's seq (the group's value). The first record is marked only when a second
     * joins, so a group is never one record. Held in each checkpoint.
     */
    private simulGroup: { window: any; first: GameEvent; seq: string } | null = null;

    /**
     * Rollback checkpoints (array lengths + counters + tokenParents snapshot) keyed by
     * snapshot id, so the recorder rewinds in lockstep with the game on undo.
     * tokenParents is captured here because a
     * rollback that rewinds past a token attach without restoring the map would make a
     * later removal record miss its parent.
     */
    private readonly checkpoints: {
        snapshotId: number;
        eventsLen: number;
        setupLen: number;
        currentRound: number;
        currentPhase: string;
        actionCounter: number;
        phaseEventCounter: number;
        subEventCounter: number;
        loggedErrorCount: number;
        errorCount: number;
        tokenParents: [string, { parent: any; kind: TokenUpgradeKind }][];
        lastStats: [string, string][];
        upgradeControllerBefore: [string, Seat][];
        pendingResourceMove: { event: GameEvent; card: any } | null;
        effectIds: [string, string][];
        effectObjects: [string, any][];
        effectTargets: [string, string[]][];
        effectTargetObjects: [string, { card: any; inPlay: boolean }][];
        effectInfo: [string, RecordedEffect][];
        nextEffectNumber: number;
        limitedUses: [string, LimitPer[]][];
        gainedUses: [string, { seat: Seat; card: string; ability: string; per: LimitPer; limit: any; player: any }][];
        blindAsk: { context: any; seq: string } | null;
        simulGroup: { window: any; first: GameEvent; seq: string } | null;
    }[] = [];

    public constructor(game: Game, resolver: SwuPgnResolver) {
        this.game = game;
        this.resolver = resolver;
        this.registerListeners();
    }

    // ── Public interface ──────────────────────────────────────────────────────

    public getEvents(): GameEvent[] {
        this.settleResourceMove();
        return this.events;
    }

    /** How many undos this game has had. See `undoCount`. */
    public getUndoCount(): number {
        return this.undoCount;
    }

    public getSetup(): (SetupInitRecord | GameEvent)[] {
        return this.setup;
    }

    /** How many handler failures (recording skipped) this game has had. */
    public getErrorCount(): number {
        return this.errorCount;
    }

    /**
     * Record the `%%% SETUP` INIT entry: the post-shuffle initial deck order for both players.
     * Sourced from the omniscient `resolver.deckOrder()` projection (SwuPgnGameAdapter). No-op when the
     * resolver does not provide deckOrder (e.g. unit fakes built with just `{ cardId, seat }`).
     */
    public recordInit(): void {
        try {
            if (!this.resolver.deckOrder) {
                return;
            }
            const { p1, p2 } = this.resolver.deckOrder();
            this.setup.push({
                seq: 'R0.S.0',
                t: 'INIT',
                p1DeckOrder: p1,
                p2DeckOrder: p2,
            });
        } catch (error) {
            this.logError('recordInit', error);
        }
    }

    public addGameEndRecord(winner: Seat | 'Draw', reason: string): void {
        try {
            this.recordDamageBaseDefeats();
        } catch (error) {
            this.logError('recordDamageBaseDefeats', error);
        }
        try {
            // Spec §9.1: GAME_END takes the `.game-end` step of the phase it happened in. A
            // concession or disconnect can land in setup or regroup, not only the action phase,
            // and the step is its own so it never shares a seq with that phase's PHASE_END
            // (play can continue after game end, so both get written).
            this.push({
                seq: `R${this.currentRound}.${this.currentPhase}.game-end`,
                t: 'GAME_END',
                winner,
                reason,
            });
        } catch (error) {
            this.logError('addGameEndRecord', error);
        }
    }

    /**
     * A base whose damage reached its HP is defeated by the game rules, which raise no event of
     * their own: the game just ends. Write its `DEFEAT` so every defeated base has one -- an
     * ability's outright defeat (OnBaseDefeated) already does -- and a reader has a single
     * signal for "this base fell" whatever caused it. The reason and the culprit are the last
     * hit the base took: combat or Overwhelm is the attacker's, an ability's damage is
     * non-combat, and damage no card dealt (drawing from an empty deck) is the rules'.
     */
    private recordDamageBaseDefeats(onlyRef?: string): void {
        for (const player of this.game.getPlayers?.() ?? []) {
            const base = player?.base;
            if (!base || !((base.damage ?? 0) >= (base.getHp?.() ?? Infinity))) {
                continue;
            }
            const ref = this.targetRef(base);
            if (onlyRef != null && ref !== onlyRef) {
                continue;
            }
            if (this.events.some((e) => e.t === 'DEFEAT' && e.card === ref)) {
                continue;
            }
            let reason: DefeatReason = 'unknown';
            let defeatedBy: string | undefined;
            for (let i = this.events.length - 1; i >= 0; i--) {
                const e = this.events[i];
                if (e.t === 'OVERWHELM' && e.tgt === ref) {
                    reason = 'attack';
                    defeatedBy = this.attackerBefore(i);
                    break;
                }
                if (e.t === 'DAMAGE' && e.tgt === ref) {
                    reason = e.src == null ? 'frameworkEffect' : e.damageType === 'combat' ? 'attack' : 'nonCombatDamage';
                    defeatedBy = e.src;
                    break;
                }
            }
            this.push({
                seq: this.nextSeq(false),
                t: 'DEFEAT',
                card: ref,
                reason,
                ...(defeatedBy ? { defeatedBy } : {}),
            });
        }
    }

    /**
     * The hit just recorded took a base to 0: write its DEFEAT now, beside the hit. Game end is
     * not enough on its own -- once a game has ended the players may continue playing, and the
     * engine then skips its end-of-game path entirely, so the second base to fall would get no
     * DEFEAT while the next keyframe reported it defeated.
     */
    private recordLethalBaseHit(card: any): void {
        // Only the base this hit landed on: one effect can damage both bases, and the other's own
        // hit is not recorded yet, so sweeping both here would blame it on nothing.
        if (readOr(() => card?.isBase?.() === true && (card.remainingHp ?? 1) <= 0, false)) {
            this.recordDamageBaseDefeats(this.targetRef(card));
        }
    }

    /** True once a DEFEAT for `seat`'s base has been recorded (and not undone). */
    public hasRecordedBaseDefeat(seat: Seat): boolean {
        return this.events.some((e) => e.t === 'DEFEAT' && e.card === `base@${seat}`);
    }

    /** The attacker of the `ATTACK` an event at `index` belongs to, if one is found before it. */
    private attackerBefore(index: number): string | undefined {
        for (let i = index - 1; i >= 0; i--) {
            const e = this.events[i];
            if (e.t === 'ATTACK') {
                return e.atk;
            }
        }
        return undefined;
    }

    /**
     * Roll the recorded SWU-PGN data back to a prior game state after an undo.
     * `restoredSnapshotId` is the snapshot the game was restored to
     * (snapshotManager.currentSnapshotId after the rollback). Truncates events/setup back to
     * the boundary captured when that snapshot was taken — dropping exactly the undone events —
     * restores all counters and the tokenParents map, and discards that checkpoint and any
     * later ones so re-recording the redo starts clean.
     * Safe no-op when the snapshot id is unknown (nothing was recorded after it).
     *
     * Leaves an `UNDO` note where the truncation happened (spec §10.2) and counts the undo into
     * the header's `Undos` tag. Without those the file is not merely quiet about the undo, it
     * actively misreports: the retracted records are gone, so a reader sees a game in which no
     * decision was ever taken back. The note folds to nothing, so nobody's board changes.
     *
     * Returns the stream lengths it truncated to (before the note), or undefined when nothing
     * was truncated.
     */
    public rollbackTo(restoredSnapshotId: number | null, undoingPlayerId?: string): { setupLen: number; eventsLen: number } | undefined {
        try {
            if (restoredSnapshotId == null) {
                return undefined;
            }
            // Checkpoints are taken lazily, on the first push under a snapshot id, so the
            // restored id may have none of its own while later ids do (a snapshot during
            // which nothing was recorded). Ids are monotonic, so the boundary is the first
            // checkpoint at or after the restored id: its lengths are what existed when that
            // snapshot was taken, which is the state being restored. An exact-match search
            // returned early here and left the undone events in the file.
            const idx = this.checkpoints.findIndex((c) => c.snapshotId >= restoredSnapshotId);
            if (idx === -1) {
                return undefined; // nothing was recorded after the restored snapshot
            }
            const boundary = this.checkpoints[idx];
            // The first record being dropped is what the undo reached back to; capture it
            // before the truncation takes it away.
            //
            // UNWRAP a previous UNDO note. push() re-checkpoints BEFORE appending the note, so
            // the boundary for this snapshot ends up pointing AT that note; undoing to the same
            // point again (undo -> retry -> undo, ordinary usage) would then read the note's own
            // seq. That produced `R2.start-undo-undo` whose `at` named a record the truncation
            // had just deleted -- a dangling citation the reference validator rejects, and an
            // unbounded `-undo-undo-...` suffix on repeat. Chain through to the real game
            // position instead, so every UNDO names where play actually resumed.
            const dropped = this.events[boundary.eventsLen];
            const undoneFrom = dropped?.t === 'UNDO' ? dropped.at : dropped?.seq;
            this.events.length = boundary.eventsLen;
            this.setup.length = boundary.setupLen;
            this.currentRound = boundary.currentRound;
            this.currentPhase = boundary.currentPhase;
            this.actionCounter = boundary.actionCounter;
            this.phaseEventCounter = boundary.phaseEventCounter;
            this.subEventCounter = boundary.subEventCounter;
            this.loggedErrorCount = boundary.loggedErrorCount;
            this.errorCount = boundary.errorCount;
            // Rebuild tokenParents from the snapshot taken at the boundary so a removal record for
            // a token gained after the boundary no longer finds a parent (and is skipped).
            this.tokenParents.clear();
            for (const [uuid, entry] of boundary.tokenParents) {
                this.tokenParents.set(uuid, entry);
            }
            this.pendingResourceMove = boundary.pendingResourceMove;
            this.lastStats.clear();
            for (const [uuid, key] of boundary.lastStats) {
                this.lastStats.set(uuid, key);
            }
            this.upgradeControllerBefore.clear();
            for (const [uuid, seat] of boundary.upgradeControllerBefore) {
                this.upgradeControllerBefore.set(uuid, seat);
            }
            this.restoreEffects(boundary);
            this.limitedUses.clear();
            for (const [card, pers] of boundary.limitedUses) {
                this.limitedUses.set(card, new Set(pers));
            }
            this.gainedUses.clear();
            for (const [key, entry] of boundary.gainedUses) {
                this.gainedUses.set(key, entry);
            }
            this.blindAsk = boundary.blindAsk;
            this.simulGroup = boundary.simulGroup;
            // Drop this checkpoint and any later ones; the redo re-checkpoints as it records.
            this.checkpoints.length = idx;

            // The count is NOT part of the rolled-back state: an undo is a fact about the
            // session, and undoing again does not un-happen the first one. So it is never
            // restored from a checkpoint, and it is the authoritative figure -- an UNDO note is
            // an ordinary record and a later, deeper rollback can truncate one away.
            this.undoCount++;
            const by = undoingPlayerId
                ? readOr<Seat | undefined>(() => this.seatOf({ id: undoingPlayerId }), undefined)
                : undefined;
            if (undoneFrom != null) {
                // Its own seq, hyphen-suffixed from the record it reached back to (the same
                // shape `.game-end` uses). Reusing that record's seq verbatim would collide:
                // the counters are restored too, so the redo re-issues the very same number.
                this.push({
                    seq: `${undoneFrom}-undo`,
                    t: 'UNDO',
                    at: undoneFrom,
                    // Through readOr like every other optional derivation here: the truncation
                    // has already applied by this point, so a throw from seat resolution would
                    // lose the note that says the retraction happened while keeping the
                    // retraction itself. A note without `by` beats no note.
                    ...(by != null ? { by } : {}),
                });
            }
            return { setupLen: boundary.setupLen, eventsLen: boundary.eventsLen };
        } catch (error) {
            this.logError('rollbackTo', error);
            return undefined;
        }
    }

    /**
     * Capture a rollback checkpoint for `snapshotId`, recording the current array lengths,
     * counters, and a snapshot of the tokenParents map. Mirrors v1.0's checkpoint semantics:
     * if the most recent checkpoint already belongs to this snapshot id it is a no-op (one
     * checkpoint per snapshot boundary). Exposed publicly so tests (and any explicit Game-side
     * hook) can checkpoint deterministically; gameplay drives it lazily via push().
     */
    public checkpoint(snapshotId: number): void {
        try {
            if (snapshotId < 0) {
                return;
            }
            const last = this.checkpoints[this.checkpoints.length - 1];
            if (last && last.snapshotId === snapshotId) {
                return;
            }
            this.checkpoints.push({
                snapshotId,
                eventsLen: this.events.length,
                setupLen: this.setup.length,
                currentRound: this.currentRound,
                currentPhase: this.currentPhase,
                actionCounter: this.actionCounter,
                phaseEventCounter: this.phaseEventCounter,
                subEventCounter: this.subEventCounter,
                loggedErrorCount: this.loggedErrorCount,
                errorCount: this.errorCount,
                tokenParents: [...this.tokenParents.entries()],
                lastStats: [...this.lastStats.entries()],
                upgradeControllerBefore: [...this.upgradeControllerBefore.entries()],
                pendingResourceMove: this.pendingResourceMove,
                effectIds: [...this.effectIds.entries()],
                effectObjects: [...this.effectObjects.entries()],
                effectTargets: [...this.effectTargets.entries()].map(([fx, targets]) => [fx, [...targets]]),
                effectTargetObjects: [...this.effectTargetObjects.entries()],
                effectInfo: [...this.effectInfo.entries()],
                nextEffectNumber: this.nextEffectNumber,
                limitedUses: [...this.limitedUses.entries()].map(([card, pers]) => [card, [...pers]]),
                gainedUses: [...this.gainedUses.entries()],
                blindAsk: this.blindAsk,
                simulGroup: this.simulGroup,
            });
            // Not capped. The engine keeps its phase snapshots per phase name, and the setup
            // phase only happens once, so a rollback can reach any checkpoint in the game. A cap
            // dropped the one a deep undo needed: `rollbackTo` then truncated at a later boundary
            // and left the undone records in the file.
        } catch (error) {
            this.logError('checkpoint', error);
        }
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private push(e: GameEvent): void {
        this.maybeCheckpoint();
        if (isTopLevelActionRecord(e)) {
            this.noteAnnouncedPlay();
        }
        // Elapsed time, on the records a reviewer asks it of: the numbered actions, and the
        // round/phase boundaries they sit between (spec §5.2). NOT on lettered consequences --
        // the engine resolves those in the same instant as the action that caused them, so a
        // number there would measure the engine, not the player.
        if (isTopLevelActionRecord(e) || e.t === 'ROUND_START' || e.t === 'PHASE_START') {
            e.ms = this.elapsedMs();
        }
        this.markIfPlaySetup(e);
        this.events.push(e);
    }

    /**
     * Play contexts whose play record has been written: what their card's own abilities write
     * after that is lettered under the play anyway, and must not be marked as its setup (an Ambush
     * trigger would then follow the card into its attack). Keyed weakly by the engine context; a
     * rollback rebuilds contexts, so a stale entry can never match again.
     */
    private readonly announcedPlays = new WeakSet<object>();

    /** Every play context on the resolver chain is announced once a top-level action is written. */
    private noteAnnouncedPlay(): void {
        for (let r = readOr<any>(() => this.game.currentAbilityResolver, null); r != null; r = readOr<any>(() => r.parentResolver, null)) {
            const c = r.context;
            if (c != null && readOr(() => c.ability?.isPlayCardAbility?.() === true, false)) {
                this.announcedPlays.add(c);
            }
        }
    }

    /**
     * Tells the writer's linker that `e` is part of a play still being set up (spec §9.1: a
     * record belongs to the action whose targeting or cost payment it records).
     *
     * A play pays its costs before it is announced, so those records -- Exploit's choices and
     * defeat, a card discarded instead of paying -- arrive numbered under the previous action,
     * and nothing in them names the play. The engine knows: the ability resolving is the play,
     * and it has not reached its effect yet. Once it has, the play is announced and what follows
     * is lettered under it anyway. An action ability's costs are paid after it is announced, so
     * only plays need this.
     */
    private markIfPlaySetup(e: GameEvent): void {
        const resolver = readOr<any>(() => this.game.currentAbilityResolver, null);
        const context = resolver?.context;
        if (context == null || context.source == null) {
            return;
        }
        const isPlay = (c: any) => readOr(() => c?.ability?.isPlayCardAbility?.() === true, false);
        if (isPlay(context)) {
            // Its costs and targeting, and then whatever its effect does before the play is
            // announced: the card arriving, and the effect its own entering ability started.
            if (context.stage !== Stage.Effect || !this.announcedPlays.has(context)) {
                markPlaySetup(e, this.idOf(context.source));
            }
            return;
        }
        // The played card's own ability resolving while the play puts it into play, before the
        // play is announced: Clone's "enter play as a copy" -- its choice, its ABILITY_ACTIVATE and
        // the effect it starts on itself. The engine knows the play is still resolving (it is an
        // ancestor resolver) and has not been announced; position alone could not say so.
        for (let outer = readOr<any>(() => resolver.parentResolver, null); outer != null; outer = readOr<any>(() => outer.parentResolver, null)) {
            const playContext = outer.context;
            if (isPlay(playContext)) {
                if (playContext.source === context.source && !this.announcedPlays.has(playContext)) {
                    markPlaySetup(e, this.idOf(context.source));
                }
                return;
            }
        }
    }

    /**
     * Milliseconds from the header's `Date` to now.
     *
     * Resolved from the same expression the header's `Date` is built from, so the two cannot
     * disagree about when zero was. `startedAt` is set when play begins and never moves after
     * that, so every record in a game shares one origin. Clamped at zero: a record written
     * before `startedAt` was set would otherwise be negative, which is not a duration.
     */
    private elapsedMs(): number {
        const origin = readOr<Date | undefined>(() => this.game.startedAt ?? this.game.createdAt, undefined);
        return Math.max(0, Date.now() - (origin?.getTime() ?? this.startedRecordingMs));
    }

    /**
     * Capture a rollback checkpoint the first time the recorder does anything under a new
     * snapshot id. The game takes a state snapshot before the effects it precedes, so the first
     * recorder activity afterward captures the lengths + counters + tokenParents as they were
     * *at that snapshot* (before its events). Keyed off snapshotManager.currentSnapshotId, which
     * is restored to the rolled-back value on undo. No-op when there is no snapshot manager
     * (unit-test stubs).
     *
     * Called from push() AND from every place that mutates a counter before pushing (nextSeq,
     * syncRound, the phase handlers). Checkpointing only on push captured counters that had
     * already advanced: an undo to the start of the action phase restored `currentRound` to
     * the new round, so the re-run start of phase saw nothing to sync and the round's
     * ROUND_START (and its keyframe) was gone for good; a redo after any undo skipped seq
     * numbers the same way.
     */
    private maybeCheckpoint(): void {
        let snapshotId: number;
        try {
            snapshotId = this.game.snapshotManager?.currentSnapshotId ?? -1;
        } catch {
            return;
        }
        this.checkpoint(snapshotId);
    }

    /**
     * Resolve a player to its seat. Accepts an engine Player-like object (with `id`)
     * or returns seat 1 as a defensive fallback when the player is missing.
     */
    private seatOf(player: any): Seat {
        if (player?.id == null) {
            return 1;
        }
        return this.resolver.seat(player.id);
    }

    /**
     * Whose turn it is to act, when the engine says. Undefined outside the action phase, so the
     * field is simply omitted rather than reporting a stale seat.
     */
    private activeSeat(): Seat | undefined {
        const player = readOr<any>(() => this.game.actionPhaseActivePlayer, null);
        return player?.id != null ? this.resolver.seat(player.id) : undefined;
    }

    /** The seat holding the initiative: who is first active player this round. */
    private initiativeSeat(): Seat | undefined {
        const player = readOr<any>(() => this.game.initiativePlayer ?? this.game.actionPhaseActivePlayer, null);
        return player?.id != null ? this.resolver.seat(player.id) : undefined;
    }

    /** Resolve a card-like engine object to its stable SET#NUM[:copy] id. */
    private idOf(card: any): string {
        if (card?.uuid == null) {
            return 'unknown';
        }
        return this.resolver.cardId(card.uuid);
    }

    /**
     * Map an engine damage/heal target to either a base ref `base@<seat>` or a card id.
     * Mirrors how the v1.0 `OnDamageDealt` handler resolves the target card, but adds
     * the 1.0 base-vs-card distinction the fold relies on (`base@<seat>` snaps baseHp).
     */
    private targetRef(target: any): string {
        try {
            if (target?.isBase?.()) {
                const owner = target.controller ?? target.owner;
                return `base@${this.seatOf(owner)}`;
            }
        } catch {
            // fall through to card id
        }
        return this.idOf(target);
    }

    /**
     * What CAUSED a damage, heal or defeat: `base@N` for a base, a card id for a card, and
     * undefined when the cause is no card at all. The rules themselves deal damage -- drawing
     * from an empty deck -- through the engine's framework effect source, which is not a card;
     * naming it by `idOf` wrote its display string as an id ("Framework effect", then
     * "Framework effect:2") that no `%%% CARDS` entry or card database resolves.
     */
    private sourceRef(source: any): string | undefined {
        const isCard = readOr(() => source?.setId != null || source?.isToken?.() === true || source?.isBase?.() === true, false);
        if (!isCard) {
            return undefined;
        }
        const ref = this.targetRef(source);
        return ref === 'unknown' ? undefined : ref;
    }

    /**
     * Map engine zone names to the short SWU-PGN/1.0 vocabulary. Only the two arena
     * zones differ (`groundArena`→`ground`, `spaceArena`→`space`); all other engine
     * zone strings (`deck`, `discard`, `hand`, `resource`, `base`, …) already match the
     * spec vocabulary and pass through unchanged.
     */
    private normalizeZone(zoneName: string | undefined): string {
        switch (zoneName) {
            case ZoneName.GroundArena: return 'ground';
            case ZoneName.SpaceArena: return 'space';
            default: return zoneName ?? '';
        }
    }

    /**
     * The record for a token-upgrade gain (`delta` 1) or removal (`delta` -1), against `hostId`.
     *
     * Gain and removal go through this one place so a kind can never be recorded on the way on
     * but forgotten on the way off — which is exactly how advantage and experience ended up
     * permanently stuck on their hosts.
     */
    private tokenRecord(seq: string, kind: TokenUpgradeKind, hostId: string, delta: 1 | -1): GameEvent {
        if (kind === 'shield') {
            return delta === 1
                ? { seq, t: 'SHIELD_GAIN', card: hostId }
                : { seq, t: 'SHIELD_USE', card: hostId };
        }
        if (kind === 'experience') {
            return { seq, t: 'EXPERIENCE_GAIN', card: hostId, count: delta };
        }
        return { seq, t: 'STATUS_TOKEN', card: hostId, token: kind.status, count: delta };
    }

    /**
     * True when `seq` belongs to the action currently being recorded.
     *
     * Sub-events share their action's seq and add a letter (`R1.A.7` -> `R1.A.7a`), so a prefix
     * match is right as long as the next character isn't a digit -- otherwise `R1.A.7` would also
     * claim `R1.A.70`.
     */
    private inCurrentAction(seq: string): boolean {
        const prefix = this.buildSeq(true);
        if (seq === prefix) {
            return true;
        }
        return seq.startsWith(prefix) && !(/^[0-9]/).test(seq.slice(prefix.length));
    }

    /**
     * Name `hostId` on the upgrade's entry MOVE and, for a played upgrade, on its PLAY_UPGRADE,
     * and correct the MOVE's `kind` to the role the event actually enacts.
     *
     * The `kind` correction is the point of this for pilots. A pilot (Han Solo, Has His
     * Moments; Academy Graduate) is a unit card played onto a vehicle AS an upgrade, and
     * `isUpgrade()` only becomes true once it is attached -- which happens after its MOVE was
     * emitted. So the MOVE went out saying `kind: 'unit'`, and a reader that trusts it (as
     * `applyMoveCounts` does) put a standalone body in the arena that no keyframe agrees with.
     * An event's `kind` states the role THAT EVENT enacts, which is only knowable here.
     * Only arena-bound MOVEs are corrected: those are the ones a reader turns into arena
     * membership, and the card really was an ordinary card in hand before this.
     *
     * The engine moves an upgrade into play BEFORE attaching it, so these records were all
     * emitted while the host was still unknown. The scan is bounded to the action being
     * recorded: an earlier action's MOVE of the same card belongs to a different attachment and
     * must not be rewritten. (A played upgrade emits MOVE, then the attach, then PLAY_UPGRADE,
     * so looking only at the immediately preceding event -- all the token path needed -- misses
     * it; PLAY_UPGRADE additionally reads its host directly at emission time.)
     */
    private backfillAttachedTo(upgradeId: string, hostId: string): boolean {
        let named = false;
        for (let i = this.events.length - 1; i >= 0; i--) {
            const e = this.events[i];
            if (!this.inCurrentAction(e.seq)) {
                return named;
            }
            if (e.t === 'MOVE' && e.card === upgradeId) {
                // Only the MOVE that lands the card where its host is enacts the attachment: into
                // an arena for a unit host, into `base` for a base host (Fortify). Spec §10.1 makes
                // `attachedTo` REQUIRED on that record and absent otherwise; a same-action draw of
                // the pilot into hand used to be stamped with a host it was not attached to yet.
                if (isArena(e.to) || (e.to === 'base' && hostId.startsWith('base@'))) {
                    if (e.attachedTo == null) {
                        e.attachedTo = hostId;
                    }
                    e.kind = 'upgrade';
                    named = true;
                }
            } else if (e.t === 'PLAY_UPGRADE' && e.card === upgradeId && e.target == null) {
                e.target = hostId;
            } else if (e.t === 'DEPLOY_LEADER' && e.card === upgradeId && e.target == null) {
                // A leader deployed as a pilot: the deploy is an attachment, not a body.
                e.target = hostId;
                e.kind = 'upgrade';
                named = true;
            }
        }
        return named;
    }

    private hasMoveInCurrentAction(cardId: string): boolean {
        for (let i = this.events.length - 1; i >= 0; i--) {
            const e = this.events[i];
            if (!this.inCurrentAction(e.seq)) {
                return false;
            }
            if (e.t === 'MOVE' && e.card === cardId) {
                return true;
            }
        }
        return false;
    }

    /**
     * An attachment that changed while the card stayed in its arena: an upgrade moved to another
     * host there, or a pilot ejected from a ground vehicle. The engine moves no card between zones
     * for either, so no MOVE exists to carry the change. A MOVE whose `from` and `to` are the same
     * arena says it, and the fold rebinds the card exactly as for any other arena move.
     */
    private recordInPlaceAttachment(card: any, kind: 'unit' | 'upgrade', hostId?: string): void {
        const zone = this.normalizeZone(card?.zoneName);
        if (!isArena(zone)) {
            return;
        }
        this.push({
            seq: this.nextSeq(false),
            t: 'MOVE',
            card: this.idOf(card),
            from: zone,
            to: zone,
            p: this.seatOf(card?.controller ?? card?.owner),
            kind,
            ...(hostId ? { attachedTo: hostId } : {}),
        });
    }

    /**
     * A card in the resource row changed ready state, or `amount` resources did at once.
     * Resources are counted, never named (spec §10.1): a reader has no list of resource ids to
     * apply a per-card EXHAUST/READY to, so the row's records are these two counters.
     */
    private resourceRecord(t: 'EXHAUST_RESOURCES' | 'READY_RESOURCES', player: any, amount: number): void {
        if (!(amount > 0)) {
            return;
        }
        this.push({ seq: this.nextSeq(false), t, p: this.seatOf(player), amount });
    }

    /** Write the now-final ready state onto a pending MOVE into the resource row. */
    private settleResourceMove(): void {
        const pending = this.pendingResourceMove;
        if (!pending) {
            return;
        }
        this.pendingResourceMove = null;
        if (this.isInResourceRow(pending.card) && readOr(() => pending.card.exhausted === true, false)) {
            (pending.event as any).exhausted = true;
        }
    }

    private isInResourceRow(card: any): boolean {
        try {
            return card?.zoneName === ZoneName.Resource;
        } catch {
            return false;
        }
    }

    private logError(where: string, error: unknown): void {
        this.errorCount++;
        if (this.loggedErrorCount >= SwuPgnRecorder.maxLoggedErrors) {
            return;
        }
        this.loggedErrorCount++;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`SwuPgnRecorder: error in ${where} (recording skipped): ${message}`);
        if (this.loggedErrorCount === SwuPgnRecorder.maxLoggedErrors) {
            logger.warn('SwuPgnRecorder: further recording errors will be suppressed for this game');
        }
    }

    // ── Sequence helpers (port of v1.0 scheme) ─────────────────────────────────

    private subEventLetter(n: number): string {
        // Bijective base-26 (a, b, ..., z, aa, ab, ...) so an action with more
        // than 26 sub-events still produces unique, schema-valid suffixes
        // (the seq pattern allows only [A-Za-z0-9-]). A naive 'a'+n overflows
        // past 'z' into '{', '|', ... which fail validation.
        let s = '';
        let i = n + 1;
        while (i > 0) {
            i -= 1;
            s = String.fromCharCode('a'.charCodeAt(0) + (i % 26)) + s;
            i = Math.floor(i / 26);
        }
        return s;
    }

    private buildSeq(isTopLevel: boolean): string {
        const r = `R${this.currentRound}`;
        const p = this.currentPhase;
        if (p === 'A') {
            if (isTopLevel) {
                return `${r}.${p}.${this.actionCounter}`;
            }
            return `${r}.${p}.${this.actionCounter}${this.subEventLetter(this.subEventCounter)}`;
        }
        return `${r}.${p}.${this.phaseEventCounter}`;
    }

    private nextSeq(isTopLevelAction: boolean): string {
        this.maybeCheckpoint();
        if (this.currentPhase === 'A') {
            if (isTopLevelAction) {
                this.actionCounter++;
                this.subEventCounter = 0;
                return this.buildSeq(true);
            }
            const seq = this.buildSeq(false);
            this.subEventCounter++;
            return seq;
        }
        this.phaseEventCounter++;
        return this.buildSeq(false);
    }

    /** Engine PhaseName → v1.0 abbreviation (S/A/G) for seq strings. */
    private phaseAbbr(phase: string): string {
        switch (phase) {
            case PhaseName.Setup: return 'S';
            case PhaseName.Action: return 'A';
            case PhaseName.Regroup: return 'G';
            default: return phase?.charAt(0).toUpperCase() ?? '?';
        }
    }

    /**
     * What KIND of ability this is, in the fixed vocabulary `ABILITY_ACTIVATE.kind` uses.
     *
     * Without it the only signal a reader has is the shape of the engine's ability identifier
     * (`…_action_1`, `…_triggered_0`, `mandalorian_keyword_shielded_0`, `shield_replacement_0`,
     * `reforge_anonymous`), so every reader ends up regexing an id this format never promised
     * to keep stable. The writer is the one place that can answer from the ability OBJECT.
     *
     * Epic Actions are reported as their own kind rather than as `action`, because the rules
     * track used/unused Epic Action as game state (CR 1.16) and a reader shows it differently.
     * `keyword` is the one kind the object cannot answer: a keyword ability is built as an
     * ordinary TriggeredAbility whose identifier carries a `keyword_<name>` descriptor
     * (`Card.buildGeneralAbilityProps`), so that descriptor is the engine's own answer, read
     * here once instead of by every reader.
     */
    private abilityKind(ability: any): AbilityKind | undefined {
        if (ability == null) {
            return undefined;
        }
        if (readOr(() => ability.isEpicAction === true, false)) {
            return 'epic';
        }
        const id = readOr<unknown>(() => ability.abilityIdentifier, undefined);
        if (typeof id === 'string' && (/_keyword_/).test(id)) {
            return 'keyword';
        }
        return ABILITY_KIND_OF[readOr<AbilityType>(() => ability.type, undefined)];
    }

    /** Engine PhaseName → 1.0 reader vocabulary ('setup'|'action'|'regroup'). */
    private phaseVocab(phase: string): ReducedState['phase'] {
        switch (phase) {
            case PhaseName.Setup: return 'setup';
            case PhaseName.Action: return 'action';
            case PhaseName.Regroup: return 'regroup';
            // Spec §6.4 fixes PHASE_START.phase to exactly setup/action/regroup. Lowercasing an
            // unknown engine phase would silently emit a value outside that vocabulary, which a
            // conforming reader is entitled to reject. Clamp instead, and say so in the log.
            default:
                this.logError('phaseVocab', new Error(`unknown engine phase "${phase}", recorded as "setup"`));
                return 'setup';
        }
    }

    /**
     * Advance round tracking when a new round begins, emitting ROUND_START exactly once
     * per round. Driven by `game.roundNumber` rather than OnBeginRound: that event never
     * reaches `.on()` listeners (known engine quirk), but OnPhaseStarted does fire, so we
     * re-sync the round there. Idempotent.
     */
    private syncRound(): void {
        const round = this.game.roundNumber ?? this.currentRound;
        if (round <= this.currentRound) {
            return;
        }
        this.maybeCheckpoint();
        this.currentRound = round;
        this.clearLimitedUses(['phase', 'round']);
        this.phaseEventCounter = 0;
        this.actionCounter = 0;
        this.subEventCounter = 0;
        // Emit a full ReducedState keyframe when the resolver can project one (SwuPgnGameAdapter). The
        // 1.0 reader uses it both as a fast-forward anchor and as an integrity checkpoint
        // (checkKeyframes folds forward and asserts the running fold equals each keyframe).
        // Absent a resolver projection, ROUND_START stays valid without a keyframe.
        this.syncStats();
        const event: GameEvent = {
            seq: `R${this.currentRound}.start`,
            t: 'ROUND_START',
            round: this.currentRound,
            // The initiative holder is the round's first active player (CR 5.4.1.b); the engine
            // copies it to the action-phase active player when the round begins, so either names it.
            ...(this.initiativeSeat() != null ? { active: this.initiativeSeat() } : {}),
        };
        const keyframe = this.projectKeyframe();
        if (keyframe) {
            event.keyframe = keyframe;
        }
        this.push(event);
    }

    /**
     * The two round-scoped keyframe fields the engine has already cleared by the time
     * OnRoundEnded fires, recovered for the ROUND_END snapshot.
     *
     * `ActionPhase.tearDownActionPhase` sets `isInitiativeClaimed = false` at the END of the
     * action phase, and `Phase.endPhase` nulls `currentPhase` (which the projection maps to
     * 'setup') — both before the round-ended step runs. So projecting the live engine there
     * stamps the swept-up between-rounds state under the finished round's seq: every round
     * that claimed initiative reported `initiativeTaken: false`, breaking §14's "keyframe
     * equals the fold at that seq" (checkKeyframes flagged one mismatch per claimed round),
     * and every ROUND_END claimed phase 'setup' instead of the regroup it just finished.
     *
     * Recovered from the stream already written rather than from newly tracked state: those
     * events are the very thing the reader folds, so the keyframe agrees with the fold by
     * construction, and `rollbackTo` truncates them — an undo past a claim corrects this for
     * free, with no new field to restore at a checkpoint. The scan stops at this round's
     * ROUND_START, so it walks one round of events, once per round.
     */
    private roundScopedKeyframeFields(): { phase?: ReducedState['phase']; initiativeTaken: boolean } {
        let phase: ReducedState['phase'] | undefined;
        let initiativeTaken = false;
        for (let i = this.events.length - 1; i >= 0; i--) {
            const event = this.events[i];
            if (event.t === 'ROUND_START') {
                break;
            }
            if (event.t === 'CLAIM_INITIATIVE') {
                initiativeTaken = true;
            } else if (event.t === 'PHASE_START' && phase === undefined) {
                // The last phase to start this round — regroup in a normal round, but an
                // additional phase if a card granted one, so it is read rather than assumed.
                phase = event.phase as ReducedState['phase'];
            }
        }
        // No PHASE_START this round means there is nothing better to say than what the
        // projection already put there.
        return phase === undefined ? { initiativeTaken } : { phase, initiativeTaken };
    }

    /**
     * Project a round keyframe, or `undefined` if a complete one can't be produced.
     *
     * A keyframe is authoritative: the reader REPLACES its whole running state with it
     * (spec §13). So a keyframe that is missing a seat does not merely lose detail, it
     * ERASES that player's board — hand size, resources and in-play cards all reset, and
     * every later fold is wrong. An absent keyframe is harmless by comparison: the reader
     * just keeps folding deltas. Therefore a keyframe is attached only when it is complete
     * for both seats; anything else is dropped and logged.
     */
    private projectKeyframe(): ReducedState | undefined {
        this.settleResourceMove();
        try {
            this.syncEffects();
        } catch (error) {
            this.logError('syncEffects', error);
        }
        if (!this.resolver.reducedState) {
            return undefined;
        }
        try {
            const keyframe = this.resolver.reducedState(this.currentRound);
            const seatedPlayerCount = this.game.getPlayers?.()?.length ?? 2;
            const missing = ([1, 2] as Seat[]).filter((seat) => keyframe.players[seat] == null);
            // Before both seats exist there is nothing to be incomplete about; once the game
            // is seated, a missing seat means a failed projection.
            if (seatedPlayerCount >= 2 && missing.length > 0) {
                this.logError(
                    'projectKeyframe',
                    new Error(`incomplete keyframe at R${this.currentRound}.start: no state for seat(s) ${missing.join(', ')}`)
                );
                return undefined;
            }
            return keyframe;
        } catch (error) {
            this.logError('projectKeyframe', error);
            return undefined;
        }
    }

    /**
     * Write a `STATS` record for every in-play unit whose live power, HP, keywords or other
     * attributes (`liveStats`) differ from the last one written for it, and forget units that
     * left play (so a return writes fresh).
     *
     * Runs after every engine event, because that is the only honest granularity: a lasting
     * effect ("+3/+0 for this attack"), Raid, Grit, an upgrade landing or leaving -- all of it
     * changes a unit's numbers without any event naming the change. A reader with no rules
     * engine cannot derive them; this tells it. Also run just before a keyframe is projected,
     * so the snapshot never gets ahead of the deltas within one engine event.
     */
    private syncStats(): void {
        let players: any[];
        try {
            players = this.game.getPlayers?.() ?? [];
        } catch {
            return;
        }
        const seen = new Set<string>();
        for (const player of players) {
            let units: any[];
            try {
                units = player?.getArenaUnits?.() ?? [];
            } catch {
                continue;
            }
            for (const unit of units) {
                if (unit?.uuid == null) {
                    continue;
                }
                const stats = liveStats(unit, (c) => this.idOf(c));
                if (!stats) {
                    continue;
                }
                seen.add(unit.uuid);
                const key = JSON.stringify(stats);
                if (this.lastStats.get(unit.uuid) === key) {
                    continue;
                }
                this.lastStats.set(unit.uuid, key);
                this.push({ seq: this.nextSeq(false), t: 'STATS', card: this.idOf(unit), ...stats });
            }
        }
        for (const uuid of [...this.lastStats.keys()]) {
            if (!seen.has(uuid)) {
                this.lastStats.delete(uuid);
            }
        }
    }

    // ── Lasting and delayed effects (spec §10.1 EFFECT_START / EFFECT_END, [W-48]) ──

    /** The effect state a checkpoint held, put back by `rollbackTo`. */
    private restoreEffects(boundary: SwuPgnRecorder['checkpoints'][number]): void {
        this.effectIds.clear();
        for (const [uuid, fx] of boundary.effectIds) {
            this.effectIds.set(uuid, fx);
        }
        this.effectObjects.clear();
        for (const [uuid, effect] of boundary.effectObjects) {
            this.effectObjects.set(uuid, effect);
        }
        this.effectTargets.clear();
        for (const [fx, targets] of boundary.effectTargets) {
            this.effectTargets.set(fx, new Set(targets));
        }
        this.effectTargetObjects.clear();
        for (const [ref, target] of boundary.effectTargetObjects) {
            this.effectTargetObjects.set(ref, target);
        }
        this.effectInfo.clear();
        for (const [fx, info] of boundary.effectInfo) {
            this.effectInfo.set(fx, info);
        }
        this.nextEffectNumber = boundary.nextEffectNumber;
        this.pendingEffects = [];
        this.effectsBeforeApply = null;
    }

    /** The engine's active ongoing effects: lasting, delayed and constant alike. */
    private engineEffects(): readonly any[] {
        return readOr<readonly any[]>(() => this.game.ongoingEffectEngine?.effects ?? [], []);
    }

    /**
     * Whether an engine effect object still holds: it is in the engine's active set and, when it
     * applies to players, at least one of them still carries it. The engine consumes some player
     * effects by stripping them from the player alone (the action phase spends an "take another
     * action" that way), leaving the object in the active set for good; such an effect is over.
     * An object whose targets are cards, or that has no targets right now (a condition that is
     * false for the moment), is judged by the active set alone.
     */
    private effectHolds(effect: any, live: ReadonlySet<any>): boolean {
        if (!live.has(effect)) {
            return false;
        }
        const players = readOr<any[]>(() => [...(effect.targets ?? [])].filter((t) => t?.isPlayer?.() === true), []);
        if (players.length === 0) {
            return true;
        }
        return players.some((player) => readOr(() => player.hasOngoingEffectInstance?.(effect) !== false, true));
    }

    /**
     * One `OnEffectApplied`: the engine objects its handler just added, filed under the stated
     * effect they belong to.
     *
     * The engine emits one event per target, and builds each target's properties (and, for a
     * card whose properties are a function, its effect factories) afresh, so no effect object is
     * shared by the targets of one effect. What they share is the game system that created the
     * events (`event.createdBySystem`, one lasting-effect or delayed-effect system per stated
     * effect: "Give each friendly Trooper unit Raid 1 for this phase. Give each friendly Jedi
     * unit Sentinel for this phase." is two systems in one `simultaneous`), the ability
     * resolution (`event.context`; a system is reused each time its ability resolves) and the
     * event window. Those three are the key; kind and engine duration are kept in it as well, for
     * an event no system built.
     */
    private collectEffect(event: any): void {
        const before = this.effectsBeforeApply;
        this.effectsBeforeApply = null;
        if (before == null) {
            return;
        }
        const created = this.engineEffects().filter((effect) => !before.has(effect));
        if (created.length === 0) {
            return; // nothing applied: a blanked target, a restriction
        }
        const delayed = created.some((effect) => readOr(() => effect.impl?.type === EffectName.DelayedEffect, false));
        const kind: PendingEffectGroup['kind'] = delayed ? 'delayed' : (event?.card != null ? 'card' : 'player');
        const context = event?.context ?? null;
        const window = readOr(() => event?.window ?? null, null);
        const engineDuration = created[0]?.duration;
        const system = readOr<object | null>(() => event?.createdBySystem ?? null, null);
        let group = this.pendingEffects.find((g) => g.system === system && g.context === context && g.window === window &&
          g.kind === kind && g.engineDuration === engineDuration);
        if (group == null) {
            group = { context, window, kind, engineDuration, system, sourceCard: event?.sourceCard ?? context?.source, objects: [] };
            this.pendingEffects.push(group);
        }
        group.objects.push(...created);
        if (window == null) {
            this.flushPendingEffects(); // no window to wait for
        }
    }

    /** Write the `EFFECT_START` of every effect collected in the window that has just resolved. */
    private flushPendingEffects(): void {
        const pending = this.pendingEffects;
        this.pendingEffects = [];
        for (const group of pending) {
            try {
                this.startEffect(group);
            } catch (error) {
                this.logError('startEffect', error);
            }
        }
    }

    private startEffect(group: PendingEffectGroup): void {
        const live = new Set(this.engineEffects());
        const objects = group.objects.filter((effect) => live.has(effect));
        if (objects.length === 0) {
            return; // gone before its window finished: it never held
        }
        const targets = new Map<string, any>();
        let seat: Seat | undefined;
        for (const effect of objects) {
            const resolved = readOr<any[]>(() => [...(effect.targets ?? [])], []);
            const matchTarget = readOr(() => effect.matchTarget, null);
            const list = resolved.length > 0 ? resolved : (matchTarget != null && typeof matchTarget === 'object' ? [matchTarget] : []);
            for (const target of list) {
                if (readOr(() => target?.isCard?.() === true, false)) {
                    const ref = this.targetRef(target);
                    if (ref !== 'unknown') {
                        targets.set(ref, target);
                    }
                } else if (target?.id != null) {
                    seat = this.seatOf(target); // a player-wide effect
                }
            }
        }

        const context = group.context;
        const delayed = group.kind === 'delayed';
        const duration = effectDurationOf(group.engineDuration, delayed);
        const first = objects[0];
        const words = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined);
        // The engine's own order for describing an effect (its ongoing-effect summary): the
        // effect's standalone title, then the creating ability's title, then the chat fragment
        // (`ongoingEffectDescription`, "remove all abilities from"), which reads only inside a sentence.
        const title = delayed
            ? words(readOr(() => first.impl.getValue()?.title, undefined))
            : words(readOr(() => first.ongoingEffect?.title, undefined));
        const abilityTitle = words(readOr(() => context?.ability?.getTitle?.(context) ?? context?.ability?.title, undefined));
        // A chat fragment can be a format string ("prevent {0} from readying"): its placeholders
        // are filled by the chat, never here, so one that has any is not words for a reader.
        const fragment = words(readOr(() => first.ongoingEffect?.ongoingEffectDescription, undefined));
        const text = title ?? abilityTitle ?? (fragment != null && !(/\{\d+\}/).test(fragment) ? fragment : undefined);
        const ability = readOr(() => context?.ability?.abilityIdentifier, undefined);
        const src = this.targetRef(group.sourceCard);
        const p = this.seatOf(context?.player ?? readOr(() => group.sourceCard?.controller, null));

        const id = `fx@${++this.nextEffectNumber}`;
        this.push({
            seq: this.nextSeq(false),
            t: 'EFFECT_START',
            id,
            src,
            p,
            ...(targets.size > 0 ? { targets: [...targets.keys()] } : (seat != null ? { seat } : {})),
            duration,
            ...(duration === 'until' ? { untilText: untilTextOf(first.until) } : {}),
            ...(typeof ability === 'string' ? { ability } : {}),
            ...(text ? { text } : {}),
        });
        for (const effect of objects) {
            const uuid = readOr(() => effect.uuid, undefined);
            if (uuid != null) {
                this.effectIds.set(uuid, id);
                this.effectObjects.set(uuid, effect);
            }
        }
        this.effectTargets.set(id, new Set(targets.keys()));
        for (const [ref, card] of targets) {
            this.effectTargetObjects.set(ref, { card, inPlay: readOr(() => card?.isInPlay?.() === true, false) });
        }
        this.effectInfo.set(id, { duration, delayed, sourceCard: group.sourceCard });
    }

    /**
     * Write the ends of effects the engine no longer holds, and the partial ends of effects whose
     * target left play (spec §10.1). Removals emit nothing in the engine, so this diffs the engine's
     * active set against what was written. Runs before and after every engine event (see `on`) and
     * before a keyframe, so a keyframe's `effects` never gets ahead of the records.
     */
    private syncEffects(): void {
        if (this.effectInfo.size === 0) {
            return;
        }
        const live = new Set(this.engineEffects());
        const uuidsOf = new Map<string, string[]>();
        for (const [uuid, fx] of this.effectIds) {
            uuidsOf.set(fx, [...(uuidsOf.get(fx) ?? []), uuid]);
        }
        const leftPlay = (ref: string): boolean => {
            const target = this.effectTargetObjects.get(ref);
            return target?.inPlay === true && !ref.startsWith('base@') && !readOr(() => target.card?.isInPlay?.() === true, false);
        };

        for (const [fx, info] of [...this.effectInfo]) {
            const objects = (uuidsOf.get(fx) ?? []).map((uuid) => this.effectObjects.get(uuid));
            const targets = this.effectTargets.get(fx) ?? new Set<string>();
            if (!objects.some((effect) => this.effectHolds(effect, live))) {
                const left = [...targets].filter(leftPlay);
                let reason: EffectEndReason = 'expired';
                if (info.delayed && objects.some((effect) =>
                    readOr(() => effect.impl.getValue().limit.isAtMax(effect.context.player) === true, false))) {
                    reason = 'fired';
                } else if (info.duration === 'whileSourceInPlay' && !readOr(() => info.sourceCard?.isInPlay?.() === true, false)) {
                    reason = 'sourceLeft';
                } else if (targets.size > 0 && left.length === targets.size) {
                    reason = 'targetLeft';
                }
                this.push({
                    seq: this.nextSeq(false), t: 'EFFECT_END', id: fx, reason,
                    ...(reason === 'targetLeft' ? { targets: left } : {}),
                });
                this.forgetEffect(fx);
                continue;
            }
            const left = [...targets].filter(leftPlay);
            if (left.length === 0) {
                continue;
            }
            // A partial end that takes the last target IS the effect's end: nothing more is
            // written for it, even while an engine object (a "for the rest of the game" one, which
            // the engine keeps when its target leaves) lingers.
            this.push({ seq: this.nextSeq(false), t: 'EFFECT_END', id: fx, reason: 'targetLeft', targets: left });
            for (const ref of left) {
                targets.delete(ref);
            }
            if (targets.size === 0) {
                this.forgetEffect(fx);
            }
        }
    }

    private forgetEffect(fx: string): void {
        this.effectInfo.delete(fx);
        this.effectTargets.delete(fx);
        for (const [uuid, id] of [...this.effectIds]) {
            if (id === fx) {
                this.effectIds.delete(uuid);
                this.effectObjects.delete(uuid);
            }
        }
        const stillTargeted = new Set([...this.effectTargets.values()].flatMap((targets) => [...targets]));
        for (const ref of [...this.effectTargetObjects.keys()]) {
            if (!stillTargeted.has(ref)) {
                this.effectTargetObjects.delete(ref);
            }
        }
    }

    /**
     * The board's `effects` for a keyframe (spec §11, §13): every written effect the engine still
     * holds an object of, in start order, with the targets it has left.
     */
    public activeEffects(): ActiveEffect[] {
        const live = new Set(this.engineEffects());
        const holding = new Set<string>();
        for (const [uuid, fx] of this.effectIds) {
            if (this.effectHolds(this.effectObjects.get(uuid), live)) {
                holding.add(fx);
            }
        }
        const out: ActiveEffect[] = [];
        for (const event of this.events) {
            if (event.t !== 'EFFECT_START' || !holding.has(event.id) || !this.effectInfo.has(event.id)) {
                continue;
            }
            const targets = [...(this.effectTargets.get(event.id) ?? [])];
            out.push({
                id: event.id,
                src: event.src,
                p: event.p,
                ...(targets.length > 0 ? { targets } : {}),
                ...(event.seat != null && targets.length === 0 ? { seat: event.seat } : {}),
                duration: event.duration,
            });
        }
        return out;
    }

    // ── Limited abilities, blind and simultaneous groups (spec §10.1, §10.2) ─────

    /** Forget the uses a boundary clears, as the fold does at PHASE_START / ROUND_START. */
    private clearLimitedUses(pers: readonly LimitPer[]): void {
        for (const [card, used] of [...this.limitedUses.entries()]) {
            for (const per of pers) {
                used.delete(per);
            }
            if (used.size === 0) {
                this.limitedUses.delete(card);
            }
        }
        for (const [key, entry] of [...this.gainedUses.entries()]) {
            if (pers.includes(entry.per)) {
                this.gainedUses.delete(key);
            }
        }
    }

    /** Forget every use of `ref` (an `ABILITY_RESET` of the card, or of one `ability` of it). */
    private forgetUses(ref: string, ability?: string): void {
        if (ability == null) {
            for (const key of [...this.limitedUses.keys()]) {
                if (key.slice(key.indexOf('|') + 1) === ref) {
                    this.limitedUses.delete(key);
                }
            }
        }
        for (const [key, entry] of [...this.gainedUses.entries()]) {
            if (entry.card === ref && (ability == null || entry.ability === ability)) {
                this.gainedUses.delete(key);
            }
        }
    }

    /** True when the fold still counts a use of `ref` for some seat. */
    private hasUses(ref: string): boolean {
        for (const key of this.limitedUses.keys()) {
            if (key.slice(key.indexOf('|') + 1) === ref) {
                return true;
            }
        }
        return false;
    }

    /**
     * The gained limited-ability uses the fold still counts, with the engine limit each is counted
     * on, for the keyframe projection: the card may no longer hold the ability (see `gainedUses`).
     */
    public heldGainedUses(): { seat: Seat; card: string; ability: string; limit: any; player: any }[] {
        return [...this.gainedUses.values()];
    }

    /**
     * The limited-ability uses of the phase that just ended, read back from the stream, for the
     * ROUND_END keyframe. The engine clears per-phase uses when a phase ENDS (`OnPhaseEnded`), so by
     * the round's end the regroup phase's are gone, while the fold clears them only at the next
     * PHASE_START or ROUND_START; this restores what the fold still holds at that seq. The scan
     * stops at the phase's PHASE_START, and a card reset since a use (`ABILITY_RESET`) drops it.
     */
    private phaseUsesSincePhaseStart(): Map<Seat, AbilityUse[]> {
        const uses = new Map<Seat, AbilityUse[]>();
        const reset = new Set<string>();
        for (let i = this.events.length - 1; i >= 0; i--) {
            const e = this.events[i] as any;
            if (e.t === 'PHASE_START' || e.t === 'ROUND_START') {
                break;
            }
            if (e.t === 'ABILITY_RESET') {
                reset.add(e.ability == null ? e.card : `${e.card}|${e.ability}`);
                continue;
            }
            if (e.t !== 'ABILITY_ACTIVATE' || e.limit?.per !== 'phase' || typeof e.ability !== 'string') {
                continue;
            }
            if (reset.has(e.card) || reset.has(`${e.card}|${e.ability}`)) {
                continue;
            }
            const list = uses.get(e.p) ?? [];
            const entry = list.find((u) => u.card === e.card && u.ability === e.ability);
            if (entry) {
                entry.count++;
            } else {
                // Walking backwards, so the first entry seen carries the latest max.
                list.push({ card: e.card, ability: e.ability, count: 1, max: e.limit.max, per: 'phase' });
            }
            uses.set(e.p, list);
        }
        return uses;
    }

    /**
     * Write the `LOOK`s of `viewer` looking at `cards`: one per owner and zone, in the order the
     * cards were seen (spec §10.2, `[W-50]`).
     */
    private recordLook(viewer: any, cards: any[]): void {
        const groups = new Map<string, { owner: Seat; zone: string; cards: string[] }>();
        for (const card of cards) {
            const id = this.idOf(card);
            if (id === 'unknown') {
                continue;
            }
            // Whose zone: a resource row is its controller's, every other hidden zone its owner's.
            const zoneOwner = readOr<any>(() => card.zone?.owner, null) ?? card?.controller ?? card?.owner;
            const owner = this.seatOf(zoneOwner);
            const zone = this.normalizeZone(card?.zoneName);
            const key = `${owner}|${zone}`;
            const group = groups.get(key) ?? { owner, zone, cards: [] };
            group.cards.push(id);
            groups.set(key, group);
        }
        for (const group of groups.values()) {
            this.push({
                seq: this.nextSeq(false),
                t: 'LOOK',
                p: this.seatOf(viewer),
                owner: group.owner,
                zone: group.zone,
                cards: group.cards,
                count: group.cards.length,
            });
        }
    }

    /**
     * The seq of the record that asked for `context`'s choices: the latest `ABILITY_ACTIVATE` of its
     * source card in the current action, else the current action's own record.
     */
    private askingSeq(context: any): string | undefined {
        const source = readOr(() => this.targetRef(context?.source), 'unknown');
        let action: string | undefined;
        const top = this.buildSeq(true);
        for (let i = this.events.length - 1; i >= 0 && this.inCurrentAction(this.events[i].seq); i--) {
            const e = this.events[i] as any;
            if (e.t === 'ABILITY_ACTIVATE' && e.card === source) {
                return e.seq;
            }
            if (e.seq === top) {
                action = e.seq;
            }
        }
        return action ?? this.events[this.events.length - 1]?.seq;
    }

    /**
     * Put `record` in the `simul` group of the engine event window it resolved in (spec §10.2,
     * `[W-53]`). A new window starts a new group; the group's first record is marked when a second
     * joins it, so a lone record never carries `simul`.
     */
    private joinSimul(record: GameEvent, window: any): void {
        if (window == null) {
            return;
        }
        if (this.simulGroup?.window !== window) {
            this.simulGroup = { window, first: record, seq: record.seq };
            return;
        }
        this.simulGroup.first.simul = this.simulGroup.seq;
        record.simul = this.simulGroup.seq;
    }

    /** How many events of the window match `name` (and `test`), 0 when it cannot be read. */
    private windowEventCount(window: any, name: EventName, test: (event: any) => boolean = () => true): number {
        return readOr(() => (window?.events ?? []).filter((e: any) => e?.name === name && test(e)).length, 0);
    }

    /**
     * Subscribe with the recorder's one error policy: a handler that throws is logged
     * (rate-limited) and its record skipped, and gameplay never sees the exception. Every
     * event, handled or not, is followed by a stats sync (see syncStats).
     */
    private on(name: EventName, fn: (event: any) => void, { syncAfter = true }: { syncAfter?: boolean } = {}): void {
        this.game.on(name, (event: any) => {
            try {
                this.settleResourceMove();
            } catch (error) {
                this.logError('settleResourceMove', error);
            }
            // An effect the engine removed since the last event (at a phase's end, an attack's
            // end) ended before this event, so its end is written before this event's records.
            try {
                this.syncEffects();
            } catch (error) {
                this.logError('syncEffects', error);
            }
            try {
                fn(event);
            } catch (error) {
                this.logError(name, error);
            }
            if (!syncAfter) {
                return;
            }
            try {
                this.syncStats();
            } catch (error) {
                this.logError('syncStats', error);
            }
            try {
                this.syncEffects();
            } catch (error) {
                this.logError('syncEffects', error);
            }
        });
    }

    // ── Listener registration ──────────────────────────────────────────────────

    private registerListeners(): void {
        // Lasting and delayed effects (spec §10.1). The handler of each OnEffectApplied adds the
        // engine objects; the set just before it tells which. The window's game-state check then
        // resolves their targets, and its postResolve emit, after every event of the window, is
        // where the EFFECT_START can name them all.
        this.game.on(`${EventName.OnEffectApplied}:preResolve`, () => {
            try {
                this.effectsBeforeApply = new Set(this.engineEffects());
            } catch (error) {
                this.logError('effectsBeforeApply', error);
            }
        });
        this.on(EventName.OnEffectApplied, (event: any) => this.collectEffect(event));
        this.game.on(`${EventName.OnEffectApplied}:postResolve`, () => {
            try {
                this.flushPendingEffects();
            } catch (error) {
                this.logError('flushPendingEffects', error);
            }
        });

        this.on(EventName.OnRoundEnded, () => {
            // ROUND_END carries a keyframe too. Now that keyframes are complete and
            // trustworthy, an end-of-round snapshot is the cheapest place to catch a round's
            // worth of fold drift: it halves the window between checkpoints at the cost of
            // one snapshot per round.
            this.syncStats();
            const event: GameEvent = { seq: `R${this.currentRound}.end`, t: 'ROUND_END', round: this.currentRound };
            const keyframe = this.projectKeyframe();
            if (keyframe) {
                Object.assign(keyframe, this.roundScopedKeyframeFields());
                for (const [seat, list] of this.phaseUsesSincePhaseStart()) {
                    const held = keyframe.players[seat]?.abilityUses;
                    if (held == null) {
                        continue;
                    }
                    for (const use of list) {
                        if (!held.some((h) => h.card === use.card && h.ability === use.ability)) {
                            held.push(use);
                        }
                    }
                }
                event.keyframe = keyframe;
            }
            this.push(event);
        });

        this.on(EventName.OnPhaseStarted, (event: any) => {
            this.maybeCheckpoint();
            this.syncRound();
            const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
            this.currentPhase = this.phaseAbbr(phaseName);
            // A phase a card grants in the same round (Max Rebo's extra regroup) continues its
            // phase's numbering: the round already has this phase's `start`, and every seq in a
            // file is unique (spec §9.1). The engine says which phases are granted ones.
            const additional = event?.additional === true;
            if (!additional) {
                this.phaseEventCounter = 0;
                this.actionCounter = 0;
                this.subEventCounter = 0;
            }
            // The PHASE_START below clears the fold's per-phase uses.
            this.clearLimitedUses(['phase']);
            this.push({
                seq: additional ? this.nextSeq(this.currentPhase === 'A') : `R${this.currentRound}.${this.currentPhase}.start`,
                t: 'PHASE_START',
                phase: this.phaseVocab(phaseName),
                ...(this.activeSeat() != null ? { active: this.activeSeat() } : {}),
            });
        });

        this.on(EventName.OnPhaseEnded, (event: any) => {
            const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
            const letter = this.phaseAbbr(phaseName);
            const additional = event?.additional === true;
            this.push({
                seq: additional ? this.nextSeq(letter === 'A') : `R${this.currentRound}.${letter}.end`,
                t: 'PHASE_END',
                phase: this.phaseVocab(phaseName),
            });
        });

        // ── Top-level player actions ─────────────────────────────────────────

        this.on(EventName.OnCardPlayed, (event: any) => {
            const card = event?.card;
            const player = event?.player ?? card?.owner;
            const playType: string = event?.playType ?? '';
            const printedType: string = card?.printedType ?? '';
            let t: GameEvent['t'] = 'PLAY';
            if (printedType === CardType.Event) {
                t = 'PLAY_EVENT';
            } else if (
                playType === PlayType.Piloting ||
                printedType === CardType.BasicUpgrade ||
                printedType === CardType.LeaderUpgrade ||
                printedType === CardType.TokenUpgrade ||
                printedType === CardType.NonLeaderUnitUpgrade
            ) {
                t = 'PLAY_UPGRADE';
            } else if (playType === PlayType.Smuggle) {
                t = 'PLAY_SMUGGLE';
            }
            // Name the host on the way out. The engine attaches an upgrade BEFORE it emits
            // OnCardPlayed, so the parent is already reachable here -- and it has to be
            // recorded, because `kind: 'upgrade'` keeps the card out of the arena and
            // `PLAY_UPGRADE.target` is the only thing left that tells a reader where it went.
            // Without it the fold has nowhere to put the card and the upgrade disappears from
            // the replay entirely. (backfillAttachedTo covers the reverse order, where the
            // attach lands after the play.)
            const host = t === 'PLAY_UPGRADE' ? attachedHost(card) : null;
            const seq = this.nextSeq(true);
            const playRecord: GameEvent = {
                seq,
                t,
                p: this.seatOf(player),
                card: this.idOf(card),
                zone: this.normalizeZone(card?.zoneName),
                target: host ? this.targetRef(host) : undefined,
                // PRINTED cost (spec §10.1). The resources actually paid -- after aspect
                // penalties, discounts and Exploit -- are resolved inside the engine's cost
                // payment and never reach this event; `costs` here is targeted-adjuster
                // bookkeeping, not an amount.
                cost: typeof card?.cost === 'number' ? card.cost : undefined,
            };
            this.push(playRecord);
        });

        this.on(EventName.OnLeaderDeployed, (event: any) => {
            const card = event?.card;
            const player = card?.owner ?? event?.player;
            // A leader can deploy AS A PILOT (DeployAndAttachPilotLeaderSystem): the same
            // event, but the leader becomes an upgrade on `leaderAttachTarget` rather than a
            // body in the arena. Without `kind`/`target` the fold placed it as its own unit
            // that no keyframe agreed with.
            const host = event?.type === DeployType.LeaderUpgrade
                ? (event?.leaderAttachTarget ?? attachedHost(card))
                : null;
            if (host) {
                // The leader's base->arena MOVE was emitted a moment ago, under the previous
                // action's number, saying `kind: 'unit'`. The contingent OnUpgradeAttached only
                // fires after this record has taken the next number, so its backfill would no
                // longer reach that MOVE; correct it now, while it is still "the current action".
                this.backfillAttachedTo(this.idOf(card), this.idOf(host));
            }
            // Deploying is the player's action -- but when the leader's own Epic Action (or Action)
            // ability performed it, that ability already took this action's number, and a second
            // number would make one deploy read as two actions. File it under the ability then.
            const current = this.buildSeq(true);
            // Walk back over the current action only: its own record is the one being looked for.
            let deployedBy: GameEvent | undefined;
            for (let i = this.events.length - 1; i >= 0 && this.inCurrentAction(this.events[i].seq); i--) {
                if (this.events[i].seq === current) {
                    deployedBy = this.events[i];
                    break;
                }
            }
            const byOwnAbility = deployedBy?.t === 'ABILITY_ACTIVATE' && deployedBy.card === this.idOf(card) &&
              (deployedBy.kind === 'epic' || deployedBy.kind === 'action');
            const seq = this.nextSeq(!byOwnAbility);
            // Which ability deployed it matters to the rules: an Epic Action is spent for the game
            // (CR 1.16 lists that as game state), an Action ability is not.
            const epic = event?.context?.ability?.isEpicAction === true;
            this.push({
                seq,
                t: 'DEPLOY_LEADER',
                p: this.seatOf(player),
                card: this.idOf(card),
                zone: this.normalizeZone(card?.zoneName),
                ...(host ? { kind: 'upgrade' as const, target: this.idOf(host) } : {}),
                ...(epic ? { epic: true } : {}),
                // PRINTED cost (spec §10.1). The resources actually paid -- after aspect
                // penalties, discounts and Exploit -- are resolved inside the engine's cost
                // payment and never reach this event; `costs` here is targeted-adjuster
                // bookkeeping, not an amount.
                cost: typeof card?.cost === 'number' ? card.cost : undefined,
            });
        });

        // A double-sided leader (Chancellor Palpatine, TWI#017) never deploys: its Action flips
        // it IN PLACE in the base zone, which changes its title, aspects and traits. No MOVE, no
        // deploy, no zone change -- so without this record nothing in the stream says the leader
        // changed, and a replay shows the starting face for the whole game.
        this.on(EventName.OnLeaderFlipped, (event: any) => {
            const card = event?.card;
            // FlipAndAttachPilotLeaderSystem raises this event too, for a pilot leader that has no
            // second face at all. `card.onStartingSide` is undefined there, which would record a
            // confident `false` and make a reader show a back side that does not exist.
            if (readOr(() => card.isDoubleSidedLeader?.() === true, false) !== true) {
                return;
            }
            const player = card?.owner ?? event?.player;
            this.push({
                seq: this.nextSeq(false),
                t: 'LEADER_FLIP',
                p: this.seatOf(player),
                card: this.idOf(card),
                // The face AFTER the flip, stated rather than toggled: a reader that joined at a
                // keyframe has an absolute value to apply, and a dropped record cannot invert
                // every later face the way a toggle would.
                onStartingSide: card?.onStartingSide === true,
            });
        });

        this.on(EventName.OnAttackDeclared, (event: any) => {
            const attack = event?.attack;
            const attacker = attack?.attacker;
            const attackingPlayer = attack?.attackingPlayer;
            const targets = attack?.getAllTargets?.() ?? [];
            const defender = targets[0] ?? null;
            const defenderType: 'unit' | 'base' = defender?.isBase?.() ? 'base' : 'unit';
            const seq = this.nextSeq(true);
            this.push({
                seq,
                t: 'ATTACK',
                p: this.seatOf(attackingPlayer),
                atk: this.idOf(attacker),
                def: defender?.isBase?.() ? `base@${this.seatOf(defender.controller ?? defender.owner)}` : this.idOf(defender),
                defenderType,
            });
        });

        // The turn passing to the opponent. It follows EVERY action, so it is not a PASS -- a
        // PASS record used to be written here, and every play and attack read as "...then
        // passed". What it is good for is settling the action that just ended: an effect one
        // step removed from its event (a Fortify upgrade grants its base an ability, and THAT
        // ability buffs units) is applied after the action's last event, so the after-every-
        // event sync would only see it under the next action. The engine state holds it here.
        this.on(EventName.OnPassActionPhasePriority, () => {
            this.syncStats();
        }, { syncAfter: false });

        // A player took the Pass action (ActionWindow.pass). Claiming a counter also ends the
        // player's turn but is its own CLAIM_INITIATIVE action and emits nothing here.
        this.on(EventName.OnPassAction, (event: any) => {
            this.syncStats();
            const seq = this.nextSeq(true);
            this.push({ seq, t: 'PASS', p: this.seatOf(event?.player) });
        }, { syncAfter: false });

        this.on(EventName.OnClaimInitiative, (event: any) => {
            const seq = this.nextSeq(true);
            this.push({ seq, t: 'CLAIM_INITIATIVE', p: this.seatOf(event?.player) });
        });

        // ── Sub-events ────────────────────────────────────────────────────────

        this.on(EventName.OnDamageDealt, (event: any) => {
            const card = event?.card;
            let source: any = null;
            if (event?.damageSource?.attack) {
                // `damageDealtBy` names the unit that dealt this damage: the defender's
                // return damage is dealt by the defender, not by the attack's attacker.
                source = event.damageSource.damageDealtBy?.[0] ?? event.damageSource.attack.attacker;
            } else if (event?.context?.source) {
                source = event.context.source;
            }
            const amt = event?.damageDealt ?? event?.amount ?? 0;
            const damageType: string = event?.type ?? '';
            const seq = this.nextSeq(false);

            // OVERWHELM is not a distinct engine event: in SWU it is excess combat damage that
            // rolls onto the defending base, emitted by AttackFlow as an OnDamageDealt with
            // DamageType.Overwhelm ('overwhelm') targeting that base (see attack/AttackFlow.ts).
            // We surface it as a dedicated OVERWHELM record (instead of DAMAGE) when the engine
            // tags the damage as overwhelm-type onto a base; the 1.0 OVERWHELM reducer snaps base
            // hp exactly like a DAMAGE-to-base record.
            // Combat damage: the attacker and the defender deal theirs at the same time (CR 6.3.5),
            // in one engine event window, so its records are one simultaneous group.
            const combatWindow = event?.damageSource?.attack != null && (damageType === 'combat' || damageType === 'overwhelm')
                ? readOr<any>(() => event.window ?? this.game.currentEventWindow, null)
                : null;

            if (damageType === 'overwhelm' && card?.isBase?.()) {
                const overwhelm: GameEvent = {
                    seq,
                    t: 'OVERWHELM',
                    p: this.seatOf(source?.controller ?? source?.owner),
                    tgt: this.targetRef(card),
                    amt,
                    hp: card?.remainingHp ?? 0,
                };
                this.push(overwhelm);
                this.joinSimul(overwhelm, combatWindow);
                this.recordLethalBaseHit(card);
                return;
            }

            const src = this.sourceRef(source);
            const damage: GameEvent = {
                seq,
                t: 'DAMAGE',
                ...(src ? { src } : {}),
                tgt: this.targetRef(card),
                amt,
                damageType,
                hp: card?.remainingHp ?? 0,
            };
            this.push(damage);
            this.joinSimul(damage, combatWindow);
            this.recordLethalBaseHit(card);
        });

        this.on(EventName.OnDamageHealed, (event: any) => {
            const card = event?.card;
            // What healed it, on the same terms as DAMAGE.src. Without it the record says a
            // base gained 2 HP and nothing at all about why, and no later record can supply it
            // -- a heal has no attack to recover the source from the way OVERWHELM does.
            // Heals are always ability-driven (HealSystem has no combat path), so the ability's
            // own source card is the answer; omitted when it can't be resolved.
            const src = this.sourceRef(event?.context?.source);
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'HEAL',
                ...(src ? { src } : {}),
                tgt: this.targetRef(card),
                amt: event?.damageHealed ?? event?.amount ?? 0,
                hp: card?.remainingHp ?? 0,
            });
        });

        // A base defeated OUTRIGHT by an ability ("You may defeat a base with 10 or less remaining
        // HP" -- Grand Moff Tarkin, Tyrant of the Outer Rim). No damage is dealt, so the base's
        // HP is not zero and nothing else in the file says it fell: the game would simply end
        // with a base still standing. `base@N` is the card, like every reference to a base.
        this.on(EventName.OnBaseDefeated, (event: any) => {
            const defeatedBy = this.sourceRef(event?.context?.source);
            this.push({
                seq: this.nextSeq(false),
                t: 'DEFEAT',
                card: this.targetRef(event?.card),
                reason: 'ability',
                ...(defeatedBy ? { defeatedBy } : {}),
            });
        });

        this.on(EventName.OnCardDefeated, (event: any) => {
            const card = event?.card;

            // Token-upgrade REMOVAL. There is no dedicated removal event for any of the three
            // token kinds: shields, experience and advantage are all token-upgrade cards, and
            // each is removed by being defeated (a shield's damage-modification replaces the
            // damage with defeat(); an Advantage defeats itself when the attack ends). So the
            // removal surfaces here, as OnCardDefeated on the token itself.
            //
            // Only shields used to be handled, which meant a gained Advantage or Experience was
            // never taken back off its host: a reader folding the stream kept the token for the
            // rest of the replay while the engine's own keyframe showed statusTokens {}. Every
            // kind now emits its decrement, so gains and removals balance.
            const removed = card?.uuid != null ? this.tokenParents.get(card.uuid) : undefined;
            const removedKind = removed?.kind ?? tokenUpgradeKind(card);
            if (removedKind) {
                // Prefer the parent remembered at attach time (the upgrade is already unattached
                // by now); fall back to a live lookup if it wasn't recorded.
                const parent = removed?.parent ?? attachedHost(card);
                if (parent) {
                    this.push(this.tokenRecord(this.nextSeq(false), removedKind, this.idOf(parent), -1));
                }
                // The token's exit MOVE, emitted after this, names no host (exits never do,
                // spec §10.1), so the remembered binding has served its purpose.
                if (card?.uuid != null) {
                    this.tokenParents.delete(card.uuid);
                }
                return;
            }

            const defeatSource = event?.defeatSource;
            // Spec §6.4 pins this to a closed set, so a reader can switch on it. It is the
            // engine's own DefeatSourceType, which is closed too -- but an event that reaches
            // here with no defeat source at all would otherwise write an empty string, a value
            // outside the set and outside the schema. Say `unknown` instead of lying.
            const reason: DefeatReason = DEFEAT_REASON_OF[defeatSource?.type] ?? 'unknown';
            let defeatedBy: any = null;
            if (defeatSource?.type === DefeatSourceType.Attack) {
                defeatedBy = defeatSource?.damageDealtBy?.[0] ?? defeatSource?.attack?.attacker;
            } else {
                defeatedBy = defeatSource?.card;
            }
            const defeatedById = this.sourceRef(defeatedBy) ?? 'unknown';
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'DEFEAT',
                card: this.idOf(card),
                reason,
                defeatedBy: defeatedById === 'unknown' ? undefined : defeatedById,
            });
        });

        this.on(EventName.OnCardMoved, (event: any) => {
            const card = event?.card;

            // OnCardMoved is emitted TWICE for an ability-driven move: once by
            // MoveCardSystem (whose props are destination/context — no zones) and once by
            // Card.postMoveSteps, which carries the authoritative originalZone/newZone. Only
            // the second describes a move, so the first is dropped. Recording it produced
            // `"from": ""` records, which are not a zone at all and forced every reader to
            // special-case the required field.
            if (event?.originalZone == null) {
                return;
            }

            const from = this.normalizeZone(event.originalZone);
            const to = this.normalizeZone(event?.newZone ?? card?.zoneName);

            // A move that doesn't change zone carries no information. Searching a deck moves
            // each examined card deck->deck on the way back, which is how two SEARCHes came to
            // produce 20% of a real game's MOVE records. Examining a card is reported by
            // SEARCH (and REVEAL); only a card that actually leaves its zone gets a MOVE.
            //
            // One exception: a token that goes base -> base has changed BASES, because each
            // seat has its own. That is how a Credit token changes hands (CreditToken.takeControl
            // re-homes it with moveTo(Base) and no OnTakeControl names the card), and it is the
            // only way `credits` moves between seats, so it is written as the TAKE_CONTROL it is.
            if (from === to) {
                // A card going resource -> resource has changed rows, and each seat has its own.
                // Taking a resource raises OnTakeControl, which records it; giving one back
                // through ResourceCardSystem (DJ's delayed effect) raises only OnCardResourced.
                // Its ready state is not final yet, so note it and record it there.
                if (from === 'resource' && card?.uuid != null) {
                    this.resourceRowChanges.add(card.uuid);
                    return;
                }
                if (from === 'base' && card?.isToken?.() && card?.uuid != null) {
                    const seat = this.seatOf(card.controller ?? card.owner);
                    this.push({
                        seq: this.nextSeq(false),
                        t: 'TAKE_CONTROL',
                        p: seat,
                        card: this.idOf(card),
                        zone: 'base',
                        from: (seat === 1 ? 2 : 1) as Seat,
                    });
                }
                return;
            }
            if (from === '' || to === '') {
                return;
            }

            // Building the decks is not a game event. Before the first shuffle every card
            // enters its deck from outsideTheGame; that is the deck list, which %%% DECKS
            // already states and the INIT record already orders. Recording it was 40 of one
            // organic game's 237 events. A token entering PLAY from outsideTheGame is kept.
            if (from === 'outsideTheGame' && to === 'deck') {
                return;
            }

            const seq = this.nextSeq(false);
            // Seat lets the 1.0 fold attribute zone-membership counts (handSize,
            // resourcesReady) and arena-card placement to a player: the engine performs
            // these via card moves, not via DRAW/RESOURCE/PLAY summary events, so MOVE is
            // the fold's source of truth for those counts.
            // `attachedTo` is NOT set here: an attaching move's host is only known once the
            // attach happens, after this record (see backfillAttachedTo), and a move OUT of an
            // arena never names one -- a reader detaches on the zone transition (spec §10.1).
            // A resource that leaves the row exhausted says so, because the fold keeps ready
            // and exhausted resources as two counts and has to know which one to decrement.
            // The engine has already reset `exhausted` for the new zone by the time this
            // fires, hence `exhaustedBeforeMove`.
            //
            // A card leaving a deck is still its owner's, and the fold counts the deck on `p`
            // (spec §12.1), so the move is the owner's even when another player put the card into
            // play (Vermillion lets the opponent play your top card). The control change that
            // came with it follows as its own TAKE_CONTROL, which re-seats the card.
            const controllerSeat = this.seatOf(card?.controller ?? card?.owner);
            const seat = from === 'deck' ? this.seatOf(card?.owner ?? card?.controller) : controllerSeat;
            const kind = cardKind(card);
            const leftExhausted = from === 'resource' && card?.exhaustedBeforeMove === true;
            const move: GameEvent = {
                seq,
                t: 'MOVE',
                card: this.idOf(card),
                from,
                to,
                p: seat,
                ...(kind ? { kind } : {}),
                ...(leftExhausted ? { exhausted: true } : {}),
            };
            this.push(move);
            if (to === 'resource') {
                // The setup and regroup prompts decide the entry state themselves, and do it after
                // this event (see pendingResourceMove); a regroup resource is also readied before
                // anything else is emitted, so the prompt is the only place that says. Everything
                // else (an ability, a stolen resource) has the engine's flag settled by the next event.
                const prompt = readOr<any>(() => this.game.getCurrentOpenPrompt?.(), null);
                if (prompt instanceof ResourcePrompt) {
                    if (prompt.entersExhausted) {
                        move.exhausted = true;
                    }
                } else {
                    this.pendingResourceMove = { event: move, card };
                }
            }
            if (controllerSeat !== seat) {
                this.push({
                    seq: this.nextSeq(false),
                    t: 'TAKE_CONTROL',
                    p: controllerSeat,
                    card: this.idOf(card),
                    zone: to,
                    from: seat,
                });
            }

            // A Leader Unit that was defeated comes home to the base zone EXHAUSTED (CR 3.4.5),
            // by direct assignment in the engine, so the move is the only place to say so.
            if (to === 'base' && isArena(from) && card?.isLeader?.()) {
                if (readOr(() => card.exhausted === true, false)) {
                    this.push({ seq: this.nextSeq(false), t: 'EXHAUST', card: this.idOf(card) });
                }
            }

            // RESOURCE is the human-readable summary of "a card became a resource", the way
            // DRAW summarises the deck->hand MOVEs beside it. It is derived from the move
            // rather than from OnCardResourced because that engine event only fires for
            // ability-driven resourcing: the setup and regroup resource steps call
            // Player.resourceCard() directly (ResourcePrompt.resourceSelectedCards), so
            // listening for it produced ZERO records across a full game's 15 resourcings.
            // Every resourcing — routine or ability-driven, including takeControl into the
            // resource zone — ends in this move, so this sees all of them exactly once.
            if (to === 'resource') {
                this.push({ seq: this.nextSeq(false), t: 'RESOURCE', p: seat, card: this.idOf(card) });
            }

            // A card discarded from hand together with others (each player's discards, CR 7.1.4a):
            // the move is part of the window's simultaneous group, with the DISCARD records.
            if (from === 'hand' && to === 'discard') {
                const window = readOr<any>(() => this.game.currentEventWindow, null);
                if (this.windowEventCount(window, EventName.OnCardDiscarded) >= 2) {
                    this.joinSimul(move, window);
                }
            }

            // A card that changes zone is a new object, and its limited abilities start unused
            // (CR 8.7); the engine resets them unless it only moved between arenas. The fold cannot
            // know that from the MOVE, so it is stated, for a card the fold still counts uses for.
            const ref = this.idOf(card);
            if (!(isArena(from) && isArena(to)) && this.hasUses(ref)) {
                this.forgetUses(ref);
                this.push({ seq: this.nextSeq(false), t: 'ABILITY_RESET', card: ref });
            }
        });

        // SHIELD_GAIN: no dedicated event. A Shield is given by generating a Shield token-upgrade
        // (GiveShieldSystem → OnTokensCreated) and then attaching it (contingent OnUpgradeAttached).
        // We emit SHIELD_GAIN only when the attached upgrade isShield(); printed upgrades get no
        // token record but have their host back-filled onto the MOVE/PLAY_UPGRADE (see the
        // `!kind` branch). Recorded against the parent unit;
        // the 1.0 reducer increments shields by `count` (default 1).
        //
        // EXPERIENCE_GAIN and STATUS_TOKEN ride the same OnUpgradeAttached event because, like
        // shields, experience and advantage are token-upgrade cards (Experience/Advantage extend
        // TokenUpgradeCard); they are "gained" by generating the token-upgrade (GiveExperienceSystem /
        // GiveAdvantageSystem → OnTokensCreated) and attaching it (contingent OnUpgradeAttached, one
        // event per token). Each token type maps to exactly one record, so nothing double-counts:
        //   isShield()          → SHIELD_GAIN      (dedicated event, shields counter)
        //   isExperience()      → EXPERIENCE_GAIN  (experience counter, +1 per attach)
        //   any other isTokenUpgrade() → STATUS_TOKEN, keyed by the token's name (advantage,
        //                          weakness, and whatever is printed next), +1 per attach
        // Normally-played, non-token upgrades are already covered by OnCardPlayed→PLAY_UPGRADE, so we
        // deliberately emit no token record for them here (a second PLAY_UPGRADE would corrupt the
        // fold); they only get their host named.
        // Who controlled an in-play printed upgrade before an attach moves it (see
        // `upgradeControllerBefore`). Observe-only: a read of the controller, nothing else.
        this.game.on(`${EventName.OnUpgradeAttached}:preResolve`, (event: any) => {
            try {
                const upgrade = event?.upgradeCard;
                if (upgrade?.uuid != null && upgrade.isInPlay?.() === true && !tokenUpgradeKind(upgrade)) {
                    this.upgradeControllerBefore.set(upgrade.uuid, this.seatOf(upgrade.controller));
                }
            } catch (error) {
                this.logError('upgradeControllerBefore', error);
            }
        });
        this.on(EventName.OnUpgradeAttached, (event: any) => {
            const upgrade = event?.upgradeCard;
            const before = upgrade?.uuid != null ? this.upgradeControllerBefore.get(upgrade.uuid) : undefined;
            if (upgrade?.uuid != null) {
                this.upgradeControllerBefore.delete(upgrade.uuid);
            }
            const parent = event?.parentCard ?? attachedHost(upgrade);
            if (!parent) {
                return;
            }
            const kind = tokenUpgradeKind(upgrade);
            if (!kind) {
                // An ordinary printed upgrade. It gets no token record -- a second
                // PLAY_UPGRADE would corrupt the fold -- but it still needs its host named.
                // `kind: 'upgrade'` correctly keeps it out of the arena, so without a host
                // there is nothing to attach it to and it folds to nowhere at all: the player
                // plays an upgrade and the replay shows nothing happening.
                if (!this.backfillAttachedTo(this.idOf(upgrade), this.targetRef(parent))) {
                    this.recordInPlaceAttachment(upgrade, 'upgrade', this.targetRef(parent));
                }
                // An attached upgrade that changed controller as it moved (Pre Vizsla takes it
                // onto one of his own units) is the upgrade form of TAKE_CONTROL, written after
                // the MOVE that names its new host (spec §10.1, `[W-56]`). A base upgrade has no
                // such form (§21 open issue 2), and none of the engine's attaches can take one.
                const now = this.seatOf(upgrade.controller);
                const zone = this.normalizeZone(readOr(() => parent.zoneName, undefined));
                if (before != null && before !== now && (zone === 'ground' || zone === 'space')) {
                    this.push({ seq: this.nextSeq(false), t: 'TAKE_CONTROL', p: now, card: this.idOf(upgrade), zone, from: before });
                }
                return;
            }
            // Remember the host for the matching removal record: by the time the token is
            // defeated it has already been unattached, so its parent is unreachable then.
            if (upgrade?.uuid != null) {
                this.tokenParents.set(upgrade.uuid, { parent, kind });
            }
            // The engine moves the token into play BEFORE attaching it, so its entry MOVE was
            // emitted while the host was still unknown. Name the host on it now, so a reader
            // never has to infer the binding from event adjacency.
            this.backfillAttachedTo(this.idOf(upgrade), this.targetRef(parent));
            this.push(this.tokenRecord(this.nextSeq(false), kind, this.idOf(parent), 1));
        });

        // A pilot ejected from a vehicle becomes a unit. From a space vehicle that is a
        // space -> ground MOVE, already written; from a ground vehicle the card never changes
        // zone and nothing else says it left its host.
        this.on(EventName.OnUpgradeUnattached, (event: any) => {
            const card = event?.upgradeCard ?? event?.card;
            if (cardKind(card) !== 'unit' || this.hasMoveInCurrentAction(this.idOf(card))) {
                return;
            }
            this.recordInPlaceAttachment(card, 'unit');
        });

        // A unit's ready/exhausted flag on ENTERING play is set by the engine directly
        // (PutIntoPlaySystem calls ready()/exhaust() on the card, RescueSystem and the leader
        // deploy likewise), so no OnCardExhausted ever reports it -- and every replay showed a
        // just-played unit ready. This fires once the put-into-play has resolved and the flag is
        // final: a unit that entered exhausted (the rule, CR 5.4.5.a) gets its EXHAUST; one that
        // entered ready (Ambush does not: it attacks exhausted; "enters ready" effects do) gets
        // nothing. Deploys as a pilot upgrade have no flag and write nothing.
        this.on(EventName.OnUnitEntersPlay, (event: any) => {
            const card = event?.card;
            let exhausted = false;
            try {
                exhausted = card?.exhausted === true;
            } catch {
                return; // an upgrade, or a zone where the property is disabled
            }
            if (exhausted && !this.isInResourceRow(card)) {
                this.push({ seq: this.nextSeq(false), t: 'EXHAUST', card: this.idOf(card) });
            }
        });

        // A card in the resource row is one of the counted resources, not a named card: its
        // ready/exhaust is written as the counter record (the regroup step readies every
        // resource this way, one event each). Anything else -- units, the leader in the base --
        // is named.
        this.on(EventName.OnCardExhausted, (event: any) => {
            const card = event?.card;
            if (this.isInResourceRow(card)) {
                this.resourceRecord('EXHAUST_RESOURCES', card.controller ?? card.owner, 1);
                return;
            }
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'EXHAUST', card: this.idOf(card) });
        });

        this.on(EventName.OnCardReadied, (event: any) => {
            const card = event?.card;
            if (this.isInResourceRow(card)) {
                this.resourceRecord('READY_RESOURCES', card.controller ?? card.owner, 1);
                return;
            }
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'READY', card: this.idOf(card) });
        });

        // Paying a cost, or an ability exhausting resources, goes through Player.exhaustResources
        // with no per-card event, so the amount is the only thing to record. The cost event's
        // `amount` is the figure after every adjuster (ResourceCost sets it in its handler); the
        // engine exhausts `min(amount, ready)`, and the fold does the same.
        this.on(EventName.OnExhaustResources, (event: any) => {
            const player = event?.player ?? event?.context?.player;
            this.resourceRecord('EXHAUST_RESOURCES', player, Number(event?.amount) || 0);
        });

        this.on(EventName.OnReadyResources, (event: any) => {
            const player = event?.player ?? event?.context?.player;
            this.resourceRecord('READY_RESOURCES', player, Number(event?.amount) || 0);
        });

        // A card that an ability puts into the resource row enters EXHAUSTED unless the ability
        // says otherwise (Resupply, the card Smuggle draws from the top of the deck, ...). The
        // MOVE into `resource` carries that as `exhausted: true` (see settleResourceMove).
        this.on(EventName.OnCardResourced, (event: any) => {
            const card = event?.card;
            if (card?.uuid != null && this.resourceRowChanges.delete(card.uuid)) {
                // Given back to the other row (see OnCardMoved): it keeps its ready state, which
                // the TAKE_CONTROL carries, so there is no separate exhaustion to record.
                const seat = this.seatOf(card.controller ?? card.owner);
                this.push({
                    seq: this.nextSeq(false),
                    t: 'TAKE_CONTROL',
                    p: seat,
                    card: this.idOf(card),
                    zone: 'resource',
                    from: (seat === 1 ? 2 : 1) as Seat,
                    ...(this.isInResourceRow(card) && card.exhausted === true ? { exhausted: true } : {}),
                });
                return;
            }
            // A card put into a row its owner does not control (Arquitens Assault Cruiser puts the
            // unit it defeated into play as its controller's resource): ResourceCardSystem takes
            // control inside the move and raises no OnTakeControl. The MOVE carried the counts and
            // the row, so this TAKE_CONTROL has no `from` and names the owner instead (spec §10.1,
            // `[W-56]`), which is what lists the card in the row's `foreignResources`.
            if (card?.uuid != null && this.isInResourceRow(card)) {
                const seat = this.seatOf(card.controller);
                const owner = this.seatOf(card.owner);
                const id = this.idOf(card);
                const last = this.events[this.events.length - 1];
                const alreadyWritten = last?.t === 'TAKE_CONTROL' && last.card === id && last.p === seat;
                if (owner !== seat && !alreadyWritten) {
                    this.push({ seq: this.nextSeq(false), t: 'TAKE_CONTROL', p: seat, card: id, zone: 'resource', owner });
                }
            }
            // An exhausted entry is the MOVE's own `exhausted` flag (set when it settles), not an
            // EXHAUST_RESOURCES: writing both would count the card twice (spec [W-45]).
        });

        this.on(EventName.OnCardsDrawn, (event: any) => {
            const player = event?.player;
            const cards: any[] = event?.cards ?? [];
            // Cards actually drawn, not the number asked for: drawing 2 from a deck of 1 draws 1
            // (the missing draw deals damage instead, recorded as its own DAMAGE).
            const count: number = cards.length;
            const cardIds = cards.map((c: any) => this.idOf(c)).filter((id: string) => id !== 'unknown');
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'DRAW', p: this.seatOf(player), count, cards: cardIds });
        });

        this.on(EventName.OnCardDiscarded, (event: any) => {
            const card = event?.card;
            const player = card?.owner;
            const id = this.idOf(card);
            const seq = this.nextSeq(false);
            const discard: GameEvent = { seq, t: 'DISCARD', p: this.seatOf(player), cards: id === 'unknown' ? [] : [id] };
            this.push(discard);
            // Several cards discarded in one window (each player's discards, CR 7.1.4a) are one
            // simultaneous group with their moves.
            const window = readOr<any>(() => event?.window ?? this.game.currentEventWindow, null);
            if (this.windowEventCount(window, EventName.OnCardDiscarded) >= 2) {
                this.joinSimul(discard, window);
            }
        });

        this.on(EventName.OnDeckShuffled, (event: any) => {
            const player = event?.player ?? event?.card?.owner;
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'SHUFFLE', p: this.seatOf(player) });
        });

        this.on(EventName.OnTokensCreated, (event: any) => {
            const tokens: any[] = event?.generatedTokens ?? [];
            for (const token of tokens) {
                // Only UNIT tokens are arena cards in the fold. OnTokensCreated also fires for
                // token-upgrades (shield/experience/advantage — recorded via OnUpgradeAttached as
                // SHIELD_GAIN/EXPERIENCE_GAIN/STATUS_TOKEN) and for credit/force tokens, none of
                // which are arena units; emitting CREATE_TOKEN for them would push a phantom card
                // into the folded board.
                if (typeof token?.isUnit !== 'function' || !token.isUnit()) {
                    continue;
                }
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'CREATE_TOKEN',
                    p: this.seatOf(token?.owner),
                    // Stable SET#NUM[:copy]/TOKEN:<name> id, consistent with the later MOVE/DAMAGE/
                    // EXHAUST events that reference this token (those use idOf too). Emitting the
                    // display title here instead would alias same-name tokens and orphan every
                    // subsequent token event from this card in the fold.
                    token: this.idOf(token),
                    // The token is NOT in play yet. `generateToken` puts it in `outsideTheGame`
                    // and a CONTINGENT PutIntoPlaySystem moves it to its arena afterwards, so
                    // `zoneName` here is `outsideTheGame` -- a zone the fold would place as a
                    // phantom arena card. Name the arena it is entering instead; the token's own
                    // MOVE is the authority either way.
                    zone: this.normalizeZone(readOr(() => token.defaultArena, token?.zoneName)),
                    // Same reason these are guarded: a unit's live stats are computed from its
                    // upgrades, and reading `upgrades` on a card in `outsideTheGame` trips a
                    // Contract assertion. Unreadable here means "not in play yet", so omit them --
                    // the STATS record emitted after the token's MOVE carries the real values.
                    power: readOr(() => token.getPower(), undefined),
                    hp: readOr(() => token.getHp(), undefined),
                    // Always 'unit' here (the guard above skips non-units), but stated
                    // explicitly so a reader never has to infer it from the event type.
                    kind: cardKind(token),
                });
            }
        });

        // `p` is the seat that HOLDS the card after the event: the captor's controller on a
        // capture, the owner on a rescue. `by` is the captor (CaptureSystem puts it on the
        // event), so a reader can file the card under the unit that took it. The card's own
        // arena -> capture MOVE was already written by the capture handler.
        this.on(EventName.OnCardCaptured, (event: any) => {
            const card = event?.card;
            const captor = event?.captor ?? null;
            const holder = captor?.controller ?? captor?.owner ?? card?.owner;
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'CAPTURE',
                p: this.seatOf(holder),
                card: this.idOf(card),
                ...(captor ? { by: this.targetRef(captor) } : {}),
            });
        });

        this.on(EventName.OnRescue, (event: any) => {
            const card = event?.card;
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'RESCUE', p: this.seatOf(card?.owner), card: this.idOf(card) });
        });

        this.on(EventName.OnTakeControl, (event: any) => {
            const card = event?.card;
            if (card?.uuid == null) {
                // Credit tokens change hands through the same event with no `card`. Their
                // control change is recorded from the token's own base -> base move instead
                // (see OnCardMoved), one TAKE_CONTROL per token; a record naming 'unknown'
                // here would help nobody.
                return;
            }
            const player = event?.newController ?? card?.controller;
            const seat = this.seatOf(player);
            // A control change is NOT a zone change: a stolen unit stays in the same arena
            // (PlayableOrDeployableCard.takeControl registers the move without moveTo), and
            // a stolen resource stays a resource. No MOVE is emitted, so this record has to
            // carry what the fold needs to re-seat the card (spec §10.1): the zone it is in
            // now, and the seat it left. In a two-player game control can only have come
            // from the other seat. When the steal DID change zone (a unit taken into the
            // resource row), the MOVE just recorded already carried the counts, so `from`
            // is omitted and the fold shifts nothing twice.
            this.resourceRowChanges.delete(card.uuid);
            const last = this.events[this.events.length - 1];
            if (last?.t === 'TAKE_CONTROL' && last.card === this.idOf(card) && last.p === this.seatOf(event?.newController ?? card?.controller)) {
                return; // already recorded beside the move that brought it out of its owner's deck
            }
            const movedByThisSteal = last?.t === 'MOVE' && last.card === this.idOf(card);
            const zone = this.normalizeZone(card?.zoneName);
            // A stolen resource keeps its ready state, and the fold keeps two counts, so say
            // which one moves. Readable here: the card sits in the new controller's row.
            const exhausted = zone === 'resource' && this.isInResourceRow(card) && card.exhausted === true;
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'TAKE_CONTROL',
                p: seat,
                card: this.idOf(card),
                zone,
                ...(movedByThisSteal ? {} : { from: (seat === 1 ? 2 : 1) as Seat }),
                ...(exhausted ? { exhausted: true } : {}),
                // A steal into the row that changed zone (Arquitens Assault Cruiser) has no
                // `from`, so it names the owner: the fold lists the card as a foreign resource
                // by it, and the schema requires it there (spec §10.1, `[W-56]`).
                ...(movedByThisSteal && zone === 'resource' ? { owner: this.seatOf(card.owner) } : {}),
            });
        });

        // TRIGGER / ABILITY_ACTIVATE dedup: AbilityResolver pushes BOTH OnCardAbilityTriggered
        // (only for activated abilities) and OnCardAbilityInitiated (for every card ability) into
        // the same event window for one activation, so an activated ability would otherwise record
        // two adjacent pure-log lines for the same card. OnCardAbilityInitiated → ABILITY_ACTIVATE
        // is the richer record (it carries the ability identifier) and is a superset of the
        // TRIGGER cases, so we collapse the pair into the single ABILITY_ACTIVATE. The collapse is
        // adjacency-based and bidirectional so it holds whichever event the window emits first; a
        // standalone TRIGGER (no adjacent ABILITY_ACTIVATE for the same card) is still recorded.
        this.on(EventName.OnCardAbilityTriggered, (event: any) => {
            const card = event?.card ?? event?.context?.source;
            // MUST match the ref ABILITY_ACTIVATE uses below, or the pair never collapses: a base
            // is `base@N` there and would be `SET#NUM` here, so every base ability would emit a
            // duplicate TRIGGER beside its ABILITY_ACTIVATE.
            const cardId = this.targetRef(card);
            const last = this.events[this.events.length - 1];
            if (last && last.t === 'ABILITY_ACTIVATE' && (last as any).card === cardId) {
                return; // ABILITY_ACTIVATE for this card already recorded the activation
            }
            const player = card?.controller ?? card?.owner;
            const seq = this.nextSeq(false);
            this.push({ seq, t: 'TRIGGER', p: player ? this.seatOf(player) : undefined, card: cardId });
        });

        this.on(EventName.OnCardAbilityInitiated, (event: any) => {
            const card = event?.card ?? event?.context?.source;
            // A base is `base@N` everywhere it is pointed at (§6.3), and here that is load-bearing
            // rather than cosmetic: a base's Epic Action and a leader's are separate abilities on
            // separate cards, and the folded board has no base CARD id to match a SET#NUM against.
            // The seat ref is what lets a reader tell the two apart.
            const cardId = this.targetRef(card);
            const player = card?.controller ?? card?.owner;
            const ability = event?.ability?.abilityIdentifier;
            const kind = this.abilityKind(event?.ability);
            const title = readOr(() => event?.ability?.getTitle?.(), undefined);
            // The card whose text GAVE `card` this ability: a Fortify upgrade's "Attached base
            // gains: ...", an upgrade's "Attached unit gains: ...". `card` alone says a base used
            // an ability its printed text does not have, and the engine's `ability` identifier
            // that happens to spell the source out is not a promise this format makes.
            const grantedBy = readOr<string | undefined>(() => {
                const gained = event?.ability;
                const source = gained?.isCardAbility?.() && !gained.printedAbility ? gained.gainAbilitySource : null;
                return source == null || source === card ? undefined : this.sourceRef(source);
            }, undefined);

            // Drop a just-recorded paired TRIGGER for the same card; this single record subsumes
            // it.
            const last = this.events[this.events.length - 1];
            const pairedTrigger = last != null && last.t === 'TRIGGER' && (last as any).card === cardId;
            if (pairedTrigger) {
                this.events.pop();
            }

            // CR 6.1 lists "use an action ability" among the six things a player may do with
            // their action, so an action (or Epic Action) ability IS a top-level action and takes
            // its own step number — the same as a play or an attack. Recording it as a sub-event
            // filed it under whatever the last numbered action was, which for a leader ability
            // used after the opponent's turn is the OPPONENT'S `PASS`: the pass appeared to have
            // ten consequences, and the ability's own DEFEAT/EXHAUST hung off the wrong player's
            // action. Every other ability kind (triggered, keyword, replacement) genuinely IS a
            // consequence of the action that caused it, and stays a sub-event.
            //
            // Otherwise reuse the popped TRIGGER's seq rather than allocating a fresh one, so the
            // collapse leaves no skipped seq number behind it.
            let seq: string;
            if (kind === 'action' || kind === 'epic') {
                seq = this.nextSeq(true);
            } else if (pairedTrigger) {
                seq = last.seq;
            } else {
                seq = this.nextSeq(false);
            }
            // The player who used the ability, whom the engine counts the use for. It is the card's
            // controller unless another card's ability made someone use it.
            const user = readOr<any>(() => event?.context?.player, null) ?? player;
            // A limited ability (spec §10.1, `[W-49]`): the limit the engine counts this use against,
            // the one the resolving context captured. Only with an `ability` to key the count on.
            const counted = readOr<any>(() => event?.context?.getCapturedLimit?.() ?? event?.ability?.captureLimit?.(), undefined);
            const limit = typeof ability === 'string' ? limitRecordOf(counted, user) : undefined;
            // An ability another card's ability made the player use (`[W-54]`).
            const usedBy = readOr<string | undefined>(() => {
                const by = event?.context?.retriggeredBy;
                return by == null ? undefined : this.sourceRef(by);
            }, undefined);
            // `p` is who used it ([W-54]) wherever the difference matters: the fold counts a
            // limited use under `p`, and the engine counts it for the context's player.
            const seat = this.seatOf(limit || usedBy ? user : player);
            this.push({
                seq,
                t: 'ABILITY_ACTIVATE',
                p: seat,
                card: cardId,
                ability: typeof ability === 'string' ? ability : undefined,
                ...(kind ? { kind } : {}),
                ...(typeof title === 'string' && title !== '' ? { title } : {}),
                ...(kind === 'epic' ? { epic: true } : {}),
                ...(grantedBy ? { grantedBy } : {}),
                ...(limit ? { limit } : {}),
                ...(usedBy ? { usedBy } : {}),
            });
            if (!limit) {
                return;
            }
            // A pending trigger whose card changed zone since it triggered resolves on the limit it
            // captured, which the zone change replaced (TriggeredAbility.resetLimitForNewZone): the
            // engine counts this use on a limit the card no longer has. The fold counts it, so the
            // reset the zone change made is stated after it.
            const live = readOr<any>(() => event?.ability?.captureLimit?.(), undefined);
            if (counted != null && live != null && counted !== live) {
                this.push({ seq: this.nextSeq(false), t: 'ABILITY_RESET', card: cardId, ability });
                return;
            }
            const key = `${seat}|${cardId}`;
            const used = this.limitedUses.get(key) ?? new Set<LimitPer>();
            used.add(limit.per);
            this.limitedUses.set(key, used);
            if (readOr(() => event?.ability?.printedAbility === false, false)) {
                this.gainedUses.set(`${key}|${ability}`, { seat, card: cardId, ability, per: limit.per, limit: counted, player: user });
            }
        });

        this.on(EventName.OnCardRevealed, (event: any) => {
            const cards: any[] = event?.cards ?? [];
            if (cards.length === 0) {
                return;
            }
            const owner = cards[0]?.controller ?? cards[0]?.owner;
            const cardIds = cards.map((c: any) => this.idOf(c)).filter((id: string) => id !== 'unknown');
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'REVEAL',
                p: this.seatOf(owner),
                zone: this.normalizeZone(event?.revealedFromZone ?? cards[0]?.zoneName),
                cards: cardIds,
            });
        });

        this.on(EventName.OnDeckSearch, (event: any) => {
            // `event.player` is whose deck it is; the searching player may be another
            // (`choosingPlayer`), and `p` is the one who looks.
            const owner = event?.player;
            const searcher = event?.searchProperties?.choosingPlayer ?? owner;
            const viewed: any[] = Array.isArray(event?.viewedCards) ? event.viewedCards : [];
            const seq = this.nextSeq(false);
            this.push({
                seq,
                t: 'SEARCH',
                p: this.seatOf(searcher),
                zone: event?.searchWholeDeck ? 'deck' : undefined,
                // Whose zone, and every card the searcher saw (spec §10.2, `[W-50]`).
                owner: this.seatOf(owner),
                seen: viewed.map((c: any) => this.idOf(c)).filter((id: string) => id !== 'unknown'),
            });
        });

        // LOOK (spec §10.2, `[W-50]`): a player looked at hidden cards without revealing them. One
        // record per zone looked into, since a look can take in two players' decks at once.
        this.on(EventName.OnLookAtCard, (event: any) => {
            const cards: any[] = Array.isArray(event?.cards) ? event.cards : [];
            this.recordLook(event?.viewer ?? event?.context?.player, cards);
        });

        // The look of a "look at the top N, put them on the top or the bottom" ability, which views
        // the cards through a prompt rather than a LookAtSystem event (recorder-only emit).
        this.on(EventName.OnLookMoveDeckCards, (event: any) => {
            const cards: any[] = Array.isArray(event?.cards) ? event.cards : [];
            this.recordLook(event?.player, cards);
        });

        // NAME (spec §10.2, `[W-51]`): a player named a card. A dropdown that names something other
        // than a card (a trait) writes nothing.
        this.on(EventName.OnCardNamed, (event: any) => {
            if (event?.namesCard !== true || typeof event?.choice !== 'string' || event.choice === '') {
                return;
            }
            this.push({ seq: this.nextSeq(false), t: 'NAME', p: this.seatOf(event?.player), name: event.choice });
        });

        // Several players are about to choose at once, without seeing each other's choices (CR
        // 7.1.4a): their card picks for this context are `blind`, valued at the asking record.
        this.on(EventName.OnBlindChoicesRequested, (event: any) => {
            const seq = event?.context != null ? this.askingSeq(event.context) : undefined;
            this.blindAsk = seq != null ? { context: event.context, seq } : null;
        }, { syncAfter: false });

        // ── Decision context (pure-log; no fold delta) ────────────────────────
        //
        // There is no pre-existing engine event carrying a player's prompt selection: prompt
        // results are known only inside the prompt's menuCommand handler (UiPrompt subclasses).
        // CHOICE/MODAL_CHOICE (spec §10.2) are "sourced from the prompt the engine already
        // built", so we added minimal engine-side emits at the prompt-completion sites that
        // already know both the option menu and the chosen option: MulliganPrompt (MULLIGAN /
        // KEEP_HAND), HandlerMenuPrompt and ActionSelectionPrompt (MODAL_CHOICE), SelectCardPrompt
        // (CHOICE), and ActionWindow.pass (PASS). The `recorder-only` entries in EventName are the
        // index. The recorder only listens; gameplay logic is untouched.

        // MULLIGAN / KEEP_HAND: emitted by MulliganPrompt.menuCommand when a player resolves their
        // mulligan decision (mulligan === true → MULLIGAN, otherwise → KEEP_HAND). Pure log.
        this.on(EventName.OnMulliganDecision, (event: any) => {
            this.push({
                seq: this.nextSeq(false),
                t: event?.mulligan ? 'MULLIGAN' : 'KEEP_HAND',
                p: this.seatOf(event?.player),
            });
        });

        // MODAL_CHOICE: emitted by HandlerMenuPrompt.menuCommand and ActionSelectionPrompt — the engine's menu/button
        // prompt with a fixed list of options. We classify menu/button prompts as MODAL_CHOICE
        // (fixed option list) and reserve CHOICE for free card-selection prompts; HandlerMenuPrompt
        // is the menu/button case, so it maps to MODAL_CHOICE. `offered` is the human-readable
        // button label list the prompt built; `chose` is the index of the selected option. Pure log.
        this.on(EventName.OnModalChoice, (event: any) => {
            const offered: string[] = Array.isArray(event?.offered) ? event.offered : [];
            // `chose` is the selected option index; without a valid number the record would be
            // malformed. Mirror the other handlers (e.g. OnCardRevealed) and skip the push
            // rather than emit a sentinel.
            if (typeof event?.chose !== 'number') {
                return;
            }
            const chose: number = event.chose;
            this.push({
                seq: this.nextSeq(false),
                t: 'MODAL_CHOICE',
                p: this.seatOf(event?.player),
                offered,
                chose,
            });
        });

        // CHOICE: a free card-selection prompt (SelectCardPrompt.emitCardSelection) — distinct from
        // MODAL_CHOICE's fixed menu/button list. `offered` is the candidate-card pool the prompt
        // presented; `chosen` is the single selected card (null for a multi-card pick, whose cards are
        // `chosenCards`); we record the stable card-id list and the chosen card's index within it. We
        // skip the record if the chosen card isn't resolvable or isn't in the offered pool (a
        // malformed pairing) rather than emit a sentinel. Pure log — no fold delta.
        this.on(EventName.OnCardSelection, (event: any) => {
            // targetRef, not idOf: an attack-target prompt offers the opponent's base, and a
            // base is written `base@N` everywhere else in the file (spec §6.3).
            const offeredCards: any[] = Array.isArray(event?.offered) ? event.offered : [];
            const offered = offeredCards
                .map((c: any) => this.targetRef(c))
                .filter((id: string) => id !== 'unknown');
            // A pick made without seeing the other players' (spec §10.2, `[W-53]`).
            const blind = event?.context != null && this.blindAsk?.context === event.context ? this.blindAsk.seq : undefined;
            // A CHOICE is one pick. A multi-card pick is written, one CHOICE per card, only in a
            // blind group, where each card is a choice the rules make without the others seeing.
            const picked: any[] = event?.chosen != null
                ? [event.chosen]
                : (blind != null && Array.isArray(event?.chosenCards) ? event.chosenCards : []);
            for (const chosen of picked) {
                if (chosen?.uuid == null) {
                    continue;
                }
                const chose = offered.indexOf(this.targetRef(chosen));
                if (chose < 0) {
                    continue;
                }
                this.push({
                    seq: this.nextSeq(false),
                    t: 'CHOICE',
                    p: this.seatOf(event?.player),
                    prompt: typeof event?.prompt === 'string' ? event.prompt : undefined,
                    offered,
                    chose,
                    ...(blind != null ? { blind } : {}),
                });
            }
        });
    }
}
