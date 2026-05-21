import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DoctorPershingDedicatedToResearch extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'doctor-pershing#dedicated-to-research-id',
            internalName: 'doctor-pershing#dedicated-to-research',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: () => true,
                onTrue: abilityHelper.immediateEffects.draw()
            })
        });
    }
}
