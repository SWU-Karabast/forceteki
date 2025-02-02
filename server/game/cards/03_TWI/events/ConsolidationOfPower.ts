import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class ConsolidationOfPower extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4895747419',
            internalName: 'consolidation-of-power',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose any number of friendly units. You may play a unit from your hand if its cost is less than or equal to the combined power of the chosen units for free. Then, defeat the chosen units.',
            targetResolver: {
                mode: TargetMode.UpToVariable,
                canChooseNoCards: true,
                numCardsFunc: (context) => context.source.controller.getUnitsInPlay().length,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
            },
            then: (firstThenContext) => ({
                title: 'You may play a unit from your hand if its cost is less than or equal to the combined power of the chosen units for free.',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    mode: TargetMode.Single,
                    controller: RelativePlayer.Self,
                    cardCondition: (_, context) => context.target.cost <= firstThenContext.target.reduce((sum, card) => sum + card.getPower(), 0),
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                    }),
                },
                then: (secondThenContext) => ({
                    title: 'Then, defeat the chosen units.',
                    immediateEffect: AbilityHelper.immediateEffects.defeat({
                        target: firstThenContext.target,
                    })
                })
            })
        });
    }
}
