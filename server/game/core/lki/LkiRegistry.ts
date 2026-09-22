import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import { CardRef } from './CardRef';
import type { ICardProperties } from './CardPropertiesInterfaces';
import type { ICapturedCardState } from './CapturedCardProperties';
import { CapturedCardProperties, CapturedUnitProperties } from './CapturedCardProperties';
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
 * | footprints  | yes                        | yes                 |
 * | tombstones  | no                         | yes                 |
 * | intern map  | no                         | no                  |
 *
 * Footprints are scoped to an action because last known information only matters between a trigger
 * and its resolution, and no ability resolution spans an action boundary. Retaining them longer
 * would silently serve stale data to code that should not be asking (D-20).
 *
 * The intern map holds identity only, which is timeline-independent, so it survives both.
 */
export class LkiRegistry {
    private readonly interned = new Map<string, CardRef>();
    private readonly footprints = new Map<string, ICapturedCardState>();

    /** Captures not yet committed, grouped by the event that made them; see {@link commitPending} (D-30). */
    private readonly pending = new Map<number, Map<string, ICapturedCardState>>();

    /**
     * Instances whose footprint has been flushed. Lets a stale read throw instead of falling
     * through to live state, which would be silently wrong (D-21, SC-15).
     */
    private readonly tombstones = new Set<string>();

    /** Returns the canonical reference for a card's current incarnation. */
    public refFor(card: Card): CardRef {
        return this.refForInstance(card, card.instanceId);
    }

    /** Returns the canonical reference for a specific incarnation of a card. */
    public refForInstance(card: Card, instanceId: number): CardRef {
        const key = CardRef.buildKey(card, instanceId);
        const existing = this.interned.get(key);
        if (existing) {
            return existing;
        }

        const ref = CardRef.createForRegistry(card, instanceId);
        this.interned.set(key, ref);
        return ref;
    }

    /**
     * Returns a properties view for the reference: captured values if the incarnation has a
     * footprint, otherwise a live pass-through.
     */
    public getProperties(ref: CardRef): ICardProperties {
        const footprint = this.footprints.get(ref.key);
        if (footprint) {
            return footprint.isUnit
                ? new CapturedUnitProperties(ref, footprint)
                : new CapturedCardProperties(ref, footprint);
        }

        Contract.assertFalse(
            this.tombstones.has(ref.key),
            `The footprint for ${ref} was flushed at an action boundary, so its last known information ` +
            'is no longer available. Long-lived holders must capture values rather than holding a reference.'
        );

        const card = ref.getCardForEngine();
        Contract.assertTrue(
            ref.isCurrent,
            `${ref} names an incarnation that no longer exists and has no footprint, so nothing can be ` +
            'read from it.'
        );

        return card.isUnit() ? new LiveUnitProperties(ref, card) : new LiveCardProperties(ref, card);
    }

    /**
     * Resolves a reference to the live card, for engine use.
     *
     * Returns `null` when the reference no longer names the card's current incarnation, which is how
     * an effect targeting a card that has since left and re-entered play fizzles (D-6).
     */
    public deref(ref: CardRef): Card | null {
        return ref.isCurrent ? ref.getCardForEngine() : null;
    }

    /**
     * Captures a card's characteristics into the pending set for `eventId`.
     *
     * Called from the event window's pre-resolution step so that every card leaving play in the same
     * window is captured before any of them is removed, which is what preserves simultaneous-defeat
     * semantics (SC-5). The capture is only kept if the event actually resolves — see
     * {@link commitPending}.
     */
    public capturePending(eventId: number, card: Card): void {
        let forEvent = this.pending.get(eventId);
        if (!forEvent) {
            forEvent = new Map<string, ICapturedCardState>();
            this.pending.set(eventId, forEvent);
        }

        forEvent.set(CardRef.buildKey(card, card.instanceId), LkiRegistry.captureState(card));
    }

    /**
     * Promotes an event's pending captures to committed footprints.
     *
     * Called immediately before the event's handler runs. Events that were replaced or cancelled
     * never reach this point, so they leave no footprint behind — without this a unit that survived
     * a replaced defeat would answer with frozen characteristics for the rest of the action (D-30).
     */
    public commitPending(eventId: number): void {
        const forEvent = this.pending.get(eventId);
        if (!forEvent) {
            return;
        }

        for (const [key, captured] of forEvent) {
            this.footprints.set(key, captured);
        }
        this.pending.delete(eventId);
    }

    /** Drops an event's captures because it never resolved. */
    public discardPending(eventId: number): void {
        this.pending.delete(eventId);
    }

    /** Flushes footprints at an action boundary, leaving a tombstone for each (D-20, D-21). */
    public flushFootprints(): void {
        for (const key of this.footprints.keys()) {
            this.tombstones.add(key);
        }
        this.footprints.clear();
        this.pending.clear();
    }

    /**
     * Clears all timeline-dependent state after a rollback.
     *
     * Rollback restores tracked state but not the registry, and mid-action rollback is a first-class
     * path, so without this a footprint minted in an abandoned timeline would be served for a
     * re-created incarnation. Tombstones are cleared too: they record that an instance departed,
     * which is equally timeline-dependent, and a surviving tombstone would turn reads of a perfectly
     * live card into errors (D-29).
     *
     * The intern map is left alone — `(card, instanceId)` identity means the same thing in any
     * timeline.
     */
    public clearForRollback(): void {
        this.footprints.clear();
        this.pending.clear();
        this.tombstones.clear();
    }

    private static captureState(card: Card): ICapturedCardState {
        const wasInPlay = EnumHelpers.isArena(card.zoneName) ||
          (card.zoneName === ZoneName.Base && card.isUpgrade());

        const base = {
            title: card.title,
            type: card.type,
            controller: card.controller,
            // Copy the set: the card rebuilds its own on each read, but the footprint must not hand
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
            upgrades: card.isAttached() ? [] : card.upgrades.map((upgrade) => card.game.lkiRegistry.refFor(upgrade))
        };
    }
}
