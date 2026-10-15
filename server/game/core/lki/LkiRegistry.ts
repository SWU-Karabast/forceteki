import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import { CardRef } from './CardRef';
import type { ICardProperties } from './CardPropertiesInterfaces';
import type { IRecordedCardState } from './RecordedCardProperties';
import { RecordedCardProperties, RecordedUnitProperties } from './RecordedCardProperties';
import { LiveCardProperties, LiveUnitProperties } from './LiveCardProperties';
import { Contract } from '../utils/Contract';
import { EnumHelpers } from '../utils/EnumHelpers';

/**
 * Serves card properties, resolving each read against the moment the caller's reference names.
 *
 * Three structures with three different lifetimes (D-29):
 *
 * | Structure   | Flushed at action boundary | Cleared on rollback |
 * |-------------|----------------------------|---------------------|
 * | records  | yes                        | yes                 |
 * | tombstones  | no                         | yes                 |
 * | intern map  | no                         | no                  |
 *
 * records are scoped to an action because last known information only matters between a trigger
 * and its resolution, and no ability resolution spans an action boundary. Retaining them longer
 * would silently serve stale data to code that should not be asking (D-20).
 *
 * The intern map holds identity only, which is timeline-independent, so it survives both.
 */
export class LkiRegistry {
    private readonly interned = new Map<string, CardRef>();
    private readonly records = new Map<string, IRecordedCardState>();

    /** Records not yet committed, grouped by the event that wrote them; see {@link commitPending} (D-30). */
    private readonly pending = new Map<number, Map<string, IRecordedCardState>>();

    /**
     * Card identities whose record has been flushed. Lets a stale read throw instead of falling
     * through to live state, which would be silently wrong (D-21, SC-15).
     */
    private readonly tombstones = new Set<string>();

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
     * Returns a properties view for the reference: recorded values if the identity has a
     * record, otherwise a live pass-through.
     */
    public getProperties(ref: CardRef): ICardProperties {
        const record = this.records.get(ref.key);
        if (record) {
            return record.isUnit
                ? new RecordedUnitProperties(ref, record)
                : new RecordedCardProperties(ref, record);
        }

        Contract.assertFalse(
            this.tombstones.has(ref.key),
            `The record for ${ref} was flushed at an action boundary, so its last known information ` +
            'is no longer available. Long-lived holders must store recorded values rather than holding a reference.'
        );

        const card = ref.getCardForEngine();
        Contract.assertTrue(
            ref.isCurrent,
            `${ref} names an identity that no longer exists and has no record, so nothing can be ` +
            'read from it.'
        );

        return card.isUnit() ? new LiveUnitProperties(ref, card) : new LiveCardProperties(ref, card);
    }

    /**
     * Whether a record for this identity exists, either committed or still staged.
     *
     * Exists for the departure assertion that lands with D-22's universal minting: a card leaving
     * play with no record means some system removed it without going through
     * `addDepartureRecordToEvent`, and anything that later asks about that identity would
     * silently read the wrong state. Not asserted yet — today's capture points do not cover every
     * departure, which is the gap D-22 closes (see lki-migration-register.md §G.1).
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
     * Returns `null` when the reference no longer names the card's current identity, which is how
     * an effect targeting a card that has since left and re-entered play fizzles (D-6).
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

        forEvent.set(CardRef.buildKey(card, card.identityId), LkiRegistry.buildRecord(card));
    }

    /**
     * Promotes an event's pending records to committed ones.
     *
     * Called immediately before the event's handler runs. Events that were replaced or cancelled
     * never reach this point, so they leave no record behind — without this a unit that survived
     * a replaced defeat would answer with frozen characteristics for the rest of the action (D-30).
     */
    public commitPending(eventId: number): void {
        const forEvent = this.pending.get(eventId);
        if (!forEvent) {
            return;
        }

        for (const [key, record] of forEvent) {
            this.records.set(key, record);
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

    /** Flushes records at an action boundary, leaving a tombstone for each (D-20, D-21). */
    public flushRecords(): void {
        for (const key of this.records.keys()) {
            this.tombstones.add(key);
        }
        this.records.clear();
        this.pending.clear();
    }

    /**
     * Clears all timeline-dependent state after a rollback.
     *
     * Rollback restores tracked state but not the registry, and mid-action rollback is a first-class
     * path, so without this a record written in an abandoned timeline would be served for a
     * re-created identity. Tombstones are cleared too: they record that an identity departed,
     * which is equally timeline-dependent, and a surviving tombstone would turn reads of a perfectly
     * live card into errors (D-29).
     *
     * The intern map is left alone — a `(card, identityId)` pair means the same thing in any
     * timeline.
     */
    public clearForRollback(): void {
        this.records.clear();
        this.pending.clear();
        this.tombstones.clear();
    }

    private static buildRecord(card: Card): IRecordedCardState {
        const wasInPlay = EnumHelpers.isArena(card.zoneName) ||
          (card.zoneName === ZoneName.Base && card.isUpgrade());

        const base = {
            title: card.title,
            type: card.type,
            controller: card.controller,
            // Copy the set: the card rebuilds its own on each read, but the record must not hand
            // out a collection that a caller could mutate for every other reader (D-17).
            traits: new Set(card.traits),
            cost: card.hasCost() ? card.cost : null,
            zoneName: card.zoneName,
            wasInPlay
        };

        if (!card.isUnit()) {
            return { ...base, isUnit: false };
        }

        if (!wasInPlay) {
            return {
                ...base,
                isUnit: true,
                printedPower: card.getPrintedPower(),
                printedHp: card.getPrintedHp()
            };
        }

        return {
            ...base,
            isUnit: true,
            printedPower: card.getPrintedPower(),
            printedHp: card.getPrintedHp(),
            power: card.getPower(),
            hp: card.getHp(),
            damage: card.damage,
            exhausted: card.exhausted,
            upgrades: card.isAttached() ? [] : card.upgrades.map((upgrade) => card.game.lkiRegistry.getIdentity(upgrade))
        };
    }
}
