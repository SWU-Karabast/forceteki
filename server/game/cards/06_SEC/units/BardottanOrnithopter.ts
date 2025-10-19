import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class BardottanOrnithopter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bardottan-ornithopter-id',
            internalName: 'bardottan-ornithopter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance];

        registrar.addWhenPlayedAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to draw a card`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: abilityHelper.immediateEffects.draw({ amount: 1 }),
            }
        });
    }
}
