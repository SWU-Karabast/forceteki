import { Card } from '../card/Card';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import { ICardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export abstract class SimpleZone<TCard extends Card> extends ZoneAbstract<TCard> {
    public override readonly owner: Player;

    protected _cards: TCard[] = [];

    public override get cards(): TCard[] {
        return [...this._cards];
    }

    public override get count() {
        return this._cards.length;
    }

    public constructor(owner: Player) {
        super(owner);
    }

    public override getCards(filter?: ICardFilterProperties): TCard[] {
        return this._cards.filter(this.buildFilterFn(filter));
    }

    public addCard(card: TCard) {
        Contract.assertFalse(this._cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);

        this._cards.push(card);
    }

    public removeCard(card: Card) {
        const cardIdx = this._cards.indexOf(card as TCard);

        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current location is ${card.location}.`);

        this._cards.splice(cardIdx, 1);
    }
}
