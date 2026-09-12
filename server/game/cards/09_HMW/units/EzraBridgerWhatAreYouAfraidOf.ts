import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class EzraBridgerWhatAreYouAfraidOf extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ezra-bridger#what-are-you-afraid-of-id',
            internalName: 'ezra-bridger#what-are-you-afraid-of',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 3 damage to your base to create a Beast token',
            optional: true,
            when: {
                onClaimInitiative: (event, context) => event.player === context.player,
            },
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 3,
                target: context.player.base
            })),
            ifYouDo: {
                title: 'Create a Beast token',
                immediateEffect: abilityHelper.immediateEffects.createBeast()
            }
        });
    }
}