import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class DuchesssInvestigators extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6838167753',
            internalName: 'duchesss-investigators',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Cunning];

        registrar.addWhenPlayedAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to make your opponent discard a random card from their hand`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Your opponent discards a random card from their hand',
                immediateEffect: abilityHelper.immediateEffects.discardCardsFromOpponentsHand({
                    random: true,
                    amount: 1
                })
            }
        });
    }
}