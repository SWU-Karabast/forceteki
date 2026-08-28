import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { Card } from '../../../core/card/Card';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import { Contract } from '../../../core/utils/Contract';

export default class TwilekKalikori extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'twilek-kalikori-id',
            internalName: 'twilek-kalikori',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Search the top 8 cards of your deck for any number of ${TextHelper.Trait.Twilek} units with a combined cost 5 or less and play each of them for free`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Twilek) ?? false,
                onTrue: abilityHelper.immediateEffects.playMultipleCardsFromDeck({
                    activePromptTitle: `Choose any number of ${TextHelper.Trait.Twilek} units with combined cost 5 or less to play for free`,
                    searchCount: 8,
                    selectCount: 8,
                    canChooseFewer: true,
                    playAsType: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Twilek),
                    multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 5
                })
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
