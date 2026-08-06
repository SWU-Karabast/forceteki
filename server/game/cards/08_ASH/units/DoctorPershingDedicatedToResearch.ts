import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DoctorPershingDedicatedToResearch extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2812074334',
            internalName: 'doctor-pershing#dedicated-to-research',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.remainingHp >= 3,
                onTrue: abilityHelper.immediateEffects.draw()
            })
        });
    }
}
