import type { Card } from '../card/Card';
import { SaveIntegrityError } from './SavedMatchInterfaces';
import type { ISavedCardRef, SavedParentRefZone, SavedRefZone } from './SavedMatchInterfaces';

/**
 * Every ref handed out is a fresh object. The index holds one instance per card, and returning it would
 * alias the same object into many document positions, contradicting the writer's self-contained-snapshot
 * stance: a consumer mutating one coordinate would silently change every other occurrence of that card.
 */
function copyRef(ref: ISavedCardRef): ISavedCardRef {
    return ref.parent == null ? { ...ref } : { ...ref, parent: { ...ref.parent } };
}

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
 *
 * A parallel uuid-keyed index backs {@link tryLookupByUuid}, which A2's watcher
 * encoder uses. A watcher entry holds a `GameObjectId` (a branded `card.uuid`), not a `Card`, and the
 * writer must resolve it *without* calling `Game.getFromId`: that reports `SevereHaltGame` and rethrows
 * for an unregistered id, and a save is a bug-report artifact that must degrade rather than halt. Keying
 * on the plain `uuid` getter also avoids `getObjectId()`, which calls `markReferenced` and would give the
 * read-only writer a side effect. Unlike {@link resolve}, {@link tryLookupByUuid} returns `null` for an
 * unindexed card rather than synthesizing a position-less ref, because for a watcher entry "no position" is
 * the unresolvable-referent case, not a legitimate coordinate.
 */
export class SavedCardRefResolver {
    private readonly refsByCard = new Map<Card, ISavedCardRef>();
    private readonly indexedByUuid = new Map<string, { card: Card; ref: ISavedCardRef }>();

    /**
     * Indexes a card at a top-level array position, or at the `leader`/`base` singleton (ordinal `0`).
     * Throws if `card` was already indexed: the completeness assertion relies on this to guarantee that no
     * live card can occupy two positions, which is what makes "present in the index" equivalent to
     * "appears exactly once".
     */
    public indexTopLevel(card: Card, controllerSeat: string, zone: SavedRefZone, ordinal: number): void {
        this.assertNotAlreadyIndexed(card);
        this.store(card, {
            card: card.internalName,
            controllerSeat,
            zone,
            ordinal,
        });
    }

    /**
     * Indexes a card nested under another card's `upgrades` or `capturedCards` list. `parentSeat` is the
     * seat whose arrays `parentZone`/`parentOrdinal` index into, which is not necessarily `controllerSeat`
     * (see `ISavedCardRef.parent`). See {@link indexTopLevel} for the duplicate guard.
     */
    public indexNested(
        card: Card,
        controllerSeat: string,
        parentSeat: string,
        parentZone: SavedParentRefZone,
        parentOrdinal: number,
        list: 'upgrades' | 'capturedCards'
    ): void {
        this.assertNotAlreadyIndexed(card);
        this.store(card, {
            card: card.internalName,
            controllerSeat,
            zone: null,
            ordinal: null,
            parent: { seat: parentSeat, zone: parentZone, ordinal: parentOrdinal, list },
        });
    }

    /**
     * The saved coordinate of the card with this uuid together with the live card behind it, or `null` if
     * it occupies no emitted position. The two are returned as a pair because a caller needs both (the
     * coordinate to publish, the card to classify an in-play-id field against) and because `store` makes
     * "indexed with a ref but no card" impossible — two independently nullable lookups would imply a state
     * that cannot exist.
     */
    public tryLookupByUuid(uuid: string): { card: Card; ref: ISavedCardRef } | null {
        const indexed = this.indexedByUuid.get(uuid);
        if (indexed == null) {
            return null;
        }

        return { card: indexed.card, ref: copyRef(indexed.ref) };
    }

    private store(card: Card, ref: ISavedCardRef): void {
        this.refsByCard.set(card, ref);
        this.indexedByUuid.set(card.uuid, { card, ref });
    }

    private assertNotAlreadyIndexed(card: Card): void {
        const existing = this.refsByCard.get(card);
        if (existing) {
            throw new SaveIntegrityError(
                `Card "${card.internalName}" (uuid ${card.uuid}) was indexed at more than one position while saving; it is already at ${JSON.stringify(existing)}.`
            );
        }
    }

    /**
     * Whether `card` occupies an emitted position. Stated directly rather than as a
     * `resolve(...).zone != null || .parent != null` test on the synthesized ref, because the two callers
     * that ask this question (`MatchSerializer`'s unrepresented-card sweep and its completeness assertion)
     * must agree exactly on what "appears in the document" means, and a shared predicate is what makes
     * that structural.
     */
    public isIndexed(card: Card): boolean {
        return this.refsByCard.has(card);
    }

    public resolve(card: Card, controllerSeat: string): ISavedCardRef {
        const indexed = this.refsByCard.get(card);
        if (indexed) {
            return copyRef(indexed);
        }

        return {
            card: card.internalName,
            controllerSeat,
            zone: null,
            ordinal: null,
        };
    }
}
