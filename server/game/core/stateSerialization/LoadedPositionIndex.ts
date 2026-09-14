import type { Card } from '../card/Card';
import { MatchLoadError } from './MatchLoadError';
import type { ISavedCardRef, SavedParentRefZone, SavedRefZone } from './SavedMatchInterfaces';

interface INestedPositionEntry {
    internalName: string;

    /** The seat that both owns and controls this nested card, per `MatchPositionInjector`'s placement contract (see the module doc comment). */
    seat: string;
    card: Card;
}

function topLevelKey(seat: string, zone: SavedRefZone, ordinal: number): string {
    return `${seat}\u0000${zone}\u0000${ordinal}`;
}

function nestedListKey(parentSeat: string, parentZone: SavedParentRefZone, parentOrdinal: number, list: 'upgrades' | 'capturedCards'): string {
    return `${parentSeat}\u0000${parentZone}\u0000${parentOrdinal}\u0000${list}`;
}

/**
 * Records `(seat, zone, ordinal) -> Card` and `(parentSeat, parentZone, parentOrdinal, list) -> Card[]` as
 * `MatchPositionInjector` places each card, plus the synthetic `forceToken`/`creditTokens` positions, and
 * resolves an `ISavedCardRef` back to the live `Card` it named at save time.
 *
 * Built from what was placed, not re-derived from live zone order: the loader's own coordinate space is the
 * one this document was written in, and re-deriving from zone order would silently repoint a ref if a
 * placement pass ever changed order.
 */
export class LoadedPositionIndex {
    private readonly topLevel = new Map<string, Card>();
    private readonly nested = new Map<string, INestedPositionEntry[]>();

    public recordTopLevel(seat: string, zone: SavedRefZone, ordinal: number, card: Card): void {
        this.topLevel.set(topLevelKey(seat, zone, ordinal), card);
    }

    /**
     * Records a card attached under `parentSeat`'s `parentZone[parentOrdinal].list`, in placement order.
     * `seat` is the card's owner, which is also its controller for every nested card this loader places
     * (`MatchPositionInjector.attachUpgrade`/`captureCard` never changes controller) — see
     * {@link resolveRef}'s nested-match rule, which relies on that coincidence.
     */
    public recordNested(parentSeat: string, parentZone: SavedParentRefZone, parentOrdinal: number, list: 'upgrades' | 'capturedCards', internalName: string, seat: string, card: Card): void {
        const key = nestedListKey(parentSeat, parentZone, parentOrdinal, list);
        const entries = this.nested.get(key) ?? [];
        entries.push({ internalName, seat, card });
        this.nested.set(key, entries);
    }

    /**
     * Resolves `ref` to the `Card` it named at save time, or throws `MatchLoadError` for an unresolvable
     * coordinate.
     *
     * A nested ref (one with `ref.parent` set) resolves to the **lowest-index** entry in that parent's list
     * matching `ref.card` (internal name) and `ref.controllerSeat`. `ISavedAttachedCard` records only
     * `{card, ownerSeat}` — no nested ordinal and no recorded controller — so `ref.controllerSeat` is used
     * as the match key in place of an owner field the ref does not carry; this is sound only because owner
     * and controller are coincident for every nested card this loader places (see {@link recordNested}).
     * Two identical, same-owner cards under one parent are genuinely indistinguishable in the `v1`
     * coordinate space; matching the first is a schema property, not a loader defect (see the owning plan's
     * durable decision on this).
     *
     * KNOWN GAP (accepted for this lifecycle): `ISavedAttachedCard` records only
     * `{card, ownerSeat}`, never a controller, so this rejects a controller/owner divergence only when some
     * *other* document fact (in practice, a state-watcher entry) happens to resolve that same nested card
     * via `ref.controllerSeat` and hits the owner-mismatch branch below. A nested card whose controller
     * diverged from its owner with no such coincidental reference (the common case once enough phases have
     * passed that no watcher still names it) loads silently under the wrong controller. Closing this
     * generally needs a schema extension (recording the nested card's controller, not just its owner) that
     * is out of this unit's scope; a document-level rejection cannot be added here without that extension.
     */
    public resolveRef(ref: ISavedCardRef): Card {
        if (ref.parent != null) {
            const key = nestedListKey(ref.parent.seat, ref.parent.zone, ref.parent.ordinal, ref.parent.list);
            const entries = this.nested.get(key) ?? [];
            const match = entries.find((entry) => entry.internalName === ref.card && entry.seat === ref.controllerSeat);
            if (match == null) {
                // A same-name entry recorded under a *different* seat is not a missing card: it is this
                // ref's controllerSeat (the card's real, live controller when some other part of the
                // document -- e.g. a state watcher entry -- resolved it via SavedCardRefResolver.resolve)
                // disagreeing with the owner seat this loader placed it under (`ISavedAttachedCard` records
                // only `{card, ownerSeat}`, and MatchPositionInjector never changes a nested card's
                // controller away from its owner). That divergence is real and reachable (EvidenceOfTheCrime
                // and others take control of an opponent-owned, non-token upgrade), and this document format
                // cannot represent it, so name the actual cause instead of a generic lookup failure.
                const ownerMismatch = entries.find((entry) => entry.internalName === ref.card);
                if (ownerMismatch != null) {
                    throw new MatchLoadError(
                        `Saved card reference to "${ref.card}" nested under ${ref.parent.seat}'s ${ref.parent.zone}[${ref.parent.ordinal}].${ref.parent.list} records its controller as seat "${ref.controllerSeat}", but the document placed that nested card under owner seat "${ownerMismatch.seat}". A nested card whose controller differs from its owner cannot be represented in this document's schema (v1 ISavedAttachedCard records only card and ownerSeat), so this save cannot be loaded faithfully.`
                    );
                }
                throw new MatchLoadError(`Could not resolve a saved card reference to "${ref.card}" nested under ${ref.parent.seat}'s ${ref.parent.zone}[${ref.parent.ordinal}].${ref.parent.list}.`);
            }
            return match.card;
        }

        if (ref.zone == null || ref.ordinal == null) {
            throw new MatchLoadError(`Could not resolve a saved card reference to "${ref.card}": it names no position in this document.`);
        }

        const card = this.topLevel.get(topLevelKey(ref.controllerSeat, ref.zone, ref.ordinal));
        if (card == null) {
            throw new MatchLoadError(`Could not resolve a saved card reference to "${ref.card}" at ${ref.controllerSeat}'s ${ref.zone}[${ref.ordinal}].`);
        }
        // The nested branch above verifies `entry.internalName === ref.card`; this top-level branch must
        // do the same, or a stale/fabricated (seat, zone, ordinal) that happens to be occupied resolves
        // silently to whatever card is actually there instead of naming the mismatch.
        if (card.internalName !== ref.card) {
            throw new MatchLoadError(`Saved card reference named "${ref.card}" at ${ref.controllerSeat}'s ${ref.zone}[${ref.ordinal}], but that position holds "${card.internalName}".`);
        }
        return card;
    }
}
