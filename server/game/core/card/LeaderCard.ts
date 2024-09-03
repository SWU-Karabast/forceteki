import Player from '../Player';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';

export class LeaderCard extends InPlayCard {
    protected _deployed = false;

    protected setupLeaderUnitSide;

    public get deployed() {
        return this._deployed;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Leader);

        this.setupLeaderUnitSide = false;
        this.setupLeaderSideAbilities();
    }

    public override isLeader(): this is LeaderCard {
        return true;
    }

    // this is overriden in the LeaderUnit derived class
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public deploy() {}

    /**
     * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderSideAbilities() {}
}
