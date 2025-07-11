import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class FennecShandHonoringTheDeal extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0911874487',
            internalName: 'fennec-shand#honoring-the-deal',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Play a unit that costs 4 or less from your hand. Give it ambush for this phase',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            cannotTargetFirst: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Play a unit that costs 4 or less from your hand. Give it ambush for this phase',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                }),
            }
        });
    }
}


