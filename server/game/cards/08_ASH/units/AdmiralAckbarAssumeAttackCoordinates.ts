import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Card } from '../../../core/card/Card';
import { Contract } from '../../../core/utils/Contract';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AdmiralAckbarAssumeAttackCoordinates extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2541287519',
            internalName: 'admiral-ackbar#assume-attack-coordinates',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat this unit. If you do, search the top 10 cards of your deck for any number of space units with combined cost 5 or less and play each of them for free.',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source })),
            ifYouDo: ({
                title: 'Search the top 10 cards of your deck for any number of space units with combined cost 5 or less and play each of them for free.',
                immediateEffect: abilityHelper.immediateEffects.playMultipleCardsFromDeck({
                    activePromptTitle: 'Choose any Space units with combined cost 5 or less to play for free',
                    searchCount: 10,
                    selectCount: 10,
                    canChooseFewer: true,
                    playAsType: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.defaultArena === ZoneName.SpaceArena,
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