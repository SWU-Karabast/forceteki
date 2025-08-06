import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardZoneName } from '../../../core/Constants';

export default class R2D2Artooooooooo extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5375722883',
            internalName: 'r2d2#artooooooooo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainAbilityTargetingAttached({
            title: 'You may play or deploy 1 additional Pilot on this unit',
            type: AbilityType.Constant,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPilotingLimit({ amount: 1 })
        });

        registrar.addConstantAbility({
            title: 'This upgrade can be played on a friendly Vehicle unit with a Pilot on it.',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: AbilityHelper.ongoingEffects.ignorePilotingPilotLimit(),
        });
    }
}
