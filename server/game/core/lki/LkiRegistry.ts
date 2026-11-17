import type { Card } from '../card/Card';
import { CardRef } from './CardRef';
import type { ICardProperties } from './CardPropertiesInterfaces';
import type { IRecordedCardState } from './CardRecord';
import { buildCardRecord } from './CardRecord';
import { RecordedCardProperties, RecordedUnitProperties, RecordedUpgradeProperties } from './RecordedCardProperties';
import { LiveCardProperties, LiveUnitProperties, LiveUpgradeProperties } from './LiveCardProperties';
import { Contract } from '../utils/Contract';

/**
 * Serves card properties, resolving each read against the moment the caller's reference names.
 *
 * Two structures with two different lifetimes (D-29):
 *
 * | Structure  | Flushed at action boundary | Cleared on rollback |
 * |------------|----------------------------|---------------------|
 * | records    | yes                        | yes                 |
 * | intern map | no                         | no                  |
 *
 * Records are scoped to an action because last known information only matters between a trigger
 * and its resolution, and no ability resolution spans an action boundary (D-20). After the flush a
 * card that is still the same identity reads as it is now (D-39): a card that left play for the
 * discard pile keeps its identity, and card code legitimately reads it there afterwards.
 *
 * The intern map holds identity only, which is timeline-independent, so it survives both.
 */
export class LkiRegistry {
    private readonly interned = new Map<string, CardRef>();
    private readonly records = new Map<string, IRecordedCardState>();

    /** Records not yet committed, grouped by the event that wrote them; see {@link commitPending} (D-30). */
    private readonly pending = new Map<number, Map<string, IRecordedCardState>>();

    /** Returns the canonical reference for a card's current identity. */
    public getIdentity(card: Card): CardRef {
        return this.internIdentity(card, card.identityId);
    }

    /** Returns the canonical reference for a specific identity of a card. */
    private internIdentity(card: Card, identityId: number): CardRef {
        const key = CardRef.buildKey(card, identityId);
        const existing = this.interned.get(key);
        if (existing) {
            return existing;
        }

        const ref = CardRef.createForRegistry(card, identityId);
        this.interned.set(key, ref);
        return ref;
    }

    /**
     * Returns a properties view for the reference: the recorded characteristics if the identity has a
     * record, otherwise a live pass-through. Presence reads the live card either way (D-37).
     */
    public getProperties(ref: CardRef): ICardProperties {
        const record = this.records.get(ref.key);
        if (record) {
            return LkiRegistry.recordedView(ref, record);
        }

        Contract.assertTrue(
            ref.isCurrent,
            `${ref} names an identity that no longer exists and has no record, so nothing can be ` +
            'read from it. Long-lived holders must store the values they need rather than a reference.'
        );

        return this.getLiveProperties(ref);
    }

    /**
     * Returns a live pass-through view of the card the reference names, as it is right now.
     *
     * Deliberately ignores records and identity, so it can never fail the way {@link getProperties}
     * does and reads exactly what reading the card directly would. This is what a card that has not
     * opted in to last known information receives (see `Card.usesLkiRegistry`), and what any card
     * gets when it asks for the present (`ICardStateGetter.getCurrentProperties`).
     */
    public getLiveProperties(ref: CardRef): ICardProperties {
        const card = ref.getCardForEngine();
        if (card.isUnit()) {
            return new LiveUnitProperties(ref, card);
        }
        if (card.isUpgrade()) {
            return new LiveUpgradeProperties(ref, card);
        }
        return new LiveCardProperties(ref, card);
    }

    private static recordedView(ref: CardRef, record: IRecordedCardState): ICardProperties {
        if (record.checks.isUnit) {
            return new RecordedUnitProperties(ref, record);
        }
        if (record.checks.isUpgrade) {
            return new RecordedUpgradeProperties(ref, record);
        }
        return new RecordedCardProperties(ref, record);
    }

    /**
     * Whether a record for this identity exists, either committed or still staged.
     *
     * Exists for a departure assertion: a card leaving play with no record means some system removed
     * it without going through `addDepartureRecordToEvent`, and anything that later asks about that
     * identity would silently read the wrong state. Not asserted yet — enabling it fails 27 specs, all
     * of which move cards through test-harness helpers rather than the engine, so the harness has to
     * declare those moves first (see lki-migration-register.md §G.1).
     */
    public hasRecordFor(card: Card, identityId: number): boolean {
        const key = CardRef.buildKey(card, identityId);
        if (this.records.has(key)) {
            return true;
        }

        for (const forEvent of this.pending.values()) {
            if (forEvent.has(key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolves a reference to the live card, for engine use.
     *
     * Returns `null` when the reference no longer names the card's current identity.
     */
    public deref(ref: CardRef): Card | null {
        return ref.isCurrent ? ref.getCardForEngine() : null;
    }

    /**
     * Records a card's characteristics into the pending set for `eventId`.
     *
     * Called from the event window's pre-resolution step so that every card leaving play in the same
     * window is recorded before any of them is removed, which is what preserves simultaneous-defeat
     * semantics (SC-5). The record is only kept if the event actually resolves — see
     * {@link commitPending}.
     */
    public recordPending(eventId: number, card: Card): void {
        let forEvent = this.pending.get(eventId);
        if (!forEvent) {
            forEvent = new Map<string, IRecordedCardState>();
            this.pending.set(eventId, forEvent);
        }

        forEvent.set(CardRef.buildKey(card, card.identityId), buildCardRecord(card, (related) => this.getIdentity(related)));
    }

    /**
     * Promotes an event's pending records to committed ones.
     *
     * Called immediately before the event's handler runs. Events that were replaced or cancelled
     * never reach this point, so they leave no record behind — without this a unit that survived
     * a replaced defeat would answer with frozen characteristics for the rest of the action (D-30).
     *
     * An identity keeps the first record it gets within an action. A unit that leaves play for the
     * discard pile and then moves into a hidden zone in the same action is recorded twice under the
     * same identity, once for each move, and the triggers of its departure need the first: the unit
     * as it left play, not as it sat in the discard pile.
     */
    public commitPending(eventId: number): void {
        const forEvent = this.pending.get(eventId);
        if (!forEvent) {
            return;
        }

        for (const [key, record] of forEvent) {
            if (!this.records.has(key)) {
                this.records.set(key, record);
            }
        }
        this.pending.delete(eventId);
    }

    /**
     * Drops the staged records belonging to `eventIds`, for events that never resolved.
     *
     * Called when an event window finishes, with that window's own event IDs. Anything of its still
     * staged at that point belongs to an event that was cancelled, replaced, or removed from the
     * window — so keeping it would let a card that is still in play answer with the characteristics
     * it would have had if that event had happened (D-30).
     *
     * Scoped rather than wholesale because the staging area is shared across windows: a nested
     * window finishing must not discard what an ancestor staged and is still going to commit.
     */
    public dropPending(eventIds: ReadonlySet<number>): void {
        for (const eventId of eventIds) {
            this.pending.delete(eventId);
        }
    }

    /**
     * How many events still have records staged but not committed. Always zero once an event window
     * has finished.
     */
    public get pendingEventCount(): number {
        return this.pending.size;
    }

    /** Flushes records at an action boundary (D-20). */
    public flushRecords(): void {
        this.records.clear();
        this.pending.clear();
    }

    /**
     * Clears all timeline-dependent state after a rollback.
     *
     * Rollback restores tracked state but not the registry, and mid-action rollback is a first-class
     * path, so without this a record written in an abandoned timeline would be served for a
     * re-created identity (D-29).
     *
     * The intern map is left alone — a `(card, identityId)` pair means the same thing in any
     * timeline.
     */
    public clearForRollback(): void {
        this.records.clear();
        this.pending.clear();
    }
}
