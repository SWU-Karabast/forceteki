import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DexterJettsterObiWannnn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6667477538',
            internalName: 'dexter-jettster#obiwannnn',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(1)} to look at the top 3 cards of your deck`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: {
                title: 'Look at the top 3 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order',
                immediateEffect: abilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 3 })
            }
        });
    }
}
