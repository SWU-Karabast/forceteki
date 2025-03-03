import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class IG2000AssassinsAggressor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3722493191',
            internalName: 'ig2000#assassins-aggressor',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of up to 3 units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                multiSelectCardCondition: (card, selectedCards) => selectedCards.every((selectedCard) => selectedCard.title !== card.title),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}