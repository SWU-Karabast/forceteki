import type { Card } from '../card/Card';
import { CardRef } from './CardRef';
import type { ICardProperties } from './CardPropertiesInterfaces';
import type { LkiRegistry } from './LkiRegistry';
import { Contract } from '../utils/Contract';

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
     * the record written at that instant. Call sites do not need to know which, and should not
     * branch on it.
     *
     * A live {@link Card} is accepted transitionally, while events and contexts still carry card
     * objects rather than references. Once they carry references this overload goes away and the
     * parameter narrows to {@link CardRef}.
     */
    getLastKnownProperties(refOrCard: CardRef | Card): ICardProperties;

    /**
     * Returns the canonical reference for a card's current incarnation.
     *
     * Useful when an ability needs to remember *which* card it acted on across steps: references
     * compare by incarnation, so a card that left play and returned is correctly treated as a
     * different one (`SWU 8.5.4`).
     */
    refFor(card: Card): CardRef;
}

/** Adds engine-only capabilities that card implementations must not have. */
export interface IGameStateInternal extends IGameStateGetter {

    /**
     * Resolves a reference to the live card, or `null` if it no longer names the card's current
     * incarnation. A `null` result is how an effect fizzles when its target has since left and
     * re-entered play (D-6).
     */
    deref(ref: CardRef): Card | null;
}

/**
 * Concrete facade over the registry.
 *
 * Resolves the registry lazily through the game rather than holding it, because a card's setup runs
 * once at construction while the registry belongs to the current game state.
 */
export class GameStateGetter implements IGameStateInternal {
    public constructor(private readonly getRegistry: () => LkiRegistry) {}

    public getLastKnownProperties(refOrCard: CardRef | Card): ICardProperties {
        Contract.assertNotNullLike(
            refOrCard,
            'No card or reference supplied. If this came from `event.cardRef`, that event never had ' +
            'last known information captured — see LastKnownInformation.addDepartureRecordToEvent.'
        );

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
