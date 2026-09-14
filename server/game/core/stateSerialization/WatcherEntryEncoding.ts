import { StateWatcherName } from '../Constants';
import type { Card } from '../card/Card';
import type { IStateWatcherLKIEntry } from '../stateWatcher/StateWatcher';
import type { SavedCardRefResolver } from './SavedCardRefResolver';
import { PRIOR_STINT_ID, SaveIntegrityError } from './SavedMatchInterfaces';
import type {
    ISavedCardRef,
    ISavedCounterOrdinal,
    ISavedLastKnownInformation,
    ISavedMatch,
    ISavedStateWatcherSection,
    ISavedStintRef,
    ISavedTaggedSet,
    SavedCounterSpaceName,
} from './SavedMatchInterfaces';

/**
 * The two document-scoped spaces the writer mints ordinals into. Document-scoped rather than per-watcher
 * because two different watchers record ids drawn from the *same* live generator and are compared against
 * each other: `AttackEntry.attackId` and `DamageDealtEntry.activeAttackId` both come from
 * `Game.getNextAttackId`, and `FlashTheVents` relies on a damage entry still resolving to its attack.
 * Minting them per watcher would break that grouping.
 */
export type CounterSpaceName = SavedCounterSpaceName;

/** The saved entry shape paired with one watcher name by {@link ISavedStateWatcherSection}. */
export type EntryOf<TName extends StateWatcherName> = Extract<ISavedStateWatcherSection, { watcher: TName }>['entries'][number];

/**
 * The member-to-space mapping, in the document's own terms rather than the engine's, keyed by watcher and
 * then by saved member.
 *
 * Both halves of the encoding read this table and neither can name a space without it:
 * {@link CounterSpaces.record} resolves the writer's space through {@link spaceOf} rather than taking one
 * from its caller, and {@link deriveCounterSpaceSizes} walks the same rows on the loader side. A member
 * that records a counter but has no row here therefore refuses the document at the first `save()` instead
 * of quietly forming a space of its own and under-deriving a shared one on load.
 *
 * The key types are pinned to the saved entry shape of the watcher they sit under, so a misspelled member
 * fails to compile. They do **not** force a row to exist: the table cannot be made exhaustive over counter
 * members, because `ISavedCounterOrdinal` is a bare `number | null` that ordinary members such as
 * `actionNumber` and `amount` also satisfy. Presence is what {@link spaceOf}'s throw enforces.
 */
type CounterSpaceTable = {
    readonly [TName in StateWatcherName]?: {
        readonly [TKey in CounterMemberOf<EntryOf<TName>> & string]?: CounterSpaceName;
    };
};

const counterSpaceMembers: CounterSpaceTable = {
    [StateWatcherName.AttacksThisPhase]: { attackId: 'attackIds' },
    [StateWatcherName.DamageDealtThisPhase]: { activeAttackId: 'attackIds' },
    [StateWatcherName.CardsPlayedThisPhase]: { playEventId: 'gameEventIds' },
};

/** The table's rows for one watcher, read loosely so a document-supplied key can be looked up. */
function spaceMembersOf(watcher: string): Record<string, CounterSpaceName | undefined> {
    return (counterSpaceMembers[watcher] ?? {}) as Record<string, CounterSpaceName | undefined>;
}

/**
 * The space a saved member's ordinals are minted into, per {@link counterSpaceMembers}.
 *
 * Throws for a pair the table does not list. This is the one place the writer refuses a document over an
 * authoring mistake rather than degrading: an unlisted pair is not a property of the game state but of the
 * code, so it fires deterministically on the first `save()` after the omission, in tests as well as in
 * production, rather than producing documents that load into the wrong grouping.
 */
export function spaceOf(watcher: string, key: string): CounterSpaceName {
    const space = spaceMembersOf(watcher)[key];
    if (space == null) {
        throw new SaveIntegrityError(`Saved member ${watcher}.${key} records a counter ordinal but is not listed in the counter-space table, so the loader could not derive its space.`);
    }

    return space;
}

/** A card referent that resolved to a position in this document, paired with the live card behind it. */
export interface IResolvedReferent {
    ref: ISavedCardRef;
    card: Card;
}

/**
 * Encodes a live `Set` as the schema's tagged form, with members sorted so the document is diff-stable.
 *
 * A value that is not a `Set` has no encoded form, so rather than widening the published member to `null`
 * it routes through `refs` as an unrepresentable field: the entry is dropped and the fact enumerates it.
 * Returning `null` here instead would be the one silent data-loss channel in a section whose stated rule is
 * that every degradation is enumerated — and `lastKnownInformation.traits` in particular is read live by
 * `RavagerFinalImperialCommand`.
 */
export function encodeTaggedSet<T extends string>(
    values: ReadonlySet<T> | null | undefined,
    refs: EntryReferenceEncoder,
    field: string
): ISavedTaggedSet<T> {
    if (!(values instanceof Set)) {
        refs.markUnrepresentable(field, 'holds a value this save format has no encoding for');
        return { $set: [] };
    }

    return { $set: [...values].sort() };
}

export function encodeLastKnownInformation(
    lki: IStateWatcherLKIEntry | null | undefined,
    refs: EntryReferenceEncoder,
    field: string
): ISavedLastKnownInformation | null {
    if (lki == null) {
        return null;
    }

    return {
        traits: encodeTaggedSet(lki.traits, refs, `${field}.traits`),
        // Non-optional on IStateWatcherLKIEntry and verified non-null on every reachable path, so it is
        // written verbatim; coalescing it would contradict the schema's own nullability contract.
        type: lki.type,
        power: lki.power ?? null,
        arena: lki.arena ?? null,
    };
}

/**
 * The value every consumer of an in-play-id field compares an entry against, mirroring
 * `CardsLeftPlayThisPhaseWatcher.getCardId` and `DamageDealtThisPhaseWatcher.getCardId` (which differ only
 * in returning `undefined` vs `null` for the hidden-zone case; both are absent here).
 *
 * The `canBeInPlay()` guard is deliberate rather than incidental: `isInPlay()`, `inPlayId` and
 * `mostRecentInPlayId` are declared on `InPlayCard`, not on `Card`, and three entry structs have referent
 * types that admit `EventCard`. It is defense-in-depth, not what keeps `save()` alive — every wide-referent
 * stint field already self-guards at record time inside the engine, so the raw value the writer sees for
 * such a referent is already nullish. It is kept so this helper is safe independently of those four call
 * sites continuing to self-guard, and because it states the semantic rule (a card that cannot be in play
 * cannot carry a stint) rather than inheriting it by luck.
 */
export function liveStintKey(card: Card | null | undefined): number | null {
    if (card == null || !card.canBeInPlay() || card.zone == null) {
        return null;
    }

    if (card.isInPlay()) {
        return card.inPlayId;
    }

    return card.zone.hiddenForPlayers == null ? card.mostRecentInPlayId : null;
}

/**
 * Classifies one in-play-id field against **its own** referent -- `parentCardInPlayId` against
 * `parentCard`, `damageSourceInPlayIds[i]` against `damageSourceCards[i]`. A raw numeric value that cannot
 * equal the referent's live key (including the hidden-zone case, where the key is absent entirely) names a
 * superseded stint and encodes `'prior'`.
 */
export function classifyStint(rawValue: number | null | undefined, referent: Card | null | undefined): ISavedStintRef {
    if (rawValue == null) {
        return null;
    }

    if (referent == null || !referent.canBeInPlay()) {
        return null;
    }

    return rawValue === liveStintKey(referent) ? 'live' : 'prior';
}

/**
 * The loader half of {@link classifyStint}, shipped here because the writer's encoding is only meaningful
 * paired with it. Pure and `Game`-free: `loadedCardLiveKey` is {@link liveStintKey} evaluated against the
 * card the loader placed.
 *
 * `'live'` restores the entry to equality with the card's own field by construction, whatever number the
 * injection path happens to produce -- `liveStintKey` is not a second source of truth, it is a read of the
 * very field the consumer will read. The published invariant is `entry.inPlayId === liveStintKey(loadedCard)`
 * and it names no specific number deliberately: a deck-origin card is already at `0` before it is ever
 * played, so `-1` is not a value to build a loader around. If `P2-C1` later changes injection so that an
 * injected card's `_mostRecentInPlayId` is not what `liveStintKey` returns for it, this pairing must be
 * re-checked.
 */
export function resolveStintId(stint: ISavedStintRef, loadedCardLiveKey: number | null | undefined): number | null {
    switch (stint) {
        case 'live':
            // Unreachable: a referent in a hidden zone at save time has no live key, so a recorded numeric
            // value could not have matched it and the field would have encoded 'prior'. Coalesced anyway.
            return loadedCardLiveKey ?? null;
        case 'prior':
            return PRIOR_STINT_ID;
        default:
            return null;
    }
}

/**
 * Derives each counter space's size from a whole document, as `max(ordinal) + 1` over **every** member of
 * that space across **every** section, or `0` for a space with no members. Which members belong to which
 * space comes from {@link counterSpaceMembers}, the same table the writer mints through. This is shipped
 * rather than left to the loader because a per-section derivation is silently wrong, and nothing in the
 * published shape would tell the loader so.
 *
 * The concrete failure it prevents: two attacks (raw ids `5`, `6`) get ordinals `0` and `1`, but only the
 * first deals damage, so `damageDealtThisPhase` holds `activeAttackId: 0` and nothing larger. Deriving
 * per-section yields `1` for the damage section and `2` for the attacks section; the damage entry then
 * mints to `-1` while the attack it belongs to mints to `-2`, and `FlashTheVents` folds stale pre-save
 * damage into the wrong attack. {@link mintCounterId}'s range guard does not fire, because `0 < 1`.
 *
 * Pure and `Game`-free, like the rest of the loader half published here.
 */
export function deriveCounterSpaceSizes(document: ISavedMatch): Record<CounterSpaceName, number> {
    const sizes: Record<CounterSpaceName, number> = { gameEventIds: 0, attackIds: 0 };

    for (const section of document.stateWatchers ?? []) {
        for (const [key, space] of Object.entries(spaceMembersOf(section.watcher))) {
            if (space == null) {
                continue;
            }

            for (const entry of section.entries as readonly unknown[] as readonly Record<string, unknown>[]) {
                const ordinal = entry[key] as ISavedCounterOrdinal;

                // `null` is the published "no ordinal was recorded" form and contributes nothing. Anything
                // else that is not a non-negative integer is a malformed document, and skipping it would
                // under-derive the space silently -- the failure this helper exists to prevent.
                if (ordinal == null) {
                    continue;
                }
                if (!Number.isInteger(ordinal) || ordinal < 0) {
                    throw new SaveIntegrityError(`Counter ordinal ${ordinal} in ${section.watcher}.${key} is not a non-negative integer; the document is not a valid save.`);
                }

                sizes[space] = Math.max(sizes[space], ordinal + 1);
            }
        }
    }

    return sizes;
}

/**
 * The loader half of {@link CounterSpaces}, mapping a saved ordinal into a strictly negative id that can
 * never collide with a live one: both live generators (`Game.getNextGameEventId`, `Game.getNextAttackId`)
 * only ever produce values `>= 0`.
 *
 * `spaceSize` is derived rather than published so that the document keeps one canonical form per fact, and
 * it must come from {@link deriveCounterSpaceSizes}. The guards here are ordinary argument validation, not
 * a safety net over that derivation: `ordinal >= spaceSize` fires only when the supplied size falls below
 * an ordinal in the *section being decoded*, which an under-derived size need not do. An under-derived size
 * is silent, which is exactly why the derivation is shipped rather than described.
 *
 * These guards are loader-side only. The writer builds ordinals through {@link CounterSpaces} and never
 * calls this, so they are not a new way for `save()` to halt.
 */
export function mintCounterId(ordinal: number, spaceSize: number): number {
    if (!Number.isInteger(ordinal) || ordinal < 0) {
        throw new SaveIntegrityError(`Counter ordinal must be a non-negative integer, got ${ordinal}.`);
    }
    if (!Number.isInteger(spaceSize) || ordinal >= spaceSize) {
        throw new SaveIntegrityError(`Counter ordinal ${ordinal} is out of range for a counter space of size ${spaceSize}.`);
    }

    const result = ordinal - spaceSize;
    if (result >= 0) {
        throw new SaveIntegrityError(`Minted counter id ${result} is not negative and could collide with a live id.`);
    }

    return result;
}

interface ICounterPatch {
    target: object;
    key: string;
    space: CounterSpaceName;
    rawValue: number;
}

/**
 * The members of `TSaved` whose declared type is assignable to {@link ISavedCounterOrdinal}. That is
 * `number | null`, so this admits every numeric member of the entry, not only the ordinals -- it narrows
 * {@link CounterSpaces.record}'s `key` to a real member of the right entry, and does not by itself
 * establish that the member is an ordinal. {@link spaceOf} is what enforces that.
 */
export type CounterMemberOf<TSaved> = {
    [K in keyof TSaved]-?: TSaved[K] extends ISavedCounterOrdinal ? K : never;
}[keyof TSaved];

/**
 * Collects the raw runtime counter values across every surviving entry of the document and replaces them,
 * in a second pass, with dense ordinals `0..N-1` assigned in ascending raw order. Equal raw values get
 * equal ordinals, which is what preserves the attack-to-damage grouping described on
 * {@link CounterSpaceName}.
 *
 * Entries are emitted with the member already set to `null`; a value that is never recorded here simply
 * stays `null`, so a missed patch degrades to "absent" rather than leaking a raw runtime id.
 *
 * Recording is staged per entry so that a value carried only by a *dropped* entry never enters a space.
 * That is a tidiness property, not a correctness one: committing it would make the space *sparser*, not
 * wrong, because `spaceSize = max(ordinal) + 1` still satisfies `ordinal < spaceSize` and every minted id
 * stays negative and order-preserving. Staging is kept because a space whose ordinals are dense over
 * exactly the surviving entries is the smaller, more obviously canonical form.
 */
export class CounterSpaces {
    private readonly rawValues = new Map<CounterSpaceName, Set<number>>();
    private readonly patches: ICounterPatch[] = [];
    private pending: ICounterPatch[] = [];

    /**
     * `key` is constrained to the counter-ordinal members of `watcher`'s own saved entry shape, so a
     * misspelled member, or one belonging to a different watcher, fails to compile. The constraint is a
     * spelling check rather than a semantic one: `ISavedCounterOrdinal` is a bare `number | null`, so
     * ordinary numeric members of the same entry satisfy it too.
     *
     * The space is **not** a parameter. It is resolved from {@link counterSpaceMembers} through
     * {@link spaceOf}, which is what makes that table the single source of truth for grouping rather than
     * a second copy of a decision the call sites already made. Resolution happens before the value check
     * so that a member added without a table row fails on the first `save()` even when its live value
     * happens to be absent.
     */
    public record<TName extends StateWatcherName>(
        watcher: TName,
        target: EntryOf<TName>,
        key: CounterMemberOf<EntryOf<TName>> & string,
        rawValue: number | null | undefined
    ): void {
        const space = spaceOf(watcher, key);

        // A non-integer (or absent) live value has no place in an ordinal space; the member stays null.
        if (!Number.isInteger(rawValue)) {
            return;
        }

        this.pending.push({ target, key, space, rawValue: rawValue as number });
    }

    /** Promotes the values recorded for the entry just encoded into their spaces. */
    public commitEntry(): void {
        for (const patch of this.pending) {
            let values = this.rawValues.get(patch.space);
            if (values == null) {
                values = new Set<number>();
                this.rawValues.set(patch.space, values);
            }
            values.add(patch.rawValue);
            this.patches.push(patch);
        }

        this.pending = [];
    }

    /** Throws away the values recorded for an entry that is being dropped. */
    public discardEntry(): void {
        this.pending = [];
    }

    public assignOrdinals(): void {
        const ordinalsBySpace = new Map<CounterSpaceName, Map<number, number>>();

        for (const [space, values] of this.rawValues) {
            const ordinals = new Map<number, number>();
            [...values].sort((a, b) => a - b).forEach((value, ordinal) => ordinals.set(value, ordinal));
            ordinalsBySpace.set(space, ordinals);
        }

        for (const patch of this.patches) {
            (patch.target as Record<string, unknown>)[patch.key] = ordinalsBySpace.get(patch.space).get(patch.rawValue);
        }
    }
}

/** Why an entry cannot be published: the offending field and a phrase completing "field \"x\" …". */
export interface IUnrepresentableField {
    field: string;
    reason: string;
}

const NO_POSITION = 'references a card with no position in this save';
const ABSENT_REQUIRED = 'is required by the entry shape but was absent in the live entry';

/**
 * Resolves one watcher entry's referents against the writer's own position index, recording whether the
 * entry must be dropped.
 *
 * The optional/required split mirrors the live entry structs and is what makes the schema's nullability a
 * contract rather than an accident. For a member the live struct marks optional ({@link optionalReferent},
 * {@link optionalSeat}), an **absent** reference encodes as `null` and is not degradation. For a member it
 * marks mandatory ({@link requiredReferent}, {@link requiredSeat}), absence is as unpublishable as an
 * unresolvable position, so both mark the entry for dropping; the published member is therefore never
 * `null`, and a consumer may treat a `null` there as a schema violation.
 *
 * Resolution deliberately continues past the first failure so that {@link firstResolvedRef} can name a
 * surviving coordinate for the drop fact.
 */
export class EntryReferenceEncoder {
    private readonly refResolver: SavedCardRefResolver;
    private readonly seatByUuid: ReadonlyMap<string, string>;
    private unrepresentable: IUnrepresentableField | null = null;
    private firstResolved: ISavedCardRef | null = null;
    private readonly engineBugs: string[] = [];

    public constructor(refResolver: SavedCardRefResolver, seatByUuid: ReadonlyMap<string, string>) {
        this.refResolver = refResolver;
        this.seatByUuid = seatByUuid;
    }

    /** Records that this entry cannot be published. Only the first reason is kept; it names the drop fact. */
    public markUnrepresentable(field: string, reason: string): void {
        this.unrepresentable ??= { field, reason };
    }

    /** A referent the live struct marks optional: absent encodes as `null`, unresolvable drops the entry. */
    public optionalReferent(uuid: string | null | undefined, field: string): IResolvedReferent | null {
        if (uuid == null) {
            return null;
        }

        return this.lookup(uuid, field);
    }

    /** A referent the live struct marks mandatory: absent and unresolvable both drop the entry. */
    public requiredReferent(uuid: string | null | undefined, field: string): IResolvedReferent | null {
        if (uuid == null) {
            this.markUnrepresentable(field, ABSENT_REQUIRED);
            return null;
        }

        return this.lookup(uuid, field);
    }

    /** Every element of a mandatory referent array is itself mandatory. */
    public requiredReferents(uuids: readonly (string | null | undefined)[] | null | undefined, field: string): (IResolvedReferent | null)[] {
        return (uuids ?? []).map((uuid) => this.requiredReferent(uuid, field));
    }

    /**
     * A player reference the live struct marks optional. A *present* reference that is not one of the two
     * seated players has no meaningful degraded form ("which seat" has no partial answer) and is
     * unreachable in a two-player match, so it refuses the document outright, consistently with
     * `MatchSerializer.requireSeat`.
     */
    public optionalSeat(uuid: string | null | undefined): string | null {
        if (uuid == null) {
            return null;
        }

        return this.seatOf(uuid);
    }

    /** A player reference the live struct marks mandatory: absence drops the entry rather than emitting null. */
    public requiredSeat(uuid: string | null | undefined, field: string): string | null {
        if (uuid == null) {
            this.markUnrepresentable(field, ABSENT_REQUIRED);
            return null;
        }

        return this.seatOf(uuid);
    }

    /**
     * Records that an assumption this format is built on no longer holds, without affecting the entry.
     * The entry is still published; the caller drains these and routes them to the game's error channel.
     * This is a developer signal about the engine, not a degradation of the document, so it deliberately
     * does **not** produce an `engineOnlyFacts` entry -- `watcherEntry` means one dropped entry and nothing
     * else, and a consumer may rely on that.
     */
    public noteEngineBug(description: string): void {
        this.engineBugs.push(description);
    }

    /** The engine-assumption notes raised while encoding this entry, in the order they were raised. */
    public get engineBugNotes(): readonly string[] {
        return this.engineBugs;
    }

    /** The first field this entry could not publish, or null when the entry is intact. */
    public get unrepresentableField(): IUnrepresentableField | null {
        return this.unrepresentable;
    }

    /** The coordinate of the first referent that did resolve, used as the drop fact's `source`. */
    public get firstResolvedRef(): ISavedCardRef | null {
        return this.firstResolved;
    }

    private lookup(uuid: string, field: string): IResolvedReferent | null {
        const found = this.refResolver.tryLookupByUuid(uuid);
        if (found == null) {
            this.markUnrepresentable(field, NO_POSITION);
            return null;
        }

        this.firstResolved ??= found.ref;
        return found;
    }

    private seatOf(uuid: string): string {
        const seat = this.seatByUuid.get(uuid);
        if (seat == null) {
            throw new SaveIntegrityError('A state-watcher entry references a player that is not one of the seated players being saved.');
        }

        return seat;
    }
}

/** Convenience for the common `referent -> ref | null` projection. */
export function refOf(resolved: IResolvedReferent | null): ISavedCardRef | null {
    return resolved?.ref ?? null;
}

/** Convenience for the common `referent -> live card | null` projection. */
export function cardOf(resolved: IResolvedReferent | null): Card | null {
    return resolved?.card ?? null;
}
