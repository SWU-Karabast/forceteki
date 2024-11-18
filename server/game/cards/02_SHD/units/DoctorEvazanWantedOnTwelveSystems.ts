import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DoctorEvazanWantedOnTwelveSystems extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6135081953',
            internalName: 'doctor-evazan#wanted-on-twelve-systems'
        };
    }

    public override setupCardAbilities () {
        this.addBountyAbility({
            title: 'Ready up to 12 resources',
            // force resolution of this just to skip prompting the player. we can safely assume they will always want to ready  all resources
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 12 })
        });
    }
}

DoctorEvazanWantedOnTwelveSystems.implemented = true;
