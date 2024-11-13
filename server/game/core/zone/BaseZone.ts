import { BaseCard } from '../card/BaseCard';
import { LeaderCard } from '../card/LeaderCard';
import { Location } from '../Constants';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import { IZoneCardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export class BaseZone extends ZoneAbstract<LeaderCard | BaseCard> {
    public readonly base: BaseCard;
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Player;
    public override readonly name: Location.Base;

    private _leader?: LeaderCard;

    public override get cards(): (LeaderCard | BaseCard)[] {
        return this._leader ? [this.base, this._leader] : [this.base];
    }

    public override get count() {
        return this._leader ? 2 : 1;
    }

    public get leader(): LeaderCard | null {
        return this._leader;
    }

    public constructor(owner: Player, base: BaseCard, leader: LeaderCard) {
        super(owner);

        this.base = base;
        this._leader = leader;
    }

    public override getCards(filter?: IZoneCardFilterProperties): (LeaderCard | BaseCard)[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public removeLeader() {
        Contract.assertNotNullLike(this._leader, `Attempting to remove leader from ${this} but it is in location ${this.owner.leader.location}`);

        this._leader = null;
    }

    public setLeader(leader: LeaderCard) {
        Contract.assertEqual(leader.controller, this.owner, `Attempting to add card ${leader.internalName} to ${this} but its controller is ${leader.controller}`);
        Contract.assertIsNullLike(this._leader, `Attempting to add leader ${leader.internalName} to ${this} but leader ${this._leader.internalName} is already there`);

        this._leader = leader;
    }
}
