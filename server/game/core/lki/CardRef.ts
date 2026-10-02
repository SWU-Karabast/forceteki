import type { Card } from '../card/Card';

/**
 * An opaque, interned reference to one identity of a physical card.
 *
 * A `CardRef` names a card without exposing it. Card implementations receive references and
 * exchange them for a properties object via the game state getter; they never reach the live
 * {@link Card} through one, which is what keeps `SWU 8.11.2` ("Last Known Information is only
 * reference information") enforceable.
 *
 * References are **interned** by the registry: there is exactly one object per
 * `(card, identityId)` pair for the lifetime of the game, so `===` compares card identities rather
 * than object identity. Construct them only through `LkiRegistry.getIdentity`.
 *
 * References are transient and must never be written into tracked state or an undo snapshot.
 * Anything that outlives the action it was created in must store `(uuid, identityId)` primitives
 * and rehydrate, or hold recorded property values instead.
 */
export class CardRef {
    /** Key identifying the identity this reference names. Also the registry's record key. */
    public readonly key: string;

    /**
     * @param card The physical card. Deliberately private: card implementations must not be able to
     * reach the live object through a reference.
     */
    private constructor(
        private readonly card: Card,
        public readonly identityId: number
    ) {
        this.key = CardRef.buildKey(card, identityId);
    }

    public static buildKey(card: Card, identityId: number): string {
        return `${card.uuid}:${identityId}`;
    }

    /**
     * Creates a reference. Internal to the registry — going through `LkiRegistry.getIdentity` is what
     * guarantees interning, and an ad-hoc reference would break `===` comparisons.
     */
    public static createForRegistry(card: Card, identityId: number): CardRef {
        return new CardRef(card, identityId);
    }

    /**
     * The live card, for engine use only. Card implementations have no access to this: it is
     * reached via the engine-only `deref` capability, which is absent from the card-facing facade.
     */
    public getCardForEngine(): Card {
        return this.card;
    }

    /** True if this reference still names the card's current identity. */
    public get isCurrent(): boolean {
        return this.card.identityId === this.identityId;
    }

    public toString(): string {
        return `${this.card.internalName}#${this.identityId}`;
    }
}
