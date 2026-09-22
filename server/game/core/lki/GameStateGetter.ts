import type { Card } from '../card/Card';
import { CardRef } from './CardRef';
import type { ICardProperties } from './CardPropertiesInterfaces';
import type { LkiRegistry } from './LkiRegistry';

/**
 * The card-facing view of game state.
 *
 * Deliberately has **no** way to reach a live {@link Card}. Card implementations receive one of
 * these at setup and use it to exchange references for properties; the `deref` capability lives on
 * {@link IGameStateInternal}, which is not re-exported to card modules (D-28).
 */
export interface IGameStateGetter {

    /**
     * Returns the characteristics of the card named by `ref`, as of the moment that reference
     * represents.
     *
     * While the card is current this reads live state; once it has left play the values come from
     * the footprint captured at that instant. Call sites do not need to know which, and should not
     * branch on it.
     *
     * A live {@link Card} is accepted transitionally, while events and contexts still carry card
     * objects rather than references. Once they carry references this overload goes away and the
     * parameter narrows to {@link CardRef}.
     */
    getPropertiesOrLki(refOrCard: CardRef | Card): ICardProperties;
}

/** Adds engine-only capabilities that card implementations must not have. */
export interface IGameStateInternal extends IGameStateGetter {

    /**
     * Resolves a reference to the live card, or `null` if it no longer names the card's current
     * incarnation. A `null` result is how an effect fizzles when its target has since left and
     * re-entered play (D-6).
     */
    deref(ref: CardRef): Card | null;

    /** Returns the canonical reference for a card's current incarnation. */
    refFor(card: Card): CardRef;
}

/**
 * Concrete facade over the registry.
 *
 * Resolves the registry lazily through the game rather than capturing it, because a card's setup
 * runs once at construction while the registry belongs to the current game state.
 */
export class GameStateGetter implements IGameStateInternal {
    public constructor(private readonly getRegistry: () => LkiRegistry) {}

    public getPropertiesOrLki(refOrCard: CardRef | Card): ICardProperties {
        const registry = this.getRegistry();
        const ref = refOrCard instanceof CardRef ? refOrCard : registry.refFor(refOrCard);
        return registry.getProperties(ref);
    }

    public deref(ref: CardRef): Card | null {
        return this.getRegistry().deref(ref);
    }

    public refFor(card: Card): CardRef {
        return this.getRegistry().refFor(card);
    }
}
