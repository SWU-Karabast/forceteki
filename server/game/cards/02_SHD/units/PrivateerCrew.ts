import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PrivateerCrew extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2288926269',
            internalName: 'privateer-crew',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give 3 Experience tokens to this unit',
            when: {
                whenPlayedUsingSmuggle: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 3,
                target: context.source
            })),
        });
    }
}
