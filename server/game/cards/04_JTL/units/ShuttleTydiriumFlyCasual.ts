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
            title: 'Discard a card from your deck. If it has an odd cost, you may give an Experience token to another unit',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.source.controller
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    condition: () => {
                        const isOdd = context.events[0].card?.printedCost % 2 === 1;
                        return isOdd;
                    },
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience()
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }))
            ])
        });
    }
}