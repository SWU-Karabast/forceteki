import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MazKanataItCallsToYou extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6618585456',
            internalName: 'maz-kanata#it-calls-to-you',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to this unit',
            when: {
                onCardResourced: (event, context) => event.resourceControllingPlayer === context.player
            },
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({ target: context.source }))
        });
    }
}