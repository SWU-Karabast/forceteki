import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DarthVaderUnstoppable extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2554022314',
            internalName: 'darth-vader#unstoppable',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a unit or base',
            cost: [abilityHelper.costs.discardCardFromOwnHand(), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard any number of cards from your hand. Deal damage to a unit or base equal to the number of cards discarded this way',
            targetResolver: {
                mode: TargetMode.UpToVariable,
                numCardsFunc: (context) => context.player.hand?.length ?? 0,
                canChooseNoCards: true,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
            },
            then: (thenContext) => ({
                thenCondition: () => thenContext.targets.target && thenContext.targets.target.length >= 1,
                title: 'Deal damage to a unit or base equal to the number of cards discarded this way',
                targetResolver: {
                    activePromptTitle: `Deal ${thenContext.targets.target?.length} damage to a unit or base`,
                    cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: thenContext.targets.target?.length })
                }
            })
        });
    }
}
