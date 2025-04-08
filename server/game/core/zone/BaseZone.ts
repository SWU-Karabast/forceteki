import type Force from '../../cards/05_LOF/tokens/Force';
import type { IBaseCard } from '../card/BaseCard';
import type { ILeaderCard } from '../card/propertyMixins/LeaderProperties';
import type { TokenCard } from '../card/TokenCards';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import type { IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';

export interface IBaseZoneState extends IGameObjectBaseState {
    leader: GameObjectRef<ILeaderCard> | null;
    forceToken: GameObjectRef<Force> | null;    // Use abstraction or concrete type?
}

type BaseZoneCard = ILeaderCard | IBaseCard | TokenCard;

/**
 * Base zone which holds the player's base and leader
 */
export class BaseZone extends ZoneAbstract<BaseZoneCard, IBaseZoneState> {
    public readonly base: IBaseCard;
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Player;
    public override readonly name: ZoneName.Base;

    public override get cards(): (BaseZoneCard)[] {
        return [this.base, this.forceToken, this.leader]
            .filter((card) => card !== null);
    }

    public override get count() {
        return this.state.leader ? 2 : 1;
    }

    public get leader(): ILeaderCard | null {
        return this.game.gameObjectManager.get(this.state.leader);
    }

    private set leader(value: ILeaderCard | null) {
        this.state.leader = value?.getRef();
    }

    public get forceToken(): Force | null {
        return this.game.gameObjectManager.get(this.state.forceToken);
    }

    private set forceToken(value: Force | null) {
        this.state.forceToken = value?.getRef();
    }

    public hasForceToken(): boolean {
        return this.forceToken !== null;
    }

    public constructor(game: Game, owner: Player, base: IBaseCard, leader: ILeaderCard) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Base;

        this.base = base;
        this.leader = leader;

        base.initializeZone(this);
        leader.initializeZone(this);
    }

    protected override setupDefaultState() {
        this.state.leader = null;
    }

    public override getCards(filter?: IZoneCardFilterProperties): (BaseZoneCard)[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public setLeader(leader: ILeaderCard) {
        Contract.assertEqual(leader.controller, this.owner, `Attempting to add card ${leader.internalName} to ${this} as leader but its controller is ${leader.controller}`);
        Contract.assertIsNullLike(this.state.leader, `Attempting to add leader ${leader.internalName} to ${this} but a leader is already there`);

        this.leader = leader;
    }

    public removeLeader() {
        Contract.assertNotNullLike(this.state.leader, `Attempting to remove leader from ${this} but it is in zone ${this.owner.leader.zone}`);

        this.leader = null;
    }
}
