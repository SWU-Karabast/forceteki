import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class ChancellorPalpatineHowLibertyDies extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1020365882',
            internalName: 'chancellor-palpatine#how-liberty-dies',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Search the top 5 cards of your deck for a Plot card, reveal it, and draw it.',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Plot),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The next card you play using Plot this phase costs 3 less.',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Playable,
                    match: (card) => card.hasSomeKeyword(KeywordName.Plot), // TODO - this needs to be using playType.Plot instead
                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                    amount: 3
                })
            })
        });
    }
}