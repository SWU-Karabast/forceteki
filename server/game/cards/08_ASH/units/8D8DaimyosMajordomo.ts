import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class _8D8DaimyosMajordomo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8909316129',
            internalName: '8d8#daimyos-majordomo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to another friendly unit. If you do, search the top 5 cards of your deck for a unit, reveal it, and draw it.',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: {
                title: 'Search the top 5 cards of your deck for a unit, reveal it, and draw it',
                immediateEffect: abilityHelper.immediateEffects.deckSearch({
                    searchCount: 5,
                    cardCondition: (card) => card.isUnit(),
                    selectedCardsImmediateEffect: abilityHelper.immediateEffects.revealAndDraw({
                        useDisplayPrompt: true,
                        promptedPlayer: RelativePlayer.Opponent
                    })
                })
            }
        });
    }
}