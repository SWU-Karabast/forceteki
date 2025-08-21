import type { IBaseCard } from '../card/BaseCard';
import type { ILeaderCard } from '../card/propertyMixins/LeaderProperties';
import type { ITokenCard } from '../card/propertyMixins/Token';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import { registerState, undoObject } from '../GameObjectUtils';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import type { IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';

type IBaseZoneCard = ILeaderCard | IBaseCard | ITokenCard;

/**
 * Base zone which holds the player's base and leader
 */
@registerState()
export class BaseZone extends ZoneAbstract<IBaseZoneCard> {
    public readonly base: IBaseCard;
    public override readonly hiddenForPlayers: null;
    public declare readonly owner: Player;
    public override readonly name: ZoneName.Base;

    @undoObject()
    private accessor _leader: ILeaderCard | null = null;

    @undoObject()
    private accessor _forceToken: ITokenCard | null = null;

    public override get cards(): (IBaseZoneCard)[] {
        return [this.base, this.forceToken, this.leader]
            .filter((card) => card !== null);
    }

    public override get count() {
        return this._leader ? 2 : 1;
    }

    public get leader(): ILeaderCard | null {
        return this._leader;
    }

    public get forceToken(): ITokenCard | null {
        return this._forceToken;
    }

    public hasForceToken(): boolean {
        return this.forceToken != null;
    }

    public constructor(game: Game, owner: Player, base: IBaseCard, leader: ILeaderCard) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Base;

        this.base = base;
        this._leader = leader;

        base.initializeZone(this);
        leader.initializeZone(this);
    }

    public override getCards(filter?: IZoneCardFilterProperties): (IBaseZoneCard)[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public setLeader(leader: ILeaderCard) {
        Contract.assertEqual(leader.controller, this.owner, `Attempting to add card ${leader.internalName} to ${this} as leader but its controller is ${leader.controller}`);
        Contract.assertIsNullLike(this._leader, `Attempting to add leader ${leader.internalName} to ${this} but a leader is already there`);

        this._leader = leader;
    }

    public removeLeader() {
        Contract.assertNotNullLike(this._leader, `Attempting to remove leader from ${this} but it is in zone ${this.owner.leader.zone}`);

        this._leader = null;
    }

    public setForceToken(forceToken: ITokenCard) {
        Contract.assertEqual(forceToken.controller, this.owner, `Attempting to add a force token to ${this} but its controller is ${forceToken.controller}`);
        Contract.assertIsNullLike(this.forceToken, `Attempting to add a force token to ${this} but a force token is already there`);

        this._forceToken = forceToken;
    }

    public removeForceToken() {
        Contract.assertNotNullLike(this.forceToken, `Attempting to remove force token from ${this} but none exists`);

        this._forceToken = null;
    }
}
