import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class RegulationsBureaucrat extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5572220841',
            internalName: 'regulations-bureaucrat'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Exhaust a resource',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.selectPlayer({
                immediateEffect: AbilityHelper.immediateEffects.exhaustResources({ amount: 1 }),
            }),
        });
    }
}