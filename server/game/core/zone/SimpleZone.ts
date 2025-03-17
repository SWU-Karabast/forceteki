import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';
import type Game from '../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import type { IAddRemoveZone, IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';

export interface ISimpleZoneState<TCard extends Card> extends IGameObjectBaseState {
    cards: GameObjectRef<TCard>[];
}

/**
 * Base class for zones that are basically just a list of cards with no special behavior
 */
export abstract class SimpleZone<TCard extends Card> extends ZoneAbstract<TCard, ISimpleZoneState<TCard>> implements IAddRemoveZone {
    public abstract override readonly name: ZoneName;
    public override readonly owner: Player;

    // protected _cards: TCard[] = [];

    public override get cards(): TCard[] {
        return this.state.cards.map((x) => this.game.gameObjectManager.get(x));
    }

    public override get count() {
        return this.state.cards.length;
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);
    }

    protected override onSetupDefaultState() {
        this.state.cards = [];
    }

    public override getCards(filter?: IZoneCardFilterProperties): TCard[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public addCard(card: TCard) {
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);

        this.state.cards.push(card.getRef());
    }

    public removeCard(card: Card) {
        const cardIdx = this.cards.indexOf(card as TCard);

        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current zone is ${card.zone}.`);

        this.state.cards.splice(cardIdx, 1);
    }
}
