import type { Card } from '../card/Card';

/**
 * An opaque, interned reference to one incarnation of a physical card.
 *
 * A `CardRef` names a card without exposing it. Card implementations receive references and
 * exchange them for a properties object via the game state getter; they never reach the live
 * {@link Card} through one, which is what keeps `SWU 8.11.2` ("Last Known Information is only
 * reference information") enforceable.
 *
 * References are **interned** by the registry: there is exactly one instance per
 * `(card, instanceId)` pair for the lifetime of the game, so `===` compares incarnations rather
 * than object identity. Construct them only through `LkiRegistry.refFor`.
 *
 * References are transient and must never be written into tracked state or an undo snapshot.
 * Anything that outlives the action it was created in must store `(uuid, instanceId)` primitives
 * and rehydrate, or hold captured property values instead.
 */
export class CardRef {
    /** Key identifying the incarnation this reference names. Also the registry's footprint key. */
    public readonly key: string;

    /**
     * @param card The physical card. Deliberately private: card implementations must not be able to
     * reach the live object through a reference.
     */
    private constructor(
        private readonly card: Card,
        public readonly instanceId: number
    ) {
        this.key = CardRef.buildKey(card, instanceId);
    }

    public static buildKey(card: Card, instanceId: number): string {
        return `${card.uuid}:${instanceId}`;
    }

    /**
     * Creates a reference. Internal to the registry — going through `LkiRegistry.refFor` is what
     * guarantees interning, and an ad-hoc reference would break `===` comparisons.
     */
    public static createForRegistry(card: Card, instanceId: number): CardRef {
        return new CardRef(card, instanceId);
    }

    /**
     * The live card, for engine use only. Card implementations have no access to this: it is
     * reached via the engine-only `deref` capability, which is absent from the card-facing facade.
     */
    public getCardForEngine(): Card {
        return this.card;
    }

    /** True if this reference still names the card's current incarnation. */
    public get isCurrent(): boolean {
        return this.card.instanceId === this.instanceId;
    }

    public toString(): string {
        return `${this.card.internalName}#${this.instanceId}`;
    }
}
