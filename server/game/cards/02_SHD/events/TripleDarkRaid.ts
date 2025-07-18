import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { PhaseName, Trait, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class TripleDarkRaid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5696041568',
            internalName: 'triple-dark-raid',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search the top 7 cards of your deck for a Vehicle and play it. It costs 5 less and enters play ready. Return it to its owner\'s hand at the end of the phase',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 7,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 5 },
                        playAsType: WildcardCardType.Any,
                        entersReady: true
                    }),
                    AbilityHelper.immediateEffects.delayedCardEffect({
                        title: 'Return this to its owner\'s hand',
                        when: {
                            onPhaseEnded: (context) => context.phase === PhaseName.Action
                        },
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    })
                ])
            })
        });
    }
}
