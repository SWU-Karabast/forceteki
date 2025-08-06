import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class QuiGonJinStudentOfTheLivingForce extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2580909557',
            internalName: 'quigon-jinn#student-of-the-living-force',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand. If you do, play a non-Villainy unit that costs less than the returned unit for free',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Play a non-Villainy unit that costs less than ${ifYouDoContext.target.cost}`,
                targetResolver: {
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

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand. If you do, play a non-Villainy unit that costs less than the returned unit for free',
            optional: true,
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Play a non-Villainy unit that costs less then ${ifYouDoContext.target.cost}`,
                targetResolver: {
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