import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ShuttleTydiriumFlyCasual extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1990020761',
            internalName: 'shuttle-tydirium#fly-casual',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your deck. If you do, give an Experience token to another unit',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: 'You may give an Experience token to another unit',
                optional: true,
                ifYouDoCondition: () => context.events[0].card?.printedCost % 2 === 1,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== this,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                })
            })
        });
    }
}