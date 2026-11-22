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
 * {@link ICardStateInternal}, which is not re-exported to card modules (D-28).
 *
 * Which implementation a card receives depends on whether it has opted in to last known
 * information (`Card.usesLkiRegistry`); see {@link ICardStateInternal.forCard}.
 */
export interface ICardStateGetter {

    /**
     * Returns the characteristics of the card named by `ref`, as of the moment that reference
     * represents.
     *
     * For a card that has opted in, this reads live state while the card is current and, once it has
     * left play, the values from the record written at that instant. Call sites do not need to know
     * which, and should not branch on it. A card that has not opted in always reads live state,
     * exactly as reading the card directly would.
     *
     * A live {@link Card} is accepted transitionally, while events and contexts still carry card
     * objects rather than references. Once they carry references this overload goes away and the
     * parameter narrows to {@link CardRef}.
     */
    getLastKnownProperties(refOrCard: CardRef | Card): ICardProperties;

    /**
     * Returns the canonical reference for a card's current identity.
     *
     * Useful when an ability needs to remember *which* card it acted on across steps: references
     * compare by identity, so a card that left play and returned is correctly treated as a
     * different one (`SWU 8.5.4`). Available to every card, whether or not it has opted in.
     */
    getIdentity(card: Card): CardRef;
}

/** Adds engine-only capabilities that card implementations must not have. */
export interface ICardStateInternal extends ICardStateGetter {

    /**
     * Resolves a reference to the live card, or `null` if it no longer names the card's current
     * identity. A `null` result is how an effect fizzles when its target has since left and
     * re-entered play (D-6).
     */
    deref(ref: CardRef): Card | null;

    /**
     * Returns the getter that `card`'s ability setup should receive.
     *
     * A card that has opted in to last known information (`Card.usesLkiRegistry`) receives the
     * registry-backed getter. Every other card receives a live-only getter, which is what makes it
     * safe to rewrite a card's reads to go through the getter before that card is migrated.
     *
     * Pass the card whose *ability code* is being set up. When one card runs another's setup
     * (Clone, or copying a triggered ability), that is the card the code was written for, not the
     * card that is receiving the abilities.
     */
    forCard(card: Card): ICardStateGetter;
}

function assertSubjectSupplied(refOrCard: CardRef | Card): void {
    Contract.assertNotNullLike(
        refOrCard,
        'No card or reference supplied. If this came from `event.cardRef`, that event never had ' +
        'last known information captured — see LastKnownInformation.addDepartureRecordToEvent.'
    );
}

/**
 * The getter handed to cards that have not opted in to last known information.
 *
 * Every read comes from the live card, exactly as reading the card directly would, so routing a
 * card's reads through the getter changes nothing about what it sees: records, tombstones and
 * identity are all ignored, and a reference to a card's earlier identity reads the card as it is
 * now rather than failing. That is what allows every card's reads to be rewritten to go through the
 * getter ahead of the card being migrated (LKI migration, phase 3).
 *
 * Transitional: removed together with `Card.usesLkiRegistry` once every card has opted in.
 */
export class LiveOnlyCardStateGetter implements ICardStateGetter {
    public constructor(private readonly getRegistry: () => LkiRegistry) {}

    public getLastKnownProperties(refOrCard: CardRef | Card): ICardProperties {
        assertSubjectSupplied(refOrCard);

        const registry = this.getRegistry();
        const ref = refOrCard instanceof CardRef ? refOrCard : registry.getIdentity(refOrCard);
        return registry.getLiveProperties(ref);
    }

    public getIdentity(card: Card): CardRef {
        return this.getRegistry().getIdentity(card);
    }
}

/**
 * Concrete facade over the registry, for cards that have opted in to last known information.
 *
 * Resolves the registry lazily through the game rather than holding it, because a card's setup runs
 * once at construction while the registry belongs to the current game state.
 */
export class CardStateGetter implements ICardStateInternal {
    private readonly liveOnly: ICardStateGetter;

    public constructor(private readonly getRegistry: () => LkiRegistry) {
        this.liveOnly = new LiveOnlyCardStateGetter(getRegistry);
    }

    public forCard(card: Card): ICardStateGetter {
        return card.usesLkiRegistry ? this : this.liveOnly;
    }

    public getLastKnownProperties(refOrCard: CardRef | Card): ICardProperties {
        assertSubjectSupplied(refOrCard);

        const registry = this.getRegistry();
        const ref = refOrCard instanceof CardRef ? refOrCard : registry.getIdentity(refOrCard);
        return registry.getProperties(ref);
    }

    public deref(ref: CardRef): Card | null {
        return this.getRegistry().deref(ref);
    }

    public getIdentity(card: Card): CardRef {
        return this.getRegistry().getIdentity(card);
    }
}
