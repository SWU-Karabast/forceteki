import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, KeywordName, RelativePlayer, ZoneName } from '../../../core/Constants';
import { TargetingEnforcement } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class FennecShandHonoringTheDeal extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0911874487',
            internalName: 'fennec-shand#honoring-the-deal',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit that costs 4 or less from your hand. Give it ambush for this phase',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            cannotTargetFirst: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand(),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    targetingEnforcement: TargetingEnforcement.EnforceAll,
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit that costs 4 or less from your hand. Give it ambush for this phase',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand(),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    targetingEnforcement: TargetingEnforcement.EnforceAll,
                }),
            }
        });
    }
}


