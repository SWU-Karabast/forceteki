import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class AssaultLanderLAAT extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4687650543',
            internalName: 'assault-lander-laat',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Clone Trooper tokens',
            immediateEffect: abilityHelper.immediateEffects.createCloneTrooper({ amount: 2 })
        });

        registrar.addTriggeredAbility({
            title: 'Deal 4 damage to this unit',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: 4, target: context.source }))
        });
    }
}