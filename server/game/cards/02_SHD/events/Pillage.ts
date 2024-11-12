import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Location, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class Pillage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4772866341',
            internalName: 'pillage',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a player. They discard 2 cards from their hand.',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 2 }),
            }
        });
    }
}

Pillage.implemented = true;
