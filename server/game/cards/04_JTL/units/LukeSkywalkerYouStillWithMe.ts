import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class LukeSkywalkerYouStillWithMe extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5942811090',
            internalName: 'luke-skywalker#you-still-with-me',
        };
    }

    // TODO THRAWN2: use whenDefeated: true instead of onCardDefeated

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            type: AbilityType.ReplacementEffect,
            title: 'Move Luke Skywalker to the ground arena instead of being defeated',
            when: {
                onCardDefeated: (event, context) => event.card === context.source
            },
            optional: true,
            replaceWith: {
                effect: 'move him to the ground arena instead of being defeated',
                replacementImmediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.detachPilot(),
                    AbilityHelper.immediateEffects.exhaust()
                ]),
            }
        });
    }
}
