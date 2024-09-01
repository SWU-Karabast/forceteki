import Player from '../Player';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType, Location, LocationFilter, WildcardLocation } from '../Constants';
import { ActionAbility } from '../ability/ActionAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import AbilityHelper from '../../AbilityHelper';


export class LeaderCard extends InPlayCard {
    protected _isDeployed = false;

    protected setupLeaderUnitSide;

    public get isDeployed() {
        return this._isDeployed;
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
