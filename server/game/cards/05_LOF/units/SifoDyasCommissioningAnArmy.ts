import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, Trait } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import { Contract } from '../../../core/utils/Contract';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class SifoDyasCommissioningAnArmy extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7488326298',
            internalName: 'sifodyas#commissioning-an-army',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: `Search the top 8 cards of your deck for any number of ${TextHelper.Trait.Clone} units with combined cost 4 or less and discard them. For this phase, you may play those cards from your discard pile for free.`,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                targetMode: TargetMode.Unlimited,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Clone),
                multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 4,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                            player: RelativePlayer.Self,
                            adjustCost: { costAdjustType: CostAdjustType.Free }
                        })
                    }),
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
