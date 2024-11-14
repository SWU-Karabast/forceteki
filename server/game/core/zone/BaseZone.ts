import { BaseCard } from '../card/BaseCard';
import { LeaderCard } from '../card/LeaderCard';
import { Location } from '../Constants';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import { IZoneCardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export class BaseZone extends ZoneAbstract<LeaderCard | BaseCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Player;
    public override readonly name: Location.Base;

    private _base?: BaseCard;
    private _leader?: LeaderCard;

    public get base(): BaseCard | null {
        return this._base;
    }

    public override get cards(): (LeaderCard | BaseCard)[] {
        return this._leader ? [this.base, this._leader] : [this.base];
    }

    public override get count() {
        return this._leader ? 2 : 1;
    }

    public get leader(): LeaderCard | null {
        return this._leader;
    }

    public constructor(owner: Player) {
        super(owner);
    }

    public override getCards(filter?: IZoneCardFilterProperties): (LeaderCard | BaseCard)[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public setLeader(leader: LeaderCard) {
        Contract.assertEqual(leader.controller, this.owner, `Attempting to add card ${leader.internalName} to ${this} as leader but its controller is ${leader.controller}`);
        Contract.assertIsNullLike(this._leader, `Attempting to add leader ${leader.internalName} to ${this} but a leader is already there`);

        this._leader = leader;
    }

    public removeLeader() {
        Contract.assertNotNullLike(this._leader, `Attempting to remove leader from ${this} but it is in location ${this.owner.leader.location}`);

        this._leader = null;
    }

    public setBase(base: BaseCard) {
        Contract.assertEqual(base.controller, this.owner, `Attempting to add card ${base.internalName} to ${this} as base but its controller is ${base.controller}`);
        Contract.assertIsNullLike(this._base, `Attempting to add base ${base.internalName} to ${this} but a base is already there`);

        this._base = base;
    }

    public removeBase() {
        Contract.assertNotNullLike(this._base, `Attempting to remove base from ${this} but it is in location ${this.owner.base.location}`);

        this._base = null;
    }
}
