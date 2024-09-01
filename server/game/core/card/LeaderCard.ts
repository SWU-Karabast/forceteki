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

        this.addActionAbility({
            title: `Deploy ${this.name}`,
            limit: AbilityHelper.limit.perGame(1),
            locationFilter: Location.Base,
            immediateEffect: AbilityHelper.immediateEffects.deploy(cardData.defaultArena)
        });
    }

    public override isLeader(): this is LeaderCard {
        return true;
    }

    /**
     * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderSideAbilities() {
    }
}
