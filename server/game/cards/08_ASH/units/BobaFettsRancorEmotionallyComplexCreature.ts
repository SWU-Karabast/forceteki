import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BobaFettsRancorEmotionallyComplexCreature extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2424880043',
            internalName: 'boba-fetts-rancor#emotionally-complex-creature',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 5 damage to your base',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 5,
                target: context.player.base,
            })),
            then: {
                title: 'Deal 5 damage to an enemy ground unit. Then, deal 5 damage to the same unit.',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.damage({ amount: 5 }),
                        AbilityHelper.immediateEffects.damage({ amount: 5 })
                    ])
                }
            }
        });
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a base for every 5 damage on your base',
            contextTitle: (context) => `Deal ${Math.floor(context.player.base.damage / 5)} damage to a base`,
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Deal ${Math.floor(context.player.base.damage / 5)} damage to a base`,
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: Math.floor(context.player.base.damage / 5) }))
            }
        });
    }
}