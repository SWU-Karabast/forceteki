import AbilityHelper from '../../../AbilityHelper';
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
                sameDiscardPile: true,
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
            }
        });
    }
}

Restock.implemented = true;
