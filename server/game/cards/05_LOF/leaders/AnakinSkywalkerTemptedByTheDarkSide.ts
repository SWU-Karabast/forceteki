import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AnakinSkywalkerTemptedByTheDarkSide extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8536024453',
            internalName: 'anakin-skywalker#tempted-by-the-dark-side'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Play a Villainy non-unit card from your hand, ignoring its aspect penalties.',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.useTheForce()],
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                    playAsType: WildcardCardType.NonUnit
                })
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Play a Villainy non-unit card from your hand, ignoring its aspect penalties.',
            cost: AbilityHelper.costs.useTheForce(),
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                    playAsType: WildcardCardType.NonUnit
                })
            },
        });
    }
}
