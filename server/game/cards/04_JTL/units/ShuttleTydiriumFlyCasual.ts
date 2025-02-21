import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ShuttleTydiriumFlyCasual extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1990020761',
            internalName: 'shuttle-tydirium#fly-casual',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Discard a card from your deck',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: 'You may give an Experience token to another unit',
                ifYouDoCondition: () => context.events[0].card?.printedCost % 2 === 1,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== this,
                    innerSystem: AbilityHelper.immediateEffects.giveExperience()
                })
            })
        });
    }
}