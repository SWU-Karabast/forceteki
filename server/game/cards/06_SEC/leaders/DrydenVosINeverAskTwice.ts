import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class DrydenVosINeverAskTwice extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dryden-vos#i-never-ask-twice-id',
            internalName: 'dryden-vos#i-never-ask-twice',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a unit that costs 5 or less from your hand. It gains Ambush for this phase.',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.discardCardFromOwnHand({
                cardCondition: (card) => card.hasCost() && card.cost >= 6
            })],
            cannotTargetFirst: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 5,
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

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a unit from your hand. It gains Ambush for this phase.',
            cost: [AbilityHelper.costs.discardCardFromOwnHand()],
            cannotTargetFirst: true,
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Unit,
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