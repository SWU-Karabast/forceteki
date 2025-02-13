import type { IBaseCard } from '../card/BaseCard';
import type { ILeaderCard } from '../card/LeaderCard';
import { ZoneName } from '../Constants';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import type { IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';

/**
 * Base zone which holds the player's base and leader
 */
export class BaseZone extends ZoneAbstract<ILeaderCard | IBaseCard> {
    public readonly base: IBaseCard;
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Player;
    public override readonly name: ZoneName.Base;

    private _leader?: ILeaderCard;

    public override get cards(): (ILeaderCard | IBaseCard)[] {
        return this._leader ? [this.base, this._leader] : [this.base];
    }

    public override get count() {
        return this._leader ? 2 : 1;
    }

    public get leader(): ILeaderCard | null {
        return this._leader;
    }

    public constructor(owner: Player, base: IBaseCard, leader: ILeaderCard) {
        super(owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Base;

        this.base = base;
        this._leader = leader;

        base.initializeZone(this);
        leader.initializeZone(this);
    }

    public override getCards(filter?: IZoneCardFilterProperties): (ILeaderCard | IBaseCard)[] {
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
}
