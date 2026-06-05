import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class VaneQuarrelsomePirate extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7995596096',
            internalName: 'vane#quarrelsome-pirate',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Deal 2 damage to a base',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.defeat({
                    activePromptTitle: 'Choose a friendly upgrade to defeat',
                    cardTypeFilter: WildcardCardType.Upgrade,
                    controller: RelativePlayer.Self
                })
            ],
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Defeat a friendly upgrade',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Deal 1 damage to the defender or a base',
                targetResolver: {
                    cardCondition: (card, context) => card.isBase() || context.event.attack.getAllTargets().includes(card),
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            }
        });
    }
}