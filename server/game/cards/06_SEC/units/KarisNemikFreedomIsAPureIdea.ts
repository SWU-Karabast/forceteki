import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class KarisNemikFreedomIsAPureIdea extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'karis-nemik#freedom-is-a-pure-idea-id',
            internalName: 'karis-nemik#freedom-is-a-pure-idea',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Heroism];
        registrar.addWhenDefeatedAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to create a Spy token and ready it`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Create a Spy token and ready it',
                immediateEffect: abilityHelper.immediateEffects.createSpy({ amount: 1, entersReady: true })
            }
        });
    }
}