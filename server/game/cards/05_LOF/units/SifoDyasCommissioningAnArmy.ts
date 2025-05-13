import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import * as Contract from '../../../core/utils/Contract';

export default class SifoDyasCommissioningAnArmy extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7488326298',
            internalName: 'sifodyas#commissioning-an-army',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Search the top 8 cards of your deck for any number of Clone units with combined cost 4 or less and discard them. For this phase, you may play those cards from your discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                targetMode: TargetMode.Unlimited,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Clone),
                multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 4,
                playAsType: WildcardCardType.Unit,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect((deckSearchContext) => ({
                        effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({ player: deckSearchContext.player })
                    })),
                    AbilityHelper.immediateEffects.forThisPhasePlayerEffect((deckSearchContext) => ({
                        effect: AbilityHelper.ongoingEffects.forFree({
                            match: (card) => deckSearchContext.selectedPromptCards.includes(card)
                        }),
                        targetController: deckSearchContext.player
                    })),
                ]),
            })
        });
    }

    private costSum(cards: Card[]): number {
        let costSum = 0;
        for (const card of cards) {
            Contract.assertTrue(card.isUnit());
            costSum += card.cost;
        }
        return costSum;
    }
}
