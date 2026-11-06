import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, TargetMode, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class JynErsoHerFathersRevenge extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jyn-erso#her-fathers-revenge-id',
            internalName: 'jyn-erso#her-fathers-revenge',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Ready up to 3 units with combined cost 7 or less. They each gain ${TextHelper.Saboteur} for this phase.`,
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                multiSelectCardCondition: (card, selectedCards) => this.costSum(selectedCards.concat(card)) <= 7,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.ready(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        title: `Gains ${TextHelper.Saboteur} for this phase`,
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
                    })
                ])
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
}
