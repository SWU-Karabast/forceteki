import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PrincessLeiaCalculatedDistraction extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'princess-leia#calculated-distraction-id',
            internalName: 'princess-leia#calculated-distraction',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust up to 2 units in the same arena with combined cost 4 or less',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                multiSelectCardCondition: (card, selectedCards) =>
                    this.costSum(selectedCards.concat(card)) <= 4 && this.isSameZone(card, selectedCards),
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }

    private costSum(cards: Card[]): number {
        let costSum = 0;
        for (const card of cards) {
            if (card.isUnit()) {
                costSum += card.cost;
            }
        }
        return costSum;
    }

    private isSameZone(card: Card, selectedCards: Card[]): boolean {
        if (selectedCards.length > 0) {
            // Short-cut using the first card only -- as we can't add more selected cards without passing this test
            return card.zoneName === selectedCards[0].zoneName;
        }
        return true;
    }
}
