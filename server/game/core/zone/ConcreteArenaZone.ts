import type { IInPlayCard } from '../card/baseClasses/InPlayCard';
import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';
import type Game from '../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import type { IArenaZoneCardFilterProperties } from './ConcreteOrMetaArenaZone';
import { ConcreteOrMetaArenaZone } from './ConcreteOrMetaArenaZone';
import type { IAddRemoveZone } from './ZoneAbstract';

export interface IConcreteArenaZoneState extends IGameObjectBaseState {
    cards: GameObjectRef<IInPlayCard>[];
}

/**
 * Base class for the "concrete" arena zones - ground and space - which are not the meta-zone AllArenasZone
 */
export abstract class ConcreteArenaZone extends ConcreteOrMetaArenaZone<IConcreteArenaZoneState> implements IAddRemoveZone {
    public override readonly hiddenForPlayers: null;
    public abstract override readonly name: ZoneName;
    public override readonly owner: Game;

    // STATE: This is a "cached" state field, it's a field derived from one or more values on the state object, and needs to be updated after a state change.
    protected _playerCards = new Map<Player, IInPlayCard[]>();

    public override get cards(): IInPlayCard[] {
        return this.state.cards.map((x) => this.game.gameObjectManager.get(x));
    }

    public override get count() {
        let cardCount = 0;
        this._playerCards.forEach((cards) => cardCount += cards.length);
        return cardCount;
    }

    public constructor(owner: Game, player1: Player, player2: Player) {
        super(owner);

        this.hiddenForPlayers = null;

        this._playerCards.set(player1, []);
        this._playerCards.set(player2, []);
    }

    protected override onSetupDefaultState() {
        this.state.cards = [];
    }

    public override getCards(filter?: IArenaZoneCardFilterProperties): IInPlayCard[] {
        const filterFn = this.buildFilterFn(filter);

        let cards: IInPlayCard[] = [];

        for (const [player, playerCards] of this._playerCards) {
            if (!filter?.controller || filter.controller === player) {
                cards = cards.concat(playerCards.filter(filterFn));
            }
        }

        return cards;
    }

    public addCard(card: IInPlayCard) {
        const controller = card.controller;
        const cardListForController = this._playerCards.get(controller);
        const cardIdx = this.state.cards.findIndex((x) => x.uuid === card.uuid);

        Contract.assertHasKey(this._playerCards, controller, `Attempting to add card ${card.internalName} to ${this} but the controller ${controller} is not registered`);
        Contract.assertFalse(this._playerCards.get(controller.opponent).includes(card), `Attempting to add card ${card.internalName} for ${controller} to ${this} but it is already in the arena for the opponent`);
        Contract.assertFalse(cardListForController.includes(card), `Attempting to add card ${card.internalName} for ${controller} to ${this} twice`);
        Contract.assertTrue(cardIdx === -1, `Attempting to add card ${card.internalName} to ${this} twice`);

        cardListForController.push(card);
        this.state.cards.push(card.getRef());
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.canBeInPlay());

        const controller = card.controller;
        const cardListForController = this._playerCards.get(controller);
        const playerCardIdx = cardListForController.indexOf(card);
        const cardIdx = this.state.cards.findIndex((x) => x.uuid === card.uuid);

        Contract.assertHasKey(this._playerCards, controller, `Attempting to add card ${card.internalName} to ${this} but the controller ${controller} is not registered`);
        Contract.assertFalse(this._playerCards.get(controller.opponent).includes(card), `Attempting to remove card ${card.internalName} for controller ${controller} from ${this} but it is in the arena for the opponent`);
        Contract.assertFalse(playerCardIdx === -1, `Attempting to remove card ${card.internalName} for ${controller} from ${this} but it does not exist`);
        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it does not exist`);

        cardListForController.splice(playerCardIdx, 1);
        this.state.cards.splice(cardIdx, 1);
    }

    public updateController(card: Card) {
        Contract.assertTrue(card.canBeInPlay());

        const controllerCardsList = this._playerCards.get(card.controller);

        // card is already in its controller's list, nothing to do
        if (controllerCardsList.includes(card)) {
            return;
        }

        const opponentCardsList = this._playerCards.get(card.controller.opponent);
        const removeCardIdx = opponentCardsList.indexOf(card);

        Contract.assertTrue(removeCardIdx !== -1, `Attempting to update controller of card ${card.internalName} to ${card.controller} in ${this} but it is not in the arena`);

        opponentCardsList.splice(removeCardIdx, 1);
        controllerCardsList.push(card);
        // No `this.cards.state` change required.
    }

    // Unused but setup as an example for future use.
    public override onAfterSetState() {
        super.onAfterSetState();

        this._playerCards.forEach((playerCards) => {
            // In JS, this will clear the array under the hood.
            playerCards.length = 0;
        });

        // Now that the cached player-card mappings are cleared, re-add them to the array.
        const cards = this.cards;
        for (const card of cards) {
            this._playerCards.get(card.controller).push(card);
        }
    }
}
