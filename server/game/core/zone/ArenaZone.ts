import { InPlayCard } from '../card/baseClasses/InPlayCard';
import { Card } from '../card/Card';
import { Location, WildcardCardType } from '../Constants';
import Game from '../Game';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import { ICardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export interface IArenaCardFilterProperties extends ICardFilterProperties {
    controller?: Player;
}

export abstract class ArenaZone extends ZoneAbstract<InPlayCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Game;

    protected _cards = new Map<Player, InPlayCard[]>();

    public override get cards(): InPlayCard[] {
        return Array.from(this._cards.values()).flat();
    }

    public override get count() {
        let cardCount = 0;
        this._cards.forEach((cards) => cardCount += cards.length);
        return cardCount;
    }

    public constructor(owner: Game) {
        super(owner);
    }

    public override getCards(filter?: IArenaCardFilterProperties): InPlayCard[] {
        const filterFn = this.buildFilterFn(filter);

        let cards: InPlayCard[] = [];

        for (const [player, playerCards] of this._cards) {
            if (!filter?.controller || filter.controller === player) {
                cards = cards.concat(playerCards.filter(filterFn));
            }
        }

        return cards;
    }

    public getUnitCards(filter?: Omit<IArenaCardFilterProperties, 'type'>): InPlayCard[] {
        return this.getCards({ ...filter, type: WildcardCardType.Unit });
    }

    public getUpgradeCards(filter?: Omit<IArenaCardFilterProperties, 'type'>): InPlayCard[] {
        return this.getCards({ ...filter, type: WildcardCardType.Upgrade });
    }

    public addCard(card: InPlayCard) {
        const controller = card.controller;
        const cardListForController = this._cards.get(controller);

        Contract.assertHasKey(this._cards, controller, `Attempting to add card ${card.internalName} to ${this} but the controller ${controller} is not registered`);
        Contract.assertFalse(this._cards.get(controller.opponent).includes(card), `Attempting to add card ${card.internalName} for ${controller} to ${this} but it is already in the arena for the opponent`);
        Contract.assertFalse(cardListForController.includes(card), `Attempting to add card ${card.internalName} for ${controller} to ${this} twice`);

        cardListForController.push(card);
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.canBeInPlay());

        const controller = card.controller;
        const cardListForController = this._cards.get(controller);
        const cardIdx = cardListForController.indexOf(card);

        Contract.assertHasKey(this._cards, controller, `Attempting to add card ${card.internalName} to ${this} but the controller ${controller} is not registered`);
        Contract.assertFalse(this._cards.get(controller.opponent).includes(card), `Attempting to remove card ${card.internalName} for controller ${controller} from ${this} but it is in the arena for the opponent`);
        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} for ${controller} from ${this} but it does not exist`);

        cardListForController.splice(cardIdx, 1);
    }
}
