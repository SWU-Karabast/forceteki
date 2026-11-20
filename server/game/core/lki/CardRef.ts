import type { Card } from '../card/Card';

declare const cardReferenceBrand: unique symbol;

/**
 * A reference to one copy of a card, as card code sees it: something to compare and to hand to the
 * card state getter, and nothing more. References are interned, so `===` compares copies.
 *
 * Card code cannot reach the card through one (D-28): the engine's {@link CardRef} implements this, and
 * the engine-only members stay off this type. The `forceteki/no-lki-engine-access` lint rule backs it up
 * in card code.
 */
export interface ICardReference {
    readonly [cardReferenceBrand]: true;
}

/**
 * An opaque, interned reference to one identity of a physical card: the engine's side of
 * {@link ICardReference}.
 *
 * A `CardRef` names a card without exposing it. Card implementations receive references and
 * exchange them for a properties object via the card state getter; they never reach the live
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
export class CardRef implements ICardReference {
    public declare readonly [cardReferenceBrand]: true;

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
     * The engine's side of a reference handed in by card code. Every {@link ICardReference} is a
     * `CardRef`, because only the registry makes them.
     */
    public static fromCardReference(ref: ICardReference): CardRef {
        return ref as CardRef;
    }

    /** The live card, for engine use only. Not on {@link ICardReference}, so card code cannot reach it. */
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
