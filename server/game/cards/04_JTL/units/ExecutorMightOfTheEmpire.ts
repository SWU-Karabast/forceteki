
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ExecutorMightOfTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2870117979',
            internalName: 'executor#might-of-the-empire'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create 3 TIE Fighter tokens.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter({ amount: 3 })
        });
    }
}