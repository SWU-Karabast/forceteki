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
            title: 'Pay any number of resources. For every 3 resources paid this way, deal damage equal to this unit\'s power to an enemy unit',
            contextTitle: (context) => `Pay any number of resources. For every 3 resources paid this way, deal ${context.source.getPower()} damage to an enemy unit`,
            targetResolver: {
                mode: TargetMode.ChooseNumber,
                min: 0,
                max: (context) => context.player.readyResourceCount,
                immediateEffect: AbilityHelper.immediateEffects.payResourcesWithoutAdjustment((context) => ({
                    amount: parseInt(context.select),
                    target: context.player
                })),
            },
            then: (thenContext) => ({
                title: `Deal ${thenContext.source.getPower()} damage to an enemy unit`,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                    Array.from({ length: Math.floor(parseInt(thenContext.select) / 3) }, () =>
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `Deal ${thenContext.source.getPower()} damage to an enemy unit`,
                            cardTypeFilter: WildcardCardType.Unit,
                            controller: RelativePlayer.Opponent,
                            immediateEffect: AbilityHelper.immediateEffects.damage({
                                amount: thenContext.source.getPower(),
                            })
                        })
                    )
                )
            })
        });
    }
}
