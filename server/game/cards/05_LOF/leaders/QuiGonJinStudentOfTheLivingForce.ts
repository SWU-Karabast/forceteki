import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, CardType, RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class QuiGonJinStudentOfTheLivingForce extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2580909557',
            internalName: 'quigon-jinn#student-of-the-living-force',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Return a friendly unit to hand',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                activePromptTitle: 'Return a friendly non-leader unit to its owner\'s hand',
                controller: RelativePlayer.Self,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Play a non-Villainy unit that costs x or less',
                targetResolver: {
                    activePromptTitle: 'Play a non-Villainy unit that costs x or less',
                    cardTypeFilter: CardType.BasicUnit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card) => card.isUnit() && !card.hasSomeAspect(Aspect.Villainy) && card.cost < ifYouDoContext.target.cost,
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        playAsType: WildcardCardType.Unit
                    })
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Return a friendly unit to hand',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                activePromptTitle: 'Return a friendly non-leader unit to its owner\'s hand',
                controller: RelativePlayer.Self,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Play a non-Villainy unit that costs x or less',
                targetResolver: {
                    activePromptTitle: 'Play a non-Villainy unit that costs x or less',
                    cardTypeFilter: CardType.BasicUnit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card) => card.isUnit() && !card.hasSomeAspect(Aspect.Villainy) && card.cost < ifYouDoContext.target.cost,
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        playAsType: WildcardCardType.Unit
                    })
                }
            })
        });
    }
}