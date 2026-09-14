import { StateWatcherName } from '../Constants';
import type { Game } from '../Game';
import type { StateWatcher } from '../stateWatcher/StateWatcher';
import { Helpers } from '../utils/Helpers';
import type { SavedCardRefResolver } from './SavedCardRefResolver';
import { SaveIntegrityError } from './SavedMatchInterfaces';
import type {
    IEngineOnlyFact,
    ISavedActionEntry,
    ISavedAttackEntry,
    ISavedCardLeftPlayEntry,
    ISavedCreatedTokenEntry,
    ISavedDamageDealtEntry,
    ISavedDamagedUnitEntry,
    ISavedDefeatedCardEntry,
    ISavedDeployedLeaderEntry,
    ISavedDiscardedCardEntry,
    ISavedDrawnCardEntry,
    ISavedEnteredCardEntry,
    ISavedForceUsedEntry,
    ISavedHealedBaseEntry,
    ISavedHealedUnitEntry,
    ISavedPlayedCardEntry,
    ISavedStateWatcherSection,
    ISavedWatcherEntry,
} from './SavedMatchInterfaces';
import { CounterSpaces, EntryReferenceEncoder, cardOf, classifyStint, encodeLastKnownInformation, encodeTaggedSet, refOf } from './WatcherEntryEncoding';
import type { EntryOf } from './WatcherEntryEncoding';
import type { ActionEntry } from '../../stateWatchers/ActionsThisPhaseWatcher';
import type { AttackEntry } from '../../stateWatchers/AttacksThisPhaseWatcher';
import type { HealedBaseEntry } from '../../stateWatchers/BasesHealedThisPhaseWatcher';
import type { DefeatedCardEntry } from '../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import type { DiscardedCardEntry } from '../../stateWatchers/CardsDiscardedThisPhaseWatcher';
import type { DrawnCardEntry } from '../../stateWatchers/CardsDrawnThisPhaseWatcher';
import type { EnteredCardEntry } from '../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';
import type { CardLeftPlayEntry } from '../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import type { PlayedCardEntry } from '../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { DamageDealtEntry } from '../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { ForceUsedEntry } from '../../stateWatchers/ForceUsedThisPhaseWatcher';
import type { DeployedLeaderEntry } from '../../stateWatchers/LeadersDeployedThisPhaseWatcher';
import type { CreatedTokenEntry } from '../../stateWatchers/TokensCreatedThisPhaseWatcher';
import type { DamagedUnitEntry } from '../../stateWatchers/UnitsDamagedThisPhaseWatcher';
import type { HealedUnitEntry } from '../../stateWatchers/UnitsHealedThisPhaseWatcher';

type WatcherEncoder<TEntry, TSaved> = (entry: TEntry, refs: EntryReferenceEncoder, counters: CounterSpaces) => TSaved;

/**
 * A dev-only tripwire on a member this format publishes as permanently `null` because its live source never
 * populates it. If the underlying engine bug is ever repaired, the writer must start publishing the real
 * value rather than continuing to emit `null`, and nothing else would notice.
 *
 * It reports rather than asserts, because a save is a bug-report artifact and must degrade, never halt.
 * {@link serializeStateWatchers} drains these notes through `Game.reportError` at `Normal` severity, which
 * `Lobby.handleError` logs without touching the game, so a real save still produces its document. Under the
 * test harness the router spy rethrows every reported error, so the same note fails the suite instead --
 * which is the wanted outcome there: a repaired engine bug should stop the build until the writer publishes
 * the real value. Notes are deduplicated per save so a board with many attack entries cannot walk
 * `Lobby.gameMessageErrorCount` past its ceiling and get the severity escalated to `SevereHaltGame`.
 */
function noteDeadMember(rawValue: unknown, description: string, refs: EntryReferenceEncoder): void {
    if (Helpers.isDevelopment() && rawValue != null) {
        refs.noteEngineBug(`${description} is no longer always absent; the save format must now publish its real value instead of null.`);
    }
}

function encodeAction(entry: ActionEntry, refs: EntryReferenceEncoder): ISavedActionEntry {
    return {
        player: refs.requiredSeat(entry.player, 'player'),
        actionNumber: entry.actionNumber,
    };
}

function encodeAttack(entry: AttackEntry, refs: EntryReferenceEncoder, counters: CounterSpaces): ISavedAttackEntry {
    const attacker = refs.requiredReferent(entry.attacker, 'attacker');

    noteDeadMember(entry.targetInPlayId, 'AttackEntry.targetInPlayId', refs);

    const saved: ISavedAttackEntry = {
        attacker: refOf(attacker),
        attackerInPlayId: classifyStint(entry.attackerInPlayId, cardOf(attacker)),
        attackerAttributes: entry.attackerAttributes == null
            ? null
            : { traits: encodeTaggedSet(entry.attackerAttributes.traits, refs, 'attackerAttributes.traits') },
        attackingPlayer: refs.requiredSeat(entry.attackingPlayer, 'attackingPlayer'),
        targets: refs.requiredReferents(entry.targets, 'targets').map(refOf),
        targetInPlayId: null,
        defendingPlayer: refs.requiredSeat(entry.defendingPlayer, 'defendingPlayer'),
        actionNumber: entry.actionNumber,
        attackId: null,
    };

    counters.record(StateWatcherName.AttacksThisPhase, saved, 'attackId', entry.attackId);

    return saved;
}

function encodeHealedBase(entry: HealedBaseEntry, refs: EntryReferenceEncoder): ISavedHealedBaseEntry {
    return { base: refOf(refs.requiredReferent(entry.base, 'base')) };
}

function encodeDefeatedCard(entry: DefeatedCardEntry, refs: EntryReferenceEncoder): ISavedDefeatedCardEntry {
    const card = refs.requiredReferent(entry.card, 'card');

    return {
        card: refOf(card),
        inPlayId: classifyStint(entry.inPlayId, cardOf(card)),
        controlledBy: refs.requiredSeat(entry.controlledBy, 'controlledBy'),
        defeatedBy: refs.optionalSeat(entry.defeatedBy),
        wasDefeatedWhileAttacking: !!entry.wasDefeatedWhileAttacking,
        lastKnownInformation: encodeLastKnownInformation(entry.lastKnownInformation, refs, 'lastKnownInformation'),
    };
}

function encodeDiscardedCard(entry: DiscardedCardEntry, refs: EntryReferenceEncoder): ISavedDiscardedCardEntry {
    const card = refs.requiredReferent(entry.card, 'card');

    return {
        card: refOf(card),
        discardedFromPlayer: refs.requiredSeat(entry.discardedFromPlayer, 'discardedFromPlayer'),
        discardedFromZone: entry.discardedFromZone,
        discardedPlayId: classifyStint(entry.discardedPlayId, cardOf(card)),
    };
}

function encodeDrawnCard(entry: DrawnCardEntry, refs: EntryReferenceEncoder): ISavedDrawnCardEntry {
    return {
        player: refs.requiredSeat(entry.player, 'player'),
        card: refOf(refs.requiredReferent(entry.card, 'card')),
    };
}

function encodeEnteredCard(entry: EnteredCardEntry, refs: EntryReferenceEncoder): ISavedEnteredCardEntry {
    return {
        card: refOf(refs.requiredReferent(entry.card, 'card')),
        playedBy: refs.requiredSeat(entry.playedBy, 'playedBy'),
    };
}

function encodeCardLeftPlay(entry: CardLeftPlayEntry, refs: EntryReferenceEncoder): ISavedCardLeftPlayEntry {
    const card = refs.requiredReferent(entry.card, 'card');

    return {
        card: refOf(card),
        controlledBy: refs.requiredSeat(entry.controlledBy, 'controlledBy'),
        lastKnownInformation: encodeLastKnownInformation(entry.lastKnownInformation, refs, 'lastKnownInformation'),
        inPlayId: classifyStint(entry.inPlayId, cardOf(card)),
    };
}

function encodePlayedCard(entry: PlayedCardEntry, refs: EntryReferenceEncoder, counters: CounterSpaces): ISavedPlayedCardEntry {
    const card = refs.requiredReferent(entry.card, 'card');
    const parentCard = refs.optionalReferent(entry.parentCard, 'parentCard');

    const saved: ISavedPlayedCardEntry = {
        card: refOf(card),
        playEventId: null,
        originalZone: entry.originalZone ?? null,
        inPlayId: classifyStint(entry.inPlayId, cardOf(card)),
        playedBy: refs.requiredSeat(entry.playedBy, 'playedBy'),
        parentCard: refOf(parentCard),
        // Classified against the parent, not against the played card.
        parentCardInPlayId: classifyStint(entry.parentCardInPlayId, cardOf(parentCard)),
        hasWhenDefeatedAbilities: entry.hasWhenDefeatedAbilities ?? null,
        playedAsType: entry.playedAsType,
    };

    counters.record(StateWatcherName.CardsPlayedThisPhase, saved, 'playEventId', entry.playEventId);

    return saved;
}

/**
 * Exported for the index-alignment test. A `damageDealtThisPhase` entry is the only one whose referents and
 * stints are parallel arrays, and the only fixtures the card pool affords put exactly one source in each
 * entry — under which a whole-array flag is indistinguishable from per-element classification. The seam
 * lets that contract be exercised with two sources at two different stints.
 */
export function encodeDamageDealt(entry: DamageDealtEntry, refs: EntryReferenceEncoder, counters: CounterSpaces): ISavedDamageDealtEntry {
    const damageSources = refs.requiredReferents(entry.damageSourceCards, 'damageSourceCards');
    const rawStints = entry.damageSourceInPlayIds ?? [];

    noteDeadMember(entry.damageSourceEventId, 'DamageDealtEntry.damageSourceEventId', refs);

    const saved: ISavedDamageDealtEntry = {
        damageType: entry.damageType,
        damageSourceCards: damageSources.map(refOf),
        // Index-aligned: element i is classified against damageSourceCards[i], never against a single
        // whole-array flag -- combat damage from several defenders puts cards with different stints here.
        damageSourceInPlayIds: damageSources.map((source, index) => classifyStint(rawStints[index], cardOf(source))),
        damageSourceCardTypes: [...(entry.damageSourceCardTypes ?? [])],
        // Both seats here are optional rather than required, unlike every other seat in this file: the
        // updater writes them through an optional chain, so absence is a legal live shape, not degradation.
        damageSourcePlayer: refs.optionalSeat(entry.damageSourcePlayer),
        damageSourceEventId: null,
        targets: refs.requiredReferents(entry.targets, 'targets').map(refOf),
        targetType: entry.targetType,
        targetController: refs.optionalSeat(entry.targetController),
        amount: entry.amount,
        isIndirect: entry.isIndirect ?? null,
        activeAttackId: null,
    };

    counters.record(StateWatcherName.DamageDealtThisPhase, saved, 'activeAttackId', entry.activeAttackId);

    return saved;
}

function encodeForceUsed(entry: ForceUsedEntry, refs: EntryReferenceEncoder): ISavedForceUsedEntry {
    return { player: refs.requiredSeat(entry.player, 'player') };
}

function encodeDeployedLeader(entry: DeployedLeaderEntry, refs: EntryReferenceEncoder): ISavedDeployedLeaderEntry {
    return { card: refOf(refs.requiredReferent(entry.card, 'card')) };
}

function encodeCreatedToken(entry: CreatedTokenEntry, refs: EntryReferenceEncoder): ISavedCreatedTokenEntry {
    return {
        token: refOf(refs.requiredReferent(entry.token, 'token')),
        createdBy: refs.requiredSeat(entry.createdBy, 'createdBy'),
    };
}

function encodeDamagedUnit(entry: DamagedUnitEntry, refs: EntryReferenceEncoder): ISavedDamagedUnitEntry {
    const unit = refs.requiredReferent(entry.unit, 'unit');

    return {
        unit: refOf(unit),
        inPlayId: classifyStint(entry.inPlayId, cardOf(unit)),
        controlledBy: refs.requiredSeat(entry.controlledBy, 'controlledBy'),
    };
}

function encodeHealedUnit(entry: HealedUnitEntry, refs: EntryReferenceEncoder): ISavedHealedUnitEntry {
    const unit = refs.requiredReferent(entry.unit, 'unit');

    return {
        unit: refOf(unit),
        inPlayId: classifyStint(entry.inPlayId, cardOf(unit)),
        controlledBy: refs.requiredSeat(entry.controlledBy, 'controlledBy'),
    };
}

/**
 * One encoder per watcher, each tied to the entry shape its own key carries. The mapped type over
 * `StateWatcherName` makes exhaustiveness a compile-time property: adding a watcher to the enum without
 * adding an encoder fails to build.
 *
 * Mispairing is caught only where the two entry shapes differ in a way assignability can see. Verified by
 * compilation: swapping two encoders whose saved shapes are *structurally distinct* fails with `TS2418`,
 * but swapping `unitsDamaged` with `unitsHealed` -- identical shapes, identical encoder bodies -- still
 * compiles, as does registering an encoder whose saved type is a supertype of the key's. The T1 runtime
 * check is therefore not redundant with this type, and neither this nor T1 can distinguish the two
 * identical encoders; only their bodies diverging would restore the compile error.
 */
type WatcherEncoderRegistry = {
    [TName in StateWatcherName]: WatcherEncoder<any, EntryOf<TName>>;
};

const watcherEncoders: WatcherEncoderRegistry = {
    [StateWatcherName.ActionsThisPhase]: encodeAction,
    [StateWatcherName.AttacksThisPhase]: encodeAttack,
    [StateWatcherName.BasesHealedThisPhase]: encodeHealedBase,
    [StateWatcherName.CardsDefeatedThisPhase]: encodeDefeatedCard,
    [StateWatcherName.CardsDiscardedThisPhase]: encodeDiscardedCard,
    [StateWatcherName.CardsDrawnThisPhase]: encodeDrawnCard,
    [StateWatcherName.CardsEnteredPlayThisPhase]: encodeEnteredCard,
    [StateWatcherName.CardsLeftPlayThisPhase]: encodeCardLeftPlay,
    [StateWatcherName.CardsPlayedThisPhase]: encodePlayedCard,
    [StateWatcherName.DamageDealtThisPhase]: encodeDamageDealt,
    [StateWatcherName.ForceUsedThisPhase]: encodeForceUsed,
    [StateWatcherName.LeadersDeployedThisPhase]: encodeDeployedLeader,
    [StateWatcherName.TokensCreatedThisPhase]: encodeCreatedToken,
    [StateWatcherName.UnitsDamagedThisPhase]: encodeDamagedUnit,
    [StateWatcherName.UnitsHealedThisPhase]: encodeHealedUnit,
};

/** The encoder registry's keys, exposed so a spec can assert at runtime that they still match the enum. */
export function registeredWatcherEncoderNames(): string[] {
    return Object.keys(watcherEncoders);
}

export interface ISerializedStateWatchers {
    sections: ISavedStateWatcherSection[];
    droppedFacts: IEngineOnlyFact[];
}

/**
 * Encodes every registered watcher's recorded entries into the document's `stateWatchers` section.
 *
 * Two passes. Pass 1 resolves each entry's referents against `refResolver`'s position index (never through
 * `Game.getFromId`, which halts the game for an id whose object no longer exists), drops any entry the
 * format cannot publish intact while enumerating it as a `watcherEntry` fact, and registers the raw counter
 * values with `CounterSpaces`. Pass 2 replaces those with dense, document-scoped ordinals.
 *
 * Sections are emitted in `StateWatcherName` declaration order rather than registration order, so the
 * document does not vary with which cards happened to register a watcher first.
 */
export function serializeStateWatchers(
    game: Game,
    refResolver: SavedCardRefResolver,
    seatByUuid: ReadonlyMap<string, string>
): ISerializedStateWatchers {
    const registered = new Map<string, StateWatcher>();
    for (const watcher of game.stateWatcherRegistrar.registeredWatchers) {
        registered.set(watcher.name, watcher);
    }

    const sections: ISavedStateWatcherSection[] = [];
    const droppedFacts: IEngineOnlyFact[] = [];
    const counters = new CounterSpaces();
    const engineBugNotes = new Map<string, string>();

    for (const watcherName of Object.values(StateWatcherName)) {
        const watcher = registered.get(watcherName);
        if (watcher == null) {
            continue;
        }

        // Widening a union of per-key encoders to one function returning the flat entry union. Whatever
        // pairing checking there is happens at the registry's own declaration, not here; see the caveats
        // on `WatcherEncoderRegistry` for what it does and does not catch.
        const encoder: WatcherEncoder<any, ISavedWatcherEntry> = watcherEncoders[watcherName];
        if (encoder == null) {
            throw new SaveIntegrityError(`State watcher "${watcherName}" has no save-format encoder, so its state cannot be published.`);
        }

        const entries: ISavedWatcherEntry[] = [];

        watcher.rawEntries.forEach((rawEntry, index) => {
            const refs = new EntryReferenceEncoder(refResolver, seatByUuid);
            const encoded = encoder(rawEntry, refs, counters);
            const unrepresentable = refs.unrepresentableField;

            // Dev-only engine-assumption notes (see `noteDeadMember`), collected whether or not the entry
            // survives and reported once each after the walk.
            for (const note of refs.engineBugNotes) {
                if (!engineBugNotes.has(note)) {
                    engineBugNotes.set(note, `${watcherName} entry ${index}: ${note}`);
                }
            }

            if (unrepresentable != null) {
                counters.discardEntry();
                droppedFacts.push({
                    category: 'watcherEntry',
                    source: refs.firstResolvedRef,
                    target: null,
                    duration: null,
                    description: `${watcherName} entry ${index} dropped: field "${unrepresentable.field}" ${unrepresentable.reason}`,
                });
                return;
            }

            counters.commitEntry();
            entries.push(encoded);
        });

        if (entries.length > 0) {
            // The registry is keyed by the same enum the section union discriminates on, and the registry's
            // mapped type guarantees `entries` holds this key's shape. TypeScript still cannot see that
            // through the loop's widened key type, so the pairing is asserted here rather than established
            // here -- the type-level guarantee lives on `WatcherEncoderRegistry`.
            const section = { watcher: watcherName, entries };
            sections.push(section as ISavedStateWatcherSection);
        }
    }

    counters.assignOrdinals();

    // Reported after the document is fully built, at `Normal` severity, so the report can never be the
    // reason a save produced nothing.
    for (const message of engineBugNotes.values()) {
        game.reportError(new Error(message));
    }

    return { sections, droppedFacts };
}
