import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class StingerMantisWhereAreWeGoing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1545515980',
            internalName: 'stinger-mantis#where-are-we-going',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Deal 2 damage to an exhausted unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.canBeExhausted() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            }
        });
    }
}