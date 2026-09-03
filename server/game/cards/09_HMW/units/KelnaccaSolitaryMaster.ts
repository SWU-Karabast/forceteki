import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KelnaccaSolitaryMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'kelnacca#solitary-master-id',
            internalName: 'kelnacca#solitary-master',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'You may pay any number of resources. For every 3 resources paid this way, deal damage equal to this unit\'s power to an enemy unit',
            targetResolver: {
                mode: TargetMode.ChooseNumber,
                min: 0,
                max: (context) => context.player.readyResourceCount,
            },
            then: (thenContext) => ({
                title: 'Pay the chosen number of resources',
                immediateEffect: AbilityHelper.immediateEffects.payResourcesWithoutAdjustment({
                    amount: parseInt(thenContext.select),
                    target: thenContext.player
                }),
                then: {
                    title: 'Deal damage equal to this unit\'s power to an enemy unit',
                    thenCondition: (context) =>
                        Math.floor(parseInt(thenContext.select) / 3) >= 1 &&
                        context.player.opponent.hasSomeArenaUnit(),
                    immediateEffect: AbilityHelper.immediateEffects.sequential(
                        Array.from({ length: Math.floor(parseInt(thenContext.select) / 3) }, () =>
                            AbilityHelper.immediateEffects.selectCard({
                                activePromptTitle: `Deal ${thenContext.source.getPower()} damage to an enemy unit`,
                                cardTypeFilter: WildcardCardType.Unit,
                                controller: RelativePlayer.Opponent,
                                immediateEffect: AbilityHelper.immediateEffects.damage({
                                    amount: thenContext.source.getPower(),
                                    source: thenContext.source,
                                })
                            })
                        )
                    )
                }
            })
        });
    }
}
