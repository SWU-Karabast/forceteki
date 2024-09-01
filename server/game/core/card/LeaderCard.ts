import Player from '../Player';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType, Location, LocationFilter, WildcardLocation } from '../Constants';
import { ActionAbility } from '../ability/ActionAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import TriggeredAbility from '../ability/TriggeredAbility';

interface IAbilitySet {
    actionAbilities: ActionAbility[];
    constantAbilities: IConstantAbility[];
    triggeredAbilities: TriggeredAbility[];
}


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
        this.setupLeaderAbilities();

        // TODO LEADER: add deploy epic action (see Base.ts for reference)
    }

    public override isLeader(): this is LeaderCard {
        return true;
    }

    protected setAbilities(abilities: IAbilitySet) {
        this.actionAbilities = abilities.actionAbilities;
        this.constantAbilities = abilities.constantAbilities;
        this.triggeredAbilities = abilities.triggeredAbilities;
    }

    /**
     * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderAbilities() {
    }

    protected generateCurrentAbilitySet(): IAbilitySet {
        return {
            actionAbilities: this.actionAbilities,
            constantAbilities: this.constantAbilities,
            triggeredAbilities: this.triggeredAbilities
        };
    }
}
