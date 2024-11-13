import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Waylay extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7202133736',
            internalName: 'waylay',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a non-leader unit to its owner\'s hand',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

Waylay.implemented = true;