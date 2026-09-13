import type { Card } from '../card/Card';
import { SaveIntegrityError } from './SavedMatchInterfaces';
import type { ISavedCardRef, SavedRefZone } from './SavedMatchInterfaces';

/**
 * Builds and resolves the `Map<Card, ISavedCardRef>` index of every position `MatchSerializer` emits, so
 * that `engineOnlyFacts` (and, later, A2's watcher entries) can reference a card by its in-file coordinate
 * rather than its uuid. This is built during phase 2 of the write (the position walk) and consulted during
 * phase 3 (detection and manifest); A2 inherits it unchanged.
 *
 * A card that was indexed only as a nested position (attached as an upgrade, or captured) resolves with
 * `zone: null, ordinal: null` and a populated `parent`: its own position is described entirely through the
 * parent. A card that was never indexed at all — reachable only for a zone-less card that is still an
 * effect's source — resolves with `zone: null, ordinal: null` and no `parent`, which is the schema's
 * declared "referent not in any emitted position" form.
 */
export class SavedCardRefResolver {
    private readonly refsByCard = new Map<Card, ISavedCardRef>();

    /**
     * Indexes a card at a top-level array position, or at the `leader`/`base` singleton (ordinal `0`).
     * Throws if `card` was already indexed: the completeness assertion relies on this to guarantee that no
     * live card can occupy two positions, which is what makes "present in the index" equivalent to
     * "appears exactly once".
     */
    public indexTopLevel(card: Card, controllerSeat: string, zone: SavedRefZone, ordinal: number): void {
        this.assertNotAlreadyIndexed(card);
        this.refsByCard.set(card, {
            card: card.internalName,
            controllerSeat,
            zone,
            ordinal,
        });
    }

    /** Indexes a card nested under another card's `upgrades` or `capturedCards` list. See {@link indexTopLevel} for the duplicate guard. */
    public indexNested(
        card: Card,
        controllerSeat: string,
        parentZone: SavedRefZone,
        parentOrdinal: number,
        list: 'upgrades' | 'capturedCards'
    ): void {
        this.assertNotAlreadyIndexed(card);
        this.refsByCard.set(card, {
            card: card.internalName,
            controllerSeat,
            zone: null,
            ordinal: null,
            parent: { zone: parentZone, ordinal: parentOrdinal, list },
        });
    }

    private assertNotAlreadyIndexed(card: Card): void {
        const existing = this.refsByCard.get(card);
        if (existing) {
            throw new SaveIntegrityError(
                `Card "${card.internalName}" (uuid ${card.uuid}) was indexed at more than one position while saving; it is already at ${JSON.stringify(existing)}.`
            );
        }
    }

    public resolve(card: Card, controllerSeat: string): ISavedCardRef {
        const indexed = this.refsByCard.get(card);
        if (indexed) {
            return indexed;
        }

        return {
            card: card.internalName,
            controllerSeat,
            zone: null,
            ordinal: null,
        };
    }
}
