import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class KarisNemikFreedomIsAPureIdea extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0994241595',
            internalName: 'karis-nemik#freedom-is-a-pure-idea',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Heroism];
        registrar.addWhenDefeatedAbility({
            title: `Disclose ${TextHelper.aspectList(aspects)} to create a Spy token and ready it`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Create a Spy token and ready it',
                immediateEffect: abilityHelper.immediateEffects.createSpy({ amount: 1, entersReady: true })
            }
        });
    }
}