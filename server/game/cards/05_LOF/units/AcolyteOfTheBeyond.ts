import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AcolyteOfTheBeyond extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0958021533',
            internalName: 'acolyte-of-the-beyond',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onAttack: true,
                whenDefeated: true
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou(),
        });
    }
}