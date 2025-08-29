import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import type { Aspect, CardTypeFilter, KeywordName, MoveZoneDestination, Trait } from '../Constants';
import { ZoneAbstract } from './ZoneAbstract';
import { registerState, undoArray } from '../GameObjectUtils';

/**
 * Collection of filters for searching cards in a zone.
 * If a list of values is provided, cards are matched with OR logic (just have to match one).
 * If multiple filter properties are provided, cards are matched with AND logic (must match each filter).
 *
 * For example, `{ aspect: Aspect.Cunning, trait: [Trait.Rebel, Trait.Jedi] }` will match all Cunning cards
 * that are Rebel and / or Jedi.
 */
export interface IZoneCardFilterProperties {
    aspect?: Aspect | Aspect[];
    condition?: (card: Card) => boolean;
    keyword?: KeywordName | KeywordName[];
    trait?: Trait | Trait[];
    type?: CardTypeFilter | CardTypeFilter[];
    otherThan?: Card;
}

/** Interface for zones that use a basic add card / remove card API */
export interface IAddRemoveZone {
    addCard(card: Card, zone?: MoveZoneDestination): void;
    removeCard(card: Card): void;
}

/**
 * Base class for all Zones that contain a list of Cards. Defines some common properties and methods.
 */
@registerState()
export abstract class SimpleZone<TCard extends Card = Card> extends ZoneAbstract<TCard> {
    /** Number of cards in the zone */
    public override get count(): number {
        return this._cards.length;
    }

    @undoArray(true)
    protected accessor _cards: readonly TCard[] = [];

    public override get cards(): TCard[] {
        return this._cards as TCard[];
    }

    /** Get the cards from this zone with an optional filter */
    public getCards(filter?: IZoneCardFilterProperties): TCard[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public addCard(card: TCard) {
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);


        this._cards = [...this._cards, card];
    }

    public removeCard(card: Card) {
        const cards = this.cards.filter((x) => x !== card);
        Contract.assertFalse(cards.length === this._cards.length, `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current zone is ${card.zone}.`);

        this._cards = cards;
    }

    public override toString() {
        return ('game' in this.owner ? `${this.owner.name}:` : '') + this.name;
    }
}
