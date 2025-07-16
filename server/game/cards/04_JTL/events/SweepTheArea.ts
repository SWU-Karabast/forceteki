import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';

export default class SweepTheArea extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7039711282',
            internalName: 'sweep-the-area',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Return up to 2 non-leader units in the same arena with a combined cost 3 or less to their owners\' hands.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                mode: TargetMode.UpTo,
                numCards: 2,
                multiSelectCardCondition: (card, selectedCards) => card.hasCost() && (card.cost + selectedCards.reduce((p, c) => p + (c.hasCost() ? c.cost : 0), 0) <= 3) && this.isSameZone(card, selectedCards),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
            }
        });
    }

    private isSameZone(card: Card, selectedCards: Card[]) {
        if (selectedCards.length > 0) {
            // Short-cut using the first card only -- as we can't add more selected cards without passing this test
            return card.zoneName === selectedCards[0].zoneName;
        }
        return true;
    }
}
