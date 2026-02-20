import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Card } from '../../../core/card/Card';
import * as Contract from '../../../core/utils/Contract';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class L337RadicalInstigator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7958059435',
            internalName: 'l337#radical-instigator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 10 cards of your deck for any number of Droid units with combined cost 5 or less and play each of them for free',
            immediateEffect: abilityHelper.immediateEffects.playMultipleCardsFromDeck({
                activePromptTitle: 'Choose any Droid units with combined cost 5 or less to play for free',
                searchCount: 10,
                selectCount: 10,
                canChooseFewer: true,
                playAsType: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Droid),
                multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 5
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