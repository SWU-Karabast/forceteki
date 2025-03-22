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

    public override get cards(): IInPlayCard[] {
        return this.state.cards.map((x) => this.game.gameObjectManager.get(x));
    }

    public override get count() {
        return this.state.cards.length;
    }

    public constructor(owner: Game, player1: Player, player2: Player) {
        super(owner);

        this.hiddenForPlayers = null;
    }

    protected override setupDefaultState() {
        this.state.cards = [];
    }

    public override getCards(filter?: IArenaZoneCardFilterProperties): IInPlayCard[] {
        const filterFn = this.buildFilterFn(filter);

        let cards: IInPlayCard[] = this.cards;
        if (filter?.controller) {
            cards = cards.filter((card) => card.controller === filter.controller);
        }

        return cards.filter(filterFn);
    }

    public addCard(card: IInPlayCard) {
        const cardIdx = this.state.cards.findIndex((x) => x.uuid === card.uuid);

        Contract.assertTrue(cardIdx === -1, `Attempting to add card ${card.internalName} to ${this} twice`);

        this.state.cards.push(card.getRef());
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.canBeInPlay());

        const cardIdx = this.state.cards.findIndex((x) => x.uuid === card.uuid);

        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it does not exist`);

        this.state.cards.splice(cardIdx, 1);
    }
}
