import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardRelativePlayer, ZoneName } from '../../../core/Constants';

export default class Restock extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6087834273',
            internalName: 'restock'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose up to 4 cards in a discard pile. Put them on the bottom of their owner\'s deck in a random order',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 4,
                zoneFilter: ZoneName.Discard,
                controller: WildcardRelativePlayer.Any,
                multiSelectCardCondition: (card, selectedCards) => this.isSameZone(card, selectedCards),
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck({ shuffleMovedCards: true })
            }
        });
    }

    // Bundled with the zoneFilter:Discard to ensure cards are in same discard pile
    private isSameZone(card: Card, selectedCards: Card[]) {
        if (selectedCards.length > 0) {
            // Short-cut using the first card only -- as we can't add more selected cards without passing this test
            return card.zoneName === selectedCards[0].zoneName && card.owner === selectedCards[0].owner;
        }
        return true;
    }
}

Restock.implemented = true;
