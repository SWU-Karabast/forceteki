import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class HanSoloIGotAReallyGoodFeeling extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9738208208',
            internalName: 'han-solo#i-got-a-really-good-feeling',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a unit',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.defeat({
                    activePromptTitle: 'Choose a friendly token to defeat',
                    cardTypeFilter: WildcardCardType.Token,
                    controller: RelativePlayer.Self
                })
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Defeat any number of friendly tokens',
            targetResolver: {
                activePromptTitle: (_context, selectedCards) => `Defeat any number of friendly tokens (${selectedCards.length} selected)`,
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Token,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            then: (thenContext) => ({
                title: `Deal ${thenContext.target?.length ?? 0} damage to a unit`,
                thenCondition: (_) => thenContext.target && thenContext.target.length > 0,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: thenContext.target?.length ?? 0,
                    })
                }
            })
        });
    }
}