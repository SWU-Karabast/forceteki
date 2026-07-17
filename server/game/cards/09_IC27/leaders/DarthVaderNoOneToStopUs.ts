import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DarthVaderNoOneToStopUs extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-vader#no-one-to-stop-us-id',
            internalName: 'darth-vader#no-one-to-stop-us',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Draw a card and heal 2 damage from your base',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.defeat({
                    activePromptTitle: 'Choose a friendly unit to defeat',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat another friendly unit. If you do, draw a card and heal 2 damage from your base',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Defeat another friendly unit',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Draw a card and heal 2 damage from your base',
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
                    AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
                ])
            }
        });
    }
}
