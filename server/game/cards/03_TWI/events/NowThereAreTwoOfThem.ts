import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, Trait, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class NowThereAreTwoOfThem extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6849037019',
            internalName: 'now-there-are-two-of-them'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'If you control exactly one unit, play a non-Vehicle unit from your hand that shares a Trait with the unit you control. It costs 5 less.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.getUnitsInPlay().length === 1,
                onFalse: AbilityHelper.immediateEffects.noAction(),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Play a non-Vehicle unit from your hand that shared a Trait with the unit you control. It costs 5 less.',
                    cardTypeFilter: CardType.BasicUnit,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card, context) =>
                        !card.hasSomeTrait(Trait.Vehicle) &&
                        Array.from(context.source.controller.getUnitsInPlay()[0].traits).some((trait) => card.hasSomeTrait(trait)),
                    innerSystem: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 5 }
                    })
                }),
            })
        });
    }
}
